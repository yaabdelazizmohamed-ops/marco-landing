"""
Downloads Google Fonts woff2 files for self-hosting.
Generates /fonts/ directory and /styles/fonts.css.
"""
import os, re, sys, urllib.request

FONTS_DIR = os.path.join(os.path.dirname(__file__), "..", "fonts")
CSS_OUT   = os.path.join(os.path.dirname(__file__), "..", "styles", "fonts.css")

# Exact URLs used in public pages (union of all public HTML files)
GOOGLE_FONT_URLS = [
    # Landing (index.html) — Fraunces variable + DM Sans
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,500;1,600&display=swap",
    # Legal pages — adds Instrument Serif
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,500;1,600&display=swap",
]

# Chrome UA to get woff2 (Google returns woff otherwise)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def fetch_text(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read().decode("utf-8")

def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read()

def main():
    os.makedirs(FONTS_DIR, exist_ok=True)

    all_face_blocks = []
    seen_urls = set()

    for gf_url in GOOGLE_FONT_URLS:
        print(f"Fetching CSS: {gf_url[:80]}…")
        css = fetch_text(gf_url)

        # Split into @font-face blocks
        blocks = re.findall(r'@font-face\s*\{[^}]+\}', css, re.DOTALL)
        for block in blocks:
            # Extract src woff2 url
            m = re.search(r"src:\s*url\(([^)]+)\)\s*format\('woff2'\)", block)
            if not m:
                continue
            woff2_url = m.group(1)
            if woff2_url in seen_urls:
                continue
            seen_urls.add(woff2_url)

            # Build a safe local filename from the url
            fname = woff2_url.split("/")[-1].split("?")[0]
            local_path = os.path.join(FONTS_DIR, fname)

            if not os.path.exists(local_path):
                print(f"  Downloading {fname}")
                data = fetch_bytes(woff2_url)
                with open(local_path, "wb") as f:
                    f.write(data)
            else:
                print(f"  Exists: {fname}")

            # Rewrite block to use local path
            local_ref = f"/fonts/{fname}"
            new_block = re.sub(
                r"src:\s*url\([^)]+\)\s*format\('woff2'\)[^;]*;",
                f"src: url('{local_ref}') format('woff2');",
                block
            )
            # Remove /* comment */ font-face comments for cleanliness
            new_block = re.sub(r'/\*[^*]*\*/', '', new_block).strip()
            all_face_blocks.append(new_block)

    css_content = "/* Auto-generated — do not edit. Run scripts/download_fonts.py to regenerate. */\n\n"
    css_content += "\n\n".join(all_face_blocks) + "\n"

    with open(CSS_OUT, "w", encoding="utf-8") as f:
        f.write(css_content)

    print(f"\nDone. {len(seen_urls)} font files, CSS written to styles/fonts.css")

if __name__ == "__main__":
    main()
