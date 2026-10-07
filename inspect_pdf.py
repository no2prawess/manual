import pymupdf
import json
import os

doc = pymupdf.open("민원사무편람 책자(화물팀).pdf")
print(f"Total pages: {len(doc)}")

pages_data = []
for i, page in enumerate(doc):
    text = page.get_text("text")
    print(f"--- PAGE {i+1} ---")
    print(text[:300].strip())
    print("...")
    pages_data.append({
        "page": i + 1,
        "text": text
    })

with open("pdf_pages_dump.json", "w", encoding="utf-8") as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=2)

print("Saved dump to pdf_pages_dump.json")
