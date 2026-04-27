#!/usr/bin/env python3
"""
Blog cover image generator — calls Gemini 3 Pro Image API.

Usage:
  python generate-cover.py --prompt "Your image prompt here"
  python generate-cover.py --prompt-file prompt.txt
  python generate-cover.py --prompt-file prompt.txt --reference reference.png
  python generate-cover.py --prompt-file prompt.txt --output my-cover.png --size 2K --aspect 16:9
"""

import argparse
import base64
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_MODEL = "gemini-3-pro-image-preview"
DEFAULT_ASPECT = "16:9"
DEFAULT_SIZE = "2K"
SKILL_DIR = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_DIR = SKILL_DIR / "output"


def load_api_key():
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key

    env_file = SKILL_DIR / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip("\"'")

    print("ERROR: GEMINI_API_KEY not found. Set it as env var or in .env", file=sys.stderr)
    sys.exit(1)


def resolve_output_path(output_arg):
    if not output_arg:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        return DEFAULT_OUTPUT_DIR / f"{timestamp}-cover.png"

    output_path = Path(output_arg)
    if not output_path.is_absolute() and output_path.parent == Path("."):
        return DEFAULT_OUTPUT_DIR / output_path
    return output_path


def resolve_prompt_archive_path(output_path):
    return output_path.with_name(f"{output_path.stem}-prompt.txt")


def load_image_as_base64(path):
    data = Path(path).read_bytes()
    ext = Path(path).suffix.lower()
    mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(ext, "image/png")
    return base64.b64encode(data).decode(), mime


def generate_image(
    prompt,
    reference_path=None,
    model=DEFAULT_MODEL,
    aspect_ratio=DEFAULT_ASPECT,
    image_size=DEFAULT_SIZE,
):
    api_key = load_api_key()
    url = f"{API_BASE}/{model}:generateContent"

    parts = []

    if reference_path:
        img_b64, mime = load_image_as_base64(reference_path)
        parts.append({"inlineData": {"mimeType": mime, "data": img_b64}})

    parts.append({"text": prompt})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "imageSize": image_size,
            },
        },
    }

    req = urllib.request.Request(
        f"{url}?key={api_key}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"API error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)

    for candidate in body.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            inline = part.get("inlineData")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])

    print("ERROR: No image data in API response.", file=sys.stderr)
    print(json.dumps(body, indent=2, ensure_ascii=False), file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate blog cover image via Gemini 3 Pro")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prompt", help="Image generation prompt text")
    group.add_argument("--prompt-file", help="Path to a text file containing the prompt")
    parser.add_argument("--reference", help="Path to a reference style image (optional)")
    parser.add_argument("--output", help="Output image path (default: output/<YYYYMMDD-HHMMSS>-cover.png; bare filenames are saved under output/)")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model name (default: {DEFAULT_MODEL})")
    parser.add_argument("--aspect", default=DEFAULT_ASPECT, help=f"Aspect ratio (default: {DEFAULT_ASPECT})")
    parser.add_argument("--size", default=DEFAULT_SIZE, choices=["512", "1K", "2K", "4K"], help=f"Image size (default: {DEFAULT_SIZE})")

    args = parser.parse_args()

    if args.prompt_file:
        prompt = Path(args.prompt_file).read_text().strip()
    else:
        prompt = args.prompt

    if not prompt:
        print("ERROR: Prompt is empty.", file=sys.stderr)
        sys.exit(1)

    output_path = resolve_output_path(args.output)
    prompt_archive_path = resolve_prompt_archive_path(output_path)

    print(f"Model:   {args.model}")
    print(f"Size:    {args.size}")
    print(f"Aspect:  {args.aspect}")
    if args.reference:
        print(f"Ref img: {args.reference}")
    print(f"Output:  {output_path}")
    print(f"Prompt archive: {prompt_archive_path}")
    print(f"Prompt:  {prompt[:120]}{'...' if len(prompt) > 120 else ''}")
    print()
    print("Generating image...")

    image_bytes = generate_image(
        prompt=prompt,
        reference_path=args.reference,
        model=args.model,
        aspect_ratio=args.aspect,
        image_size=args.size,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_archive_path.write_text(prompt + "\n", encoding="utf-8")
    output_path.write_bytes(image_bytes)
    print(f"Done! Saved to {output_path} ({len(image_bytes)} bytes)")
    print(f"Prompt saved to {prompt_archive_path}")


if __name__ == "__main__":
    main()
