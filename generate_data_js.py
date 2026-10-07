import json

with open("data/civil_services.json", "r", encoding="utf-8") as f:
    services = json.load(f)

js_content = f"// Namyangju City Cargo Team Civil Services Data\nwindow.CIVIL_SERVICES_DATA = {json.dumps(services, ensure_ascii=False, indent=2)};\n"

with open("data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"data.js generated successfully with {len(services)} services.")
