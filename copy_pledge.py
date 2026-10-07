import os
import shutil

src_pledge = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\유가보조금 서면신청\유가보조 사업 청렴 이행서약서.pdf"
dest_dir = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\documents\civil\fuel-subsidy-written"
dest_pledge = os.path.join(dest_dir, "pledge.pdf")
dest_pledge_kr = os.path.join(dest_dir, "유가보조 사업 청렴 이행서약서.pdf")

os.makedirs(dest_dir, exist_ok=True)
shutil.copy2(src_pledge, dest_pledge)
shutil.copy2(src_pledge, dest_pledge_kr)
print(f"Copied pledge PDF to {dest_pledge} and {dest_pledge_kr}")
