import os
import shutil
import pypdfium2 as pdfium

src_pdf = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\유가보조금 서면신청\[별지 1] 화물자동차 유가보조금 지급 신청서.pdf"
dest_dir = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\documents\civil\fuel-subsidy-written"
dest_pdf = os.path.join(dest_dir, "form.pdf")
dest_img = os.path.join(dest_dir, "form-page-01.png")

os.makedirs(dest_dir, exist_ok=True)

# 1. Copy PDF
shutil.copy2(src_pdf, dest_pdf)
print(f"Copied PDF to: {dest_pdf}")

# 2. Extract image using pypdfium2
pdf = pdfium.PdfDocument(src_pdf)
print(f"Total pages: {len(pdf)}")

page = pdf[0]
# Render at 300 DPI (scale = 300 / 72 = 4.166)
image = page.render(scale=3).to_pil()
image.save(dest_img, format="PNG")
print(f"Extracted and saved page 1 image to: {dest_img}")

# If there are additional pages, extract them as well just in case
for i in range(1, len(pdf)):
    sub_page = pdf[i]
    sub_img = sub_page.render(scale=3).to_pil()
    sub_dest = os.path.join(dest_dir, f"form-page-0{i+1}.png")
    sub_img.save(sub_dest, format="PNG")
    print(f"Extracted and saved page {i+1} image to: {sub_dest}")
