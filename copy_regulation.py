import os
import shutil

src_pdf = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\유가보조금 서면신청\화물자동차 유가보조금 관리 규정(국토교통부고시)(제2026-384호)(20260716).pdf"
dest_dir = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\documents\civil\fuel-subsidy-written"
dest_pdf = os.path.join(dest_dir, "regulation.pdf")
dest_pdf_kr = os.path.join(dest_dir, "화물자동차 유가보조금 관리 규정(국토교통부고시)(제2026-384호)(20260716).pdf")

os.makedirs(dest_dir, exist_ok=True)
shutil.copy2(src_pdf, dest_pdf)
shutil.copy2(src_pdf, dest_pdf_kr)
print(f"Copied regulation PDF to: {dest_pdf}")
