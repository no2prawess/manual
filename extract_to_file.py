import pymupdf
import json

doc = pymupdf.open("민원사무편람 책자(화물팀).pdf")

results = []

for page_idx, page in enumerate(doc):
    text = page.get_text("text")
    results.append({
        "pdf_page": page_idx + 1,
        "text": text
    })

with open("extracted_pages_raw.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

with open("extracted_pages_summary.txt", "w", encoding="utf-8") as f:
    for r in results:
        f.write(f"==================== PAGE {r['pdf_page']} ====================\n")
        f.write(r['text'])
        f.write("\n\n")

print("Finished extracting all pages to UTF-8 files.")
