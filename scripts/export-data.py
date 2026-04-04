#!/usr/bin/env python3
"""
Export published posts from SQLite → patterns.json + WebP images.

Usage:
    python scripts/export-data.py          # from web/ directory
    python web/scripts/export-data.py      # from project root

Incremental: skips images already converted to WebP.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# Resolve paths relative to project root
SCRIPT_DIR = Path(__file__).resolve().parent
WEB_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = WEB_DIR.parent

# Add project root to import database module
sys.path.insert(0, str(PROJECT_ROOT))

from database import get_conn, DOWNLOADS_DIR

OUTPUT_JSON = WEB_DIR / "src" / "content" / "patterns.json"
OUTPUT_IMAGES = WEB_DIR / "public" / "images"

# Image sizes: name → max width
SIZES = {
    "thumb": 300,
    "medium": 800,
    "full": 1600,
}


def slugify(text: str, note_id: str) -> str:
    """Generate URL-friendly slug from title, fallback to note_id.
    Only keeps ASCII letters, digits, and hyphens."""
    if not text:
        return note_id
    s = text.lower().strip()
    # Only keep ASCII alphanumeric and spaces/hyphens
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:80] if s else note_id


def convert_image(src: Path, dest_dir: Path, sizes: dict[str, int]):
    """Convert a single image to WebP at multiple sizes. Skip if already exists."""
    from PIL import Image

    for size_name, max_w in sizes.items():
        dest = dest_dir / f"{src.stem}_{size_name}.webp"
        if dest.exists():
            continue

        try:
            with Image.open(src) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                if size_name == "full":
                    # Keep original dimensions, just convert to WebP
                    img.save(dest, "WEBP", quality=85)
                else:
                    # Resize if wider than max
                    if img.width > max_w:
                        ratio = max_w / img.width
                        new_h = int(img.height * ratio)
                        img = img.resize((max_w, new_h), Image.LANCZOS)
                    img.save(dest, "WEBP", quality=82)

            print(f"  [img] {dest.name}")
        except Exception as e:
            print(f"  [err] {src.name} → {size_name}: {e}")


def export():
    conn = get_conn()

    # Get published posts
    posts = conn.execute("""
        SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC
    """).fetchall()

    if not posts:
        print("No published posts found. Mark posts as published in the admin UI first.")
        conn.close()
        return

    print(f"Exporting {len(posts)} published posts...")

    patterns_data = []

    for post in posts:
        post = dict(post)
        post_id = post["id"]
        note_id = post["note_id"]
        tags = json.loads(post.get("tags") or "[]")

        # Get images
        images = conn.execute(
            "SELECT * FROM images WHERE post_id = ? ORDER BY sort_order",
            (post_id,)
        ).fetchall()
        images = [dict(img) for img in images]

        # Get patterns (translated text)
        patterns = conn.execute(
            "SELECT * FROM patterns WHERE post_id = ? ORDER BY id",
            (post_id,)
        ).fetchall()
        patterns = [dict(p) for p in patterns]

        # Extract English title from translated pattern first line
        eng_title_from_pattern = ""
        if patterns:
            eng_first_line = (patterns[0].get("english_text") or "").split("\n")[0]
            eng_first_line = eng_first_line.strip("-— ").strip()
            eng_title_from_pattern = re.split(r"\s*[—–]\s*", eng_first_line)[0].strip()

        # Auto-fill title_en if empty
        if not post.get("title_en") and eng_title_from_pattern:
            # Clean: remove parenthesized Chinese text like "(小山雀)"
            clean_title = re.sub(r"\s*\([^)]*[\u4e00-\u9fff][^)]*\)", "", eng_title_from_pattern).strip()
            if clean_title and not re.match(r"^(Rnd|Row|Step|Round|Ch |Sc |Using)", clean_title):
                conn.execute("UPDATE posts SET title_en = ? WHERE id = ?", (clean_title, post_id))
                conn.commit()
                post["title_en"] = clean_title

        # Determine slug: manual > english title from pattern > note_id
        slug = post.get("slug") or ""
        if not slug:
            candidate = slugify(eng_title_from_pattern, "")
            if candidate and len(candidate) <= 50 and not re.match(r"^(rnd|row|step|round|ch-|sc-|using)", candidate):
                slug = candidate
        if not slug:
            slug = note_id
            print(f"  [!] No good English slug for '{post.get('title', '')}', using note_id. Set slug manually in admin.")

        # Convert images to WebP
        img_dir = OUTPUT_IMAGES / slug
        img_dir.mkdir(parents=True, exist_ok=True)
        src_dir = DOWNLOADS_DIR / note_id

        image_entries = []
        for img in images:
            src_path = src_dir / img["filename"]
            if src_path.exists():
                convert_image(src_path, img_dir, SIZES)
                stem = Path(img["filename"]).stem
                image_entries.append({
                    "filename": img["filename"],
                    "type": img["image_type"],
                    "thumb": f"/images/{slug}/{stem}_thumb.webp",
                    "medium": f"/images/{slug}/{stem}_medium.webp",
                    "full": f"/images/{slug}/{stem}_full.webp",
                })

        # Separate product photos and diagrams
        product_photos = [i for i in image_entries if i["type"] == "product_photo"]
        diagrams = [i for i in image_entries if i["type"] in ("crochet_diagram", "text_diagram", "symbol_diagram")]

        pattern_entry = {
            "id": post_id,
            "slug": slug,
            "title": post.get("title_en") or post.get("title") or note_id,
            "description": post.get("description") or "",
            "author": post.get("author") or "",
            "tags": tags,
            "createdAt": post.get("created_at") or "",
            "productPhotos": product_photos,
            "diagrams": diagrams,
            "allImages": image_entries,
            "patterns": [
                {
                    "englishText": p.get("english_text") or "",
                    "chineseText": p.get("chinese_text") or "",
                    "notes": p.get("notes") or "",
                }
                for p in patterns
            ],
        }
        patterns_data.append(pattern_entry)
        print(f"  [{slug}] {len(image_entries)} images, {len(patterns)} patterns")

    conn.close()

    # Write JSON
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(patterns_data, ensure_ascii=False, indent=2))
    print(f"\nDone! {len(patterns_data)} patterns → {OUTPUT_JSON}")

    # Collect all tags for reference
    all_tags = sorted(set(t for p in patterns_data for t in p["tags"]))
    if all_tags:
        print(f"Tags in use: {', '.join(all_tags)}")
    else:
        print("No tags set yet. Add tags in the admin UI.")


if __name__ == "__main__":
    export()
