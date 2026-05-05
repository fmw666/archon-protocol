#!/usr/bin/env node
/**
 * Comic explainer image generator - calls Gemini image API.
 *
 * Usage:
 *   node generate-cover.mjs --prompt "Your image prompt here"
 *   node generate-cover.mjs --prompt-file prompt.txt
 *   node generate-cover.mjs --prompt-file prompt.txt --reference reference.png
 *   node generate-cover.mjs --prompt-file prompt.txt --output my-cover.png --size 2K --aspect 16:9
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3-pro-image-preview";
const DEFAULT_ASPECT = "16:9";
const DEFAULT_SIZE = "2K";
const VALID_SIZES = new Set(["512", "1K", "2K", "4K"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillDir = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`usage: generate-cover.mjs (--prompt PROMPT | --prompt-file PROMPT_FILE)
                          [--reference REFERENCE] [--output OUTPUT]
                          [--model MODEL] [--aspect ASPECT]
                          [--size 512|1K|2K|4K] [--proxy PROXY_URL]

Generate comic explainer image via Gemini image API

options:
  -h, --help            show this help message and exit
  --prompt PROMPT       Image generation prompt text
  --prompt-file FILE    Path to a text file containing the prompt
  --reference FILE      Path to a reference style image (optional)
  --output FILE         Output image path (default: docs/public/images/comic-<timestamp>.png)
  --model MODEL         Model name (default: ${DEFAULT_MODEL})
  --aspect ASPECT       Aspect ratio (default: ${DEFAULT_ASPECT})
  --size SIZE           Image size: 512, 1K, 2K, or 4K (default: ${DEFAULT_SIZE})
  --proxy PROXY_URL     Optional HTTP proxy, e.g. http://127.0.0.1:6984`);
}

function parseArgs(argv) {
  const args = {
    model: DEFAULT_MODEL,
    aspect: DEFAULT_ASPECT,
    size: DEFAULT_SIZE,
  };
  const valueOptions = new Set([
    "--prompt",
    "--prompt-file",
    "--reference",
    "--output",
    "--model",
    "--aspect",
    "--size",
    "--proxy",
  ]);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      args.help = true;
      continue;
    }

    if (!valueOptions.has(arg)) {
      throw new Error(`Unknown option: ${arg}`);
    }

    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    args[key] = value;
    i += 1;
  }

  if (args.help) {
    return args;
  }

  if (Boolean(args.prompt) === Boolean(args.promptFile)) {
    throw new Error("Provide exactly one of --prompt or --prompt-file.");
  }

  if (!VALID_SIZES.has(args.size)) {
    throw new Error("--size must be one of: 512, 1K, 2K, 4K.");
  }

  return args;
}

async function loadApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  const envFile = path.join(skillDir, ".env");
  if (existsSync(envFile)) {
    const envText = await readFile(envFile, "utf8");
    for (const rawLine of envText.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line.startsWith("GEMINI_API_KEY=")) {
        return line.split("=", 2)[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  throw new Error("GEMINI_API_KEY not found. Set it as env var or in .env");
}

async function loadImageAsInlineData(filePath) {
  const data = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType =
    {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    }[ext] ?? "image/png";

  return {
    inlineData: {
      mimeType,
      data: data.toString("base64"),
    },
  };
}

async function generateImage({ prompt, referencePath, model, aspectRatio, imageSize, proxy }) {
  const apiKey = await loadApiKey();
  const parts = [];

  if (referencePath) {
    parts.push(await loadImageAsInlineData(referencePath));
  }

  parts.push({ text: prompt });

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  const proxyUrl = proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;
  if (proxyUrl) {
    return generateImageWithCurl({
      apiKey,
      model,
      payload,
      proxy: proxyUrl,
    });
  }

  const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new Error(`API returned non-JSON response (${response.status}): ${bodyText}`);
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${JSON.stringify(body, null, 2)}`);
  }

  for (const candidate of body.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) {
        return Buffer.from(inline.data, "base64");
      }
    }
  }

  throw new Error(`No image data in API response:\n${JSON.stringify(body, null, 2)}`);
}

function generateImageWithCurl({ apiKey, model, payload, proxy }) {
  const curl = process.platform === "win32" ? "curl.exe" : "curl";
  const result = spawnSync(
    curl,
    [
      "-sS",
      "--fail-with-body",
      "-x",
      proxy,
      "-X",
      "POST",
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      "@-",
      `${API_BASE}/${model}:generateContent?key=${apiKey}`,
    ],
    {
      input: JSON.stringify(payload),
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`curl failed (${result.status}): ${result.stderr || result.stdout}`);
  }

  let body;
  try {
    body = JSON.parse(result.stdout);
  } catch {
    throw new Error(`API returned non-JSON response: ${result.stdout}`);
  }

  for (const candidate of body.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) {
        return Buffer.from(inline.data, "base64");
      }
    }
  }

  throw new Error(`No image data in API response:\n${JSON.stringify(body, null, 2)}`);
}

function timestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+$/, "")
    .replace("T", "-");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const prompt = args.promptFile
    ? (await readFile(args.promptFile, "utf8")).trim()
    : args.prompt;

  if (!prompt) {
    throw new Error("Prompt is empty.");
  }

  const outputPath = args.output ?? path.join("docs", "public", "images", `comic-${timestamp()}.png`);

  console.log(`Model:   ${args.model}`);
  console.log(`Size:    ${args.size}`);
  console.log(`Aspect:  ${args.aspect}`);
  if (args.reference) {
    console.log(`Ref img: ${args.reference}`);
  }
  console.log(`Output:  ${outputPath}`);
  console.log(`Prompt:  ${prompt.slice(0, 120)}${prompt.length > 120 ? "..." : ""}`);
  console.log();
  console.log("Generating image...");

  const imageBytes = await generateImage({
    prompt,
    referencePath: args.reference,
    model: args.model,
    aspectRatio: args.aspect,
    imageSize: args.size,
    proxy: args.proxy,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, imageBytes);
  console.log(`Done! Saved to ${outputPath} (${imageBytes.length} bytes)`);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
