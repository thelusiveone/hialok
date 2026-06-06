from pathlib import Path
import yaml
import markdown
from datetime import datetime

BLOG_DIR = Path(__file__).resolve().parent.parent.parent / "content" / "blog"

_md = markdown.Markdown(
    extensions=["fenced_code", "codehilite", "tables", "toc", "meta"],
    extension_configs={
        "codehilite": {"css_class": "highlight", "linenums": False},
    },
)


def _parse_post(md_file: Path) -> dict:
    raw = md_file.read_text(encoding="utf-8")
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return {}
    frontmatter = yaml.safe_load(parts[1])
    content = parts[2].strip()
    word_count = len(content.split())
    frontmatter["slug"] = md_file.stem
    frontmatter["reading_time"] = f"{max(1, word_count // 200)} min read"
    frontmatter["word_count"] = word_count
    return frontmatter, content


def get_all_posts() -> list[dict]:
    posts = []
    for md_file in sorted(BLOG_DIR.glob("*.md")):
        try:
            meta, _ = _parse_post(md_file)
            if meta:
                posts.append(meta)
        except Exception:
            continue
    return sorted(posts, key=lambda p: p.get("date", datetime.min), reverse=True)


def get_post(slug: str) -> dict | None:
    md_file = BLOG_DIR / f"{slug}.md"
    if not md_file.exists():
        return None
    try:
        meta, content = _parse_post(md_file)
        _md.reset()
        meta["content"] = _md.convert(content)
        meta["toc"] = getattr(_md, "toc", "")
        return meta
    except Exception:
        return None
