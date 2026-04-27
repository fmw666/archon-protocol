#!/usr/bin/env python3
"""
Four-panel comic image generator — calls the Gemini image API.

Usage:
  python generate-comic.py --prompt "Your image prompt here"
  python generate-comic.py --prompt-file prompt.txt
  python generate-comic.py --prompt-file prompt.txt --reference reference.png
  python generate-comic.py --prompt-file prompt.txt --output comic.png --size 2K --aspect 9:16
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_MODEL = "gemini-3-pro-image-preview"
DEFAULT_ASPECT = "9:16"
DEFAULT_SIZE = "2K"


def load_api_key():
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key

    env_file = Path(__file__).resolve().parent.parent / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip("\"'")

    print("ERROR: GEMINI_API_KEY not found. Set it as env var or in .env", file=sys.stderr)
    sys.exit(1)


def load_image_as_base64(path):
    data = Path(path).read_bytes()
    ext = Path(path).suffix.lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }.get(ext, "image/png")
    return base64.b64encode(data).decode(), mime


def generate_image(prompt, reference_path=None, model=DEFAULT_MODEL, aspect_ratio=DEFAULT_ASPECT, image_size=DEFAULT_SIZE):
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
    parser = argparse.ArgumentParser(description="Generate a vertical 4-panel comic via Gemini")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prompt", help="Image generation prompt text")
    group.add_argument("--prompt-file", help="Path to a text file containing the prompt")
    parser.add_argument("--reference", help="Path to a reference style image (optional)")
    parser.add_argument("--output", help="Output image path (default: comic-<timestamp>.png)")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model name (default: {DEFAULT_MODEL})")
    parser.add_argument("--aspect", default=DEFAULT_ASPECT, help=f"Aspect ratio (default: {DEFAULT_ASPECT})")
    parser.add_argument("--size", default=DEFAULT_SIZE, choices=["512", "1K", "2K", "4K"], help=f"Image size (default: {DEFAULT_SIZE})")
    args = parser.parse_args()

    prompt = Path(args.prompt_file).read_text().strip() if args.prompt_file else args.prompt
    if not prompt:
        print("ERROR: Prompt is empty.", file=sys.stderr)
        sys.exit(1)

    output_path = args.output or f"comic-{datetime.now().strftime('%Y%m%d-%H%M%S')}.png"

    print(f"Model:  {args.model}")
    print(f"Size:   {args.size}")
    print(f"Aspect: {args.aspect}")
    if args.reference:
        print(f"Ref:    {args.reference}")
    print(f"Output: {output_path}")
    print(f"Prompt: {prompt[:120]}{'...' if len(prompt) > 120 else ''}")
    print()
    print("Generating image...")

    image_bytes = generate_image(
        prompt=prompt,
        reference_path=args.reference,
        model=args.model,
        aspect_ratio=args.aspect,
        image_size=args.size,
    )
    Path(output_path).write_bytes(image_bytes)
    print(f"Done! Saved to {output_path} ({len(image_bytes)} bytes)")


if __name__ == "__main__":
    main()
