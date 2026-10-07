import pymupdf
import json
import re

doc = pymupdf.open("민원사무편람 책자(화물팀).pdf")
pages_data = []

for i, page in enumerate(doc):
    text = page.get_text("text")
    pages_data.append({
        "page": i + 1,
        "text": text
    })

with open("pdf_pages_dump.json", "w", encoding="utf-8") as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=2)

print("Saved all pages successfully. Analyzing sections...")

# Let's see all page titles or headings
for p in pages_data:
    lines = [l.strip() for l in p["text"].split("\n") if l.strip()]
    first_few = " | ".join(lines[:6])
    print(f"Page {p['page']}: {first_few[:120]}")
