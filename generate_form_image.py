import os
from PIL import Image, ImageDraw, ImageFont

def create_fuel_subsidy_form():
    width = 1200
    height = 1700
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)

    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 36)
        font_subtitle = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 22)
        font_bold = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 20)
        font_regular = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 18)
        font_small = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 15)
        font_tiny = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 13)
    except Exception:
        font_title = ImageFont.load_default()
        font_subtitle = font_title
        font_bold = font_title
        font_regular = font_title
        font_small = font_title
        font_tiny = font_title

    # Outer border
    draw.rectangle([(50, 50), (width - 50, height - 50)], outline='#1e293b', width=2)
    
    # Top regulation text
    draw.text((70, 70), "■ 화물자동차 유가보조금 관리규정 [별지 서식]", fill='#475569', font=font_small)
    
    # Title
    title_text = "화물자동차 유가보조금 지급신청서 및 이행서약서"
    draw.text((width // 2, 140), title_text, fill='#0f172a', font=font_title, anchor='mm')
    
    draw.text((width // 2, 190), "(※ 뒤쪽의 작성방법 및 유의사항을 읽고 작성하여 주시기 바랍니다.)", fill='#64748b', font=font_small, anchor='mm')

    # Draw table for Applicant
    y = 230
    draw.rectangle([(70, y), (width - 70, y + 260)], outline='#334155', width=2)
    
    # Header row
    draw.rectangle([(70, y), (260, y + 260)], fill='#f1f5f9', outline='#94a3b8', width=1)
    draw.text((165, y + 130), "신 청 인\n(사업자)", fill='#1e293b', font=font_bold, anchor='mm', align='center')
    
    rows = [
        ("상 호 (명 칭)", "홍길동 운송", "성 명 (대표자)", "홍 길 동"),
        ("사업자등록번호", "123-45-67890", "생 년 월 일", "1980. 01. 01"),
        ("주        소", "경기도 남양주시 경춘로 1037", "전 화 번 호", "010-1234-5678"),
        ("지 급 계 좌", "농협은행 123-4567-8901-23 (예금주: 홍길동)", "이 메 일", "hong@example.com")
    ]
    
    row_h = 65
    for i, (l1, v1, l2, v2) in enumerate(rows):
        ry = y + i * row_h
        draw.line([(260, ry), (width - 70, ry)], fill='#94a3b8', width=1)
        # Sub headers
        draw.rectangle([(260, ry), (410, ry + row_h)], fill='#f8fafc', outline='#cbd5e1', width=1)
        draw.text((335, ry + 32), l1, fill='#334155', font=font_regular, anchor='mm')
        
        draw.rectangle([(410, ry), (710, ry + row_h)], outline='#cbd5e1', width=1)
        draw.text((425, ry + 32), v1, fill='#0f172a', font=font_regular, anchor='lm')
        
        draw.rectangle([(710, ry), (860, ry + row_h)], fill='#f8fafc', outline='#cbd5e1', width=1)
        draw.text((785, ry + 32), l2, fill='#334155', font=font_regular, anchor='mm')
        
        draw.rectangle([(860, ry), (width - 70, ry + row_h)], outline='#cbd5e1', width=1)
        draw.text((875, ry + 32), v2, fill='#0f172a', font=font_regular, anchor='lm')

    # Vehicle Info Section
    y = 510
    draw.rectangle([(70, y), (width - 70, y + 200)], outline='#334155', width=2)
    draw.rectangle([(70, y), (260, y + 200)], fill='#f1f5f9', outline='#94a3b8', width=1)
    draw.text((165, y + 100), "차 량 정 보\n및 신청내역", fill='#1e293b', font=font_bold, anchor='mm', align='center')

    v_rows = [
        ("차 량 번 호", "경기80바1234", "차 종 / 톤 수", "카고 / 1톤"),
        ("유        종", "경유 (또는 LPG/수소)", "허 가 일 자", "2024. 03. 15"),
        ("신 청 기 간", "2026년 7월분", "신 청 금 액", "금 350,000원 (총 사용량 850L)")
    ]
    for i, (l1, v1, l2, v2) in enumerate(v_rows):
        ry = y + i * 66
        draw.line([(260, ry), (width - 70, ry)], fill='#94a3b8', width=1)
        draw.rectangle([(260, ry), (410, ry + 66)], fill='#f8fafc', outline='#cbd5e1', width=1)
        draw.text((335, ry + 33), l1, fill='#334155', font=font_regular, anchor='mm')
        
        draw.rectangle([(410, ry), (710, ry + 66)], outline='#cbd5e1', width=1)
        draw.text((425, ry + 33), v1, fill='#0f172a', font=font_regular, anchor='lm')
        
        draw.rectangle([(710, ry), (860, ry + 66)], fill='#f8fafc', outline='#cbd5e1', width=1)
        draw.text((785, ry + 33), l2, fill='#334155', font=font_regular, anchor='mm')
        
        draw.rectangle([(860, ry), (width - 70, ry + 66)], outline='#cbd5e1', width=1)
        draw.text((875, ry + 33), v2, fill='#0f172a', font=font_regular, anchor='lm')

    # Pledge & Statement Box
    y = 730
    draw.rectangle([(70, y), (width - 70, y + 430)], fill='#fafafa', outline='#334155', width=2)
    draw.text((width // 2, y + 40), "[ 유가보조금 지급 청구 이행 서약 ]", fill='#0f172a', font=font_subtitle, anchor='mm')
    
    pledge_text = [
        "1. 본인은 「화물자동차 유가보조금 관리규정」 제14조 및 제25조에 따라 상기 기재사항 및",
        "   첨부 서류가 틀림없음을 확인하며, 정당한 사유로 유가보조금을 서면 청구합니다.",
        "2. 만일 허위 또는 부정한 방법으로 유가보조금을 지급받은 사실이 적발될 경우,",
        "   지급받은 유가보조금의 전액 환수 및 관련 법령에 따른 행정처분(보조금 지급정지,",
        "   형사고발 등) 조치에 일체의 이의를 제기하지 아니할 것을 엄숙히 서약합니다."
    ]
    for i, line in enumerate(pledge_text):
        draw.text((100, y + 90 + i * 36), line, fill='#334155', font=font_regular)

    # Date and Signature
    draw.text((width // 2, y + 280), "2026년       월       일", fill='#0f172a', font=font_bold, anchor='mm')
    draw.text((width // 2 + 180, y + 340), "신 청 인 :               (서명 또는 인)", fill='#0f172a', font=font_bold, anchor='mm')
    
    draw.text((width // 2, y + 395), "남 양 주 시 장  귀하", fill='#0f172a', font=font_title, anchor='mm')

    # Attached Documents Footer
    y = 1180
    draw.rectangle([(70, y), (width - 70, height - 70)], outline='#94a3b8', width=1)
    draw.rectangle([(70, y), (260, height - 70)], fill='#f1f5f9', outline='#cbd5e1', width=1)
    draw.text((165, y + 160), "구 비 서 류\n(첨부서류)", fill='#1e293b', font=font_bold, anchor='mm', align='center')
    
    docs_text = [
        "1. 주유/충전 영수증 원본 (영수증이 없는 경우 카드이용내역서 등 결제증빙)",
        "2. 화물자동차 운송사업자 사업자등록증 사본 1부",
        "3. 보조금 수령용 통장 사본 1부",
        "4. 자동차등록증 사본 및 화물운송종사자격증 사본 (필요 시)",
        "5. 유류구매카드 신규발급/재발급 신청 확인 증빙서류 1부"
    ]
    for i, line in enumerate(docs_text):
        draw.text((280, y + 35 + i * 42), line, fill='#1e293b', font=font_regular)
        draw.text((width - 150, y + 35 + i * 42), "[필수/해당]", fill='#0284c7', font=font_small)

    out_dir = r"d:\00_ANTIG\01_업무\03_스마트화물팀\02_업무매뉴얼\(완성)_민원사무편람\documents\civil\fuel-subsidy-written"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "form-page-01.png")
    img.save(out_path, quality=95)
    print(f"Generated form preview at: {out_path}")

create_fuel_subsidy_form()
