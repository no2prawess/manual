import os
import json
import pymupdf

pdf_path = "민원사무편람 책자(화물팀).pdf"
doc = pymupdf.open(pdf_path)

# Definition of the 14 civil services based on the PDF
civil_services = [
    {
        "id": "warehouse-registration",
        "number": "417",
        "title": "물류창고업등록(변경) 신청",
        "category": "등록",
        "law": "물류시설의 개발 및 운영에 관한 법률 제21조의2",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427",
        "processingPeriod": "14일",
        "shortenedPeriod": "7일",
        "fee": "10,000원 납부",
        "feeSimple": "10,000원",
        "requiredDocuments": [
            {"name": "물류창고업 등록(변경) 신청서 1부", "type": "필수", "note": "별지 제1호서식"},
            {"name": "사업운영계획서 1부", "type": "필수", "note": "신규등록 시"},
            {"name": "변경사항을 증명하는 서류 1부", "type": "해당 시", "note": "변경등록 신청의 경우"},
            {"name": "외국인 결격사유 미해당 증명서류 (아포스티유 또는 영사확인서)", "type": "해당 시", "note": "신청인이 외국인인 경우"}
        ],
        "officialCheck": [
            "법인 등기사항증명서(신청인이 법인인 경우만 해당)",
            "건물등기부 등본",
            "토지등기부 등본",
            "건축물대장"
        ],
        "reviewCriteria": [
            "물류창고업 등록기준에 부합하는지 여부 확인",
            "물류창고 사용에 대한 정당한 권리를 가지는지 여부",
            "물류창고에 화물을 쌓아 놓는 행위가 가능한지 여부",
            "건축법에 따른 창고시설일 것"
        ],
        "process": [
            "신청서 작성",
            "접수",
            "심사",
            "결재",
            "등록대장 및 등록증 작성",
            "등록증 발급"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 1,
            "formPage": 2,
            "bookletPage": "1539~1540"
        },
        "form": {
            "title": "물류창고업 [ ]등록 [ ]변경등록 신청서",
            "formNumber": "물류창고업 등록에 관한 규칙 [별지 제1호서식]",
            "revisionDate": "2017. 4. 20.",
            "pdf": "documents/civil/warehouse-registration/form.pdf",
            "image": "documents/civil/warehouse-registration/form-page-01.png"
        }
    },
    {
        "id": "cargo-yard",
        "number": "427",
        "title": "영업용화물 차고지설치 확인 신청",
        "category": "확인",
        "law": "화물자동차운수사업법시행규칙 제5조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "시설확인",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "10일",
        "shortenedPeriod": "5일",
        "fee": "6,000원",
        "feeSimple": "6,000원",
        "requiredDocuments": [
            {"name": "차고지설치확인신청서 1부", "type": "필수", "note": "별지 제1호서식"},
            {"name": "노외주차장 이용시: 월세계약서, 주차장 사업자등록증", "type": "해당 시", "note": "노외주차장 이용"},
            {"name": "나대지 이용시: 승낙서, 토지주 인감증명서, 토지대장", "type": "해당 시", "note": "타인 소유 나대지"},
            {"name": "나대지 이용시(개인땅): 토지대장, 신분증", "type": "해당 시", "note": "본인 소유 나대지"},
            {"name": "아파트 주차장 이용시: 아파트경비실 직인 승낙서, 아파트 도면 주차위치 지도/사진", "type": "해당 시", "note": "아파트 주차장"},
            {"name": "연립·빌라 거주시: 주민 100% 동의 승낙서, 등본, 건축물대장, 차고지 주차 차량 사진", "type": "해당 시", "note": "연립·빌라"}
        ],
        "officialCheck": [
            "주민등록정보 (신청인이 개인인 경우, 민원인 제출생략)",
            "토지등기부 등본 및 토지대장 (화물터미널 이용 시 제외)",
            "토지이용계획확인원 (화물터미널 이용 시 제외)"
        ],
        "reviewCriteria": [
            "토지등기부등본과 건물등기부등본을 열람하여 실소유자 파악",
            "관련서류 검토",
            "차고지시설 현장 확인"
        ],
        "process": [
            "신청서 작성 및 접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "현장 확인 및 차고지설치확인서 발급",
            "차고지설치확인서 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 3,
            "formPage": 4,
            "bookletPage": "1565~1566"
        },
        "form": {
            "title": "차고지설치확인신청서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제1호서식]",
            "revisionDate": "2017. 1. 6.",
            "pdf": "documents/civil/cargo-yard/form.pdf",
            "image": "documents/civil/cargo-yard/form-page-01.png"
        }
    },
    {
        "id": "permit-reissue",
        "number": "428",
        "title": "허가증 재발급 신청",
        "category": "단순민원",
        "law": "화물자동차운수사업법시행규칙 제8조 제2항",
        "submissionTo": "자동차관리과",
        "viaInquiry": "화물대장조회",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "즉시",
        "shortenedPeriod": "-",
        "fee": "1건당 2,000원",
        "feeSimple": "2,000원",
        "requiredDocuments": [
            {"name": "허가증재발급신청서 1부", "type": "필수", "note": "별지 제6호서식"},
            {"name": "본인임을 증빙할 수 있는 서류 1부 (주민등록증, 운전면허증 등)", "type": "필수", "note": "본인 확인용"},
            {"name": "허가증분실 사유서", "type": "해당 시", "note": "분실한 경우"},
            {"name": "기존 허가증 원본 1부", "type": "해당 시", "note": "헐어 못쓰게 된 경우에 한함"}
        ],
        "officialCheck": [
            "화물대장 및 자동차등록 프로그램 열람을 통한 등록 여부 확인"
        ],
        "reviewCriteria": [
            "화물대장 및 자동차등록 프로그램 열람하여 등록여부 확인"
        ],
        "process": [
            "접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "화물대장 확인 및 허가증 재교부",
            "허가증 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 5,
            "formPage": 6,
            "bookletPage": "1567~1568"
        },
        "form": {
            "title": "허가증재발급신청서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제6호서식]",
            "revisionDate": "2017. 1. 6.",
            "pdf": "documents/civil/permit-reissue/form.pdf",
            "image": "documents/civil/permit-reissue/form-page-01.png"
        }
    },
    {
        "id": "transfer",
        "number": "429",
        "title": "화물자동차운송사업 양도ᆞ양수신고",
        "category": "신고",
        "law": "화물자동차운수사업법 제16조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "전국화물자동차운송사업연합회 결격여부조회, 행정정보공동이용열람",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "5일",
        "shortenedPeriod": "-",
        "fee": "3,000원 (면허세: 읍·면 9,000원 / 동 15,000원)",
        "feeSimple": "3,000원",
        "requiredDocuments": [
            {"name": "화물자동차운송/주선/가맹사업 양도양수 신고서 원본 1부", "type": "필수", "note": "인감도장 날인"},
            {"name": "화물자동차운송사업 양도양수 계약서 원본 1부", "type": "필수", "note": "인감도장 날인"},
            {"name": "자동차 양도증명서 사본 1부", "type": "필수", "note": "인감도장 날인"},
            {"name": "양도인 자동차매도용 인감증명서 1부", "type": "필수", "note": "매도용"},
            {"name": "양수인 일반 인감증명서 1부", "type": "필수", "note": "법인: 이사회회의록/법인등기/법인인감"},
            {"name": "화물자동차운송사업 허가증 원본", "type": "필수", "note": "기존 허가증"},
            {"name": "양도인 자동차등록증 사본 1부", "type": "필수", "note": "차량 등록확인"},
            {"name": "양도인 화물운송종사 자격증명", "type": "필수", "note": "자격확인"},
            {"name": "양수인 기본증명서 1부", "type": "필수", "note": "신원확인"},
            {"name": "양수인 운전면허증, 운송종사 자격증 사본 각 1부", "type": "필수", "note": "운전자격"},
            {"name": "차고지 설치확인서", "type": "해당 시", "note": "해당차량이 1.5톤 초과일 경우"},
            {"name": "양도인·양수인 위임장 각 1부", "type": "해당 시", "note": "대리인 신청 시 인감도장 날인"}
        ],
        "officialCheck": [
            "전국화물자동차운송사업연합회 결격여부 조회 (화물자동차운수사업법 제4조)",
            "행정정보공동이용열람 (화물자동차운수사업법 제4조)",
            "양수인이 법인인 경우 법인 등기사항증명서"
        ],
        "reviewCriteria": [
            "관련서류 검토",
            "화물자동차운수사업법 제4조 결격사유 해당여부 확인"
        ],
        "process": [
            "신고서 작성 및 접수 (민원실)",
            "서류검토 및 신원조회 (자동차관리과)",
            "양도양수 신고수리",
            "허가증 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 7,
            "formPage": 8,
            "bookletPage": "1569~1570"
        },
        "form": {
            "title": "화물자동차운송/주선/가맹사업양도ㆍ양수신고서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제16호서식]",
            "revisionDate": "2013. 7. 11.",
            "pdf": "documents/civil/transfer/form.pdf",
            "image": "documents/civil/transfer/form-page-01.png"
        }
    },
    {
        "id": "transport-terms",
        "number": "430",
        "title": "화물자동차운송사업 운송약관신고",
        "category": "신고",
        "law": "화물자동차운수사업법 제6조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "3일",
        "shortenedPeriod": "-",
        "fee": "2,000원",
        "feeSimple": "2,000원",
        "requiredDocuments": [
            {"name": "운송약관신고서 1부", "type": "필수", "note": "별지 제12호서식"},
            {"name": "운송약관 1부", "type": "필수", "note": "제정 약관 내용"},
            {"name": "신·구 약관 대비표 1부", "type": "해당 시", "note": "약관의 변경신고를 하고자 하는 경우에 한함"}
        ],
        "officialCheck": [
            "자료 확인 필요 (공동이용 해당사항 없음)"
        ],
        "reviewCriteria": [
            "약관 내용의 적정성 및 화물자동차운수사업법 규정 부합 여부 심사 후 수리"
        ],
        "process": [
            "신고서 작성 및 접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "약관수리",
            "약관수리 통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 9,
            "formPage": 10,
            "bookletPage": "1571~1572"
        },
        "form": {
            "title": "화물자동차 [ ]운송사업 [ ]운송주선사업 [ ]운송가맹사업 운송약관 [ ]신고서 [ ]변경신고서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제12호서식]",
            "revisionDate": "2017. 1. 6.",
            "pdf": "documents/civil/transport-terms/form.pdf",
            "image": "documents/civil/transport-terms/form-page-01.png"
        }
    },
    {
        "id": "permit-change",
        "number": "431",
        "title": "화물자동차운송사업 변경허가신청",
        "category": "허가",
        "law": "화물자동차운수사업법 제3조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "20일",
        "shortenedPeriod": "10일",
        "fee": "1건당 기본 5,000원 + 차량 1대 추가당 2,000원 합산",
        "feeSimple": "기본 5,000원 (+대당 2,000원)",
        "requiredDocuments": [
            {"name": "화물자동차운송사업변경허가신청서 1부", "type": "필수", "note": "별지 제7호서식"},
            {"name": "자동차등록증 사본", "type": "필수", "note": "차량 확인"},
            {"name": "신·구 허가사항을 대조한 서류 1부", "type": "필수", "note": "변경대비표"},
            {"name": "화물자동차운송사업허가증 원본", "type": "해당 시", "note": "허가증 내 내용변경 시"},
            {"name": "전·후 제원대비표, 자동차등록증 사본", "type": "해당 시", "note": "구조변경 시"},
            {"name": "차고지 설치 확인서 1부 및 매매계약서/양도증명서/자동차제작증 1부", "type": "해당 시", "note": "증차를 수반하는 경우"}
        ],
        "officialCheck": [
            "자료 확인 필요 (법인등기사항증명서 등)"
        ],
        "reviewCriteria": [
            "관련 서류 검토",
            "타 시도 전출 시 해당 시·군·구에 서류 이관"
        ],
        "process": [
            "신청서 작성 및 접수 (민원실)",
            "서류 확인 및 검토 (자동차관리과)",
            "예비허가 (통보)",
            "시설 등 확인",
            "변경허가 수리 및 타시도 서류 이관",
            "변경허가증 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 11,
            "formPage": 12,
            "bookletPage": "1573~1574"
        },
        "form": {
            "title": "화물자동차운송사업변경허가신청서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제7호서식]",
            "revisionDate": "2016. 6. 30.",
            "pdf": "documents/civil/permit-change/form.pdf",
            "image": "documents/civil/permit-change/form-page-01.png"
        }
    },
    {
        "id": "permit-minor-change",
        "number": "432",
        "title": "화물자동차운송사업 허가사항 변경신고",
        "category": "신고",
        "law": "화물자동차운수사업법 제3조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "20일",
        "shortenedPeriod": "10일",
        "fee": "1건당 기본 5,000원 + 차량 1대 추가당 2,000원 합산",
        "feeSimple": "기본 5,000원 (+대당 2,000원)",
        "requiredDocuments": [
            {"name": "화물자동차운송사업 허가사항변경신고서 1부", "type": "필수", "note": "별지 제8호서식"},
            {"name": "변경 전·후 도면 1부", "type": "필수", "note": "도면 변경 시"},
            {"name": "전·후 제원대비표", "type": "필수", "note": "제원 변경 시"},
            {"name": "자동차등록증 사본 1부", "type": "필수", "note": "차량 확인용"},
            {"name": "변경된 사항을 증명하는 서류 및 도면 각 1부", "type": "필수", "note": "변경 증명"}
        ],
        "officialCheck": [
            "자료 확인 필요"
        ],
        "reviewCriteria": [
            "관련 서류 검토",
            "타 시도 전출 시 해당 시·군·구에 서류 이관"
        ],
        "process": [
            "신고서 작성 및 접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "변경허가 수리 및 타시도 서류 이관",
            "변경허가증 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 13,
            "formPage": 14,
            "bookletPage": "1575~1576"
        },
        "form": {
            "title": "화물자동차운송사업허가사항변경신고서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제8호서식]",
            "revisionDate": "2018. 12. 31.",
            "pdf": "documents/civil/permit-minor-change/form.pdf",
            "image": "documents/civil/permit-minor-change/form-page-01.png"
        }
    },
    {
        "id": "permit",
        "number": "433",
        "title": "화물자동차운송사업 허가신청",
        "category": "허가",
        "law": "화물자동차운수사업법 제3조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "전국화물자동차운송사업연합회 결격여부조회, 행정정보공동이용열람",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "20일",
        "shortenedPeriod": "10일",
        "fee": "기본 14,000원 + 차량 1대당 2,000원 합산 (면허세: 읍·면 9,000원 / 동 15,000원)",
        "feeSimple": "기본 14,000원 (+대당 2,000원)",
        "requiredDocuments": [
            {"name": "화물자동차 운송사업 허가 신청서 1부", "type": "필수", "note": "별지 제3호서식"},
            {"name": "화물운송종사 자격증 원본/사본", "type": "필수", "note": "자격 확인"},
            {"name": "운전면허증 사본", "type": "필수", "note": "신분/면허 확인"},
            {"name": "자동차 출고증명서 또는 매매계약서", "type": "필수", "note": "차량 확보 확인"},
            {"name": "사업계획서 1부", "type": "필수", "note": "주사무소/영업소/차량제원 등"},
            {"name": "자동차등록증 사본", "type": "필수", "note": "기등록 차량의 경우"},
            {"name": "기본증명서 1부", "type": "필수", "note": "결격사유 조회용"},
            {"name": "인감증명서 1부", "type": "필수", "note": "법인: 이사회회의록/법인등기/법인인감"},
            {"name": "차고지설치확인서 1부", "type": "필수", "note": "차고지 구비 증명"}
        ],
        "officialCheck": [
            "법인 등기사항증명서 (신청인이 법인인 경우만 해당)",
            "전국화물자동차운송사업 연합회 및 본적지를 통한 결격사유 조회"
        ],
        "reviewCriteria": [
            "관련 서류 검토",
            "본적지와 전국화물자동차운송사업 연합회를 통한 결격여부 조회"
        ],
        "process": [
            "접수 (민원실)",
            "서류 확인 및 예비허가증 교부 (자동차관리과)",
            "자동차등록증 제출 후 결격여부 조회",
            "허가증 수리 및 면허세 납부",
            "허가증 교부"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 15,
            "formPage": 16,
            "bookletPage": "1577~1578"
        },
        "form": {
            "title": "화물자동차운송사업허가신청서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제3호서식]",
            "revisionDate": "2016. 6. 30.",
            "pdf": "documents/civil/permit/form.pdf",
            "image": "documents/civil/permit/form-page-01.png"
        }
    },
    {
        "id": "permit-declaration",
        "number": "434",
        "title": "화물자동차운송사업 허가사항 신고",
        "category": "신고",
        "law": "화물자동차운수사업법 제3조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "20일",
        "shortenedPeriod": "10일",
        "fee": "수수료 없음",
        "feeSimple": "무료",
        "requiredDocuments": [
            {"name": "허가사항 신고서 1부", "type": "필수", "note": "별지 제10호의2서식"},
            {"name": "화물자동차운송사업 허가증 사본 1부", "type": "필수", "note": "허가확인"},
            {"name": "본인임을 증빙할 수 있는 서류 1부", "type": "필수", "note": "신분증 등"},
            {"name": "차고지설치확인서 1부", "type": "필수", "note": "차고지 확인"},
            {"name": "자본금을 확보하고 있음을 증명하는 서류 1부", "type": "필수", "note": "자본금 증빙"},
            {"name": "적재물배상보험가입 사실을 증명하는 서류 1부", "type": "필수", "note": "보험증권"},
            {"name": "주사무소·영업소 및 화물취급소의 명칭·위치 및 규모를 기재한 서류 1부", "type": "필수", "note": "시설 명세"}
        ],
        "officialCheck": [
            "법인 등기사항증명서 (신청인이 법인인 경우만 해당)"
        ],
        "reviewCriteria": [
            "서류 확인 후 신고 수리"
        ],
        "process": [
            "신고서 작성 및 접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "신고 수리 및 통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 17,
            "formPage": 18,
            "bookletPage": "1579~1580"
        },
        "form": {
            "title": "화물자동차운송사업허가사항신고서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제10호의2서식]",
            "revisionDate": "2018. 12. 31.",
            "pdf": "documents/civil/permit-declaration/form.pdf",
            "image": "documents/civil/permit-declaration/form-page-01.png"
        }
    },
    {
        "id": "inheritance",
        "number": "435",
        "title": "화물자동차운송사업 상속신고",
        "category": "신고",
        "law": "화물자동차운수사업법 제25조",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427～8",
        "processingPeriod": "5일",
        "shortenedPeriod": "-",
        "fee": "3,000원",
        "feeSimple": "3,000원",
        "requiredDocuments": [
            {"name": "화물자동차운송사업 상속신고서 1부", "type": "필수", "note": "별지 제18호서식"},
            {"name": "피상속인 기본증명서와 피상속인 주체인 가족관계증명서 1부", "type": "필수", "note": "사망 및 가족관계"},
            {"name": "상속인 기본증명서, 인감증명서, 신분증 사본 각 1부", "type": "필수", "note": "상속인 신원"},
            {"name": "동순위 상속인 상속포기 동의서 및 포기자 인감증명서 각 1부", "type": "해당 시", "note": "공동상속인 있을 시"},
            {"name": "자동차등록증 사본 1부", "type": "필수", "note": "차량 확인"},
            {"name": "피상속인 화물자동차운송사업허가증 원본 1부", "type": "필수", "note": "기존 허가증 반납"},
            {"name": "상속인의 운전면허증, 화물운송 종사자격증 사본", "type": "해당 시", "note": "사업을 계속하려는 경우"},
            {"name": "차고지설치확인서 1부", "type": "해당 시", "note": "사업을 계속하려는 경우"}
        ],
        "officialCheck": [
            "자료 확인 필요 (결격사유 조회 등)"
        ],
        "reviewCriteria": [
            "서류 확인 후 신고 수리"
        ],
        "process": [
            "신고서 작성 및 접수 (민원실)",
            "서류 확인 (자동차관리과)",
            "신고수리 및 허가증 교부/통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 19,
            "formPage": 20,
            "bookletPage": "1581~1582"
        },
        "form": {
            "title": "화물자동차운송/주선/가맹사업상속신고서",
            "formNumber": "화물자동차 운수사업법 시행규칙 [별지 제18호서식]",
            "revisionDate": "2017. 1. 6.",
            "pdf": "documents/civil/inheritance/form.pdf",
            "image": "documents/civil/inheritance/form-page-01.png"
        }
    },
    {
        "id": "intl-logistics-reg",
        "number": "436",
        "title": "국제물류주선업(등록/변경등록) 신청",
        "category": "등록",
        "law": "물류정책기본법 제43조제1항",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427",
        "processingPeriod": "등록 10일 / 변경등록 5일",
        "shortenedPeriod": "5일",
        "fee": "20,000원",
        "feeSimple": "20,000원",
        "requiredDocuments": [
            {"name": "국제물류주선업 [ ]등록 [ ]변경등록 신청서 1부", "type": "필수", "note": "별지 제5호서식"},
            {"name": "물류정책기본법 등록기준 적합 증명서류 1부 (자본금 3억원 이상 등)", "type": "필수", "note": "등록 시"},
            {"name": "자기 명의 선하증권(B/L) 및 항공화물운송장(AWB) 양식·약관 서류", "type": "필수", "note": "등록 시"},
            {"name": "변경 사실을 증명하는 서류 1부", "type": "해당 시", "note": "변경등록 신청 시"},
            {"name": "외국인 결격사유 미해당 증명서류 (아포스티유 또는 영사확인서)", "type": "해당 시", "note": "외국인/외국법인 임원"},
            {"name": "외국인투자 촉진법에 따른 외국인투자 증명 서류", "type": "해당 시", "note": "외국인투자기업"}
        ],
        "officialCheck": [
            "법인 등기사항증명서 (신청인이 법인인 경우)",
            "외국인등록 사실증명 또는 여권 정보 (해당 시)"
        ],
        "reviewCriteria": [
            "서류 확인 후 등록기준 부합 여부 심사 및 등록"
        ],
        "process": [
            "신청서 작성 및 접수",
            "서류 심사 및 결격여부 확인",
            "등록증 작성",
            "등록증 발급"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 21,
            "formPage": 22,
            "bookletPage": "1583~1584"
        },
        "form": {
            "title": "국제물류주선업 [ ]등록 [ ]변경등록 신청서",
            "formNumber": "물류정책기본법 시행규칙 [별지 제5호서식]",
            "revisionDate": "2016. 4. 11.",
            "pdf": "documents/civil/intl-logistics-reg/form.pdf",
            "image": "documents/civil/intl-logistics-reg/form-page-01.png"
        }
    },
    {
        "id": "intl-logistics-transfer",
        "number": "437",
        "title": "국제물류주선업 양도,양수 신고",
        "category": "신고",
        "law": "물류정책기본법 제45조제2항",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427",
        "processingPeriod": "2일",
        "shortenedPeriod": "-",
        "fee": "수수료 없음",
        "feeSimple": "무료",
        "requiredDocuments": [
            {"name": "국제물류주선업양도ㆍ양수신고서 1부", "type": "필수", "note": "별지 제9호서식"},
            {"name": "양도ㆍ양수계약서 사본 1부", "type": "필수", "note": "계약 증빙"},
            {"name": "외국인 결격사유 미해당 증명서류 (아포스티유 또는 영사확인서)", "type": "해당 시", "note": "양수인이 외국인/임원인 경우"},
            {"name": "외국인투자 증명 서류", "type": "해당 시", "note": "외국인투자기업"}
        ],
        "officialCheck": [
            "법인 등기사항증명서 (개인인 경우 주민등록표 등본)",
            "외국인등록 사실증명 (외국인인 경우)",
            "영업소 등기사항증명서 (외국법인 국내 영업소)"
        ],
        "reviewCriteria": [
            "서류 확인 후 신고 수리"
        ],
        "process": [
            "신고서 작성 및 접수",
            "검토 및 결재",
            "신고수리",
            "통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 23,
            "formPage": 24,
            "bookletPage": "1585~1586"
        },
        "form": {
            "title": "국제물류주선업양도ㆍ양수신고서",
            "formNumber": "물류정책기본법 시행규칙 [별지 제9호서식]",
            "revisionDate": "2016. 4. 11.",
            "pdf": "documents/civil/intl-logistics-transfer/form.pdf",
            "image": "documents/civil/intl-logistics-transfer/form-page-01.png"
        }
    },
    {
        "id": "intl-logistics-inheritance",
        "number": "438",
        "title": "국제물류주선업 상속 신고",
        "category": "신고",
        "law": "물류정책기본법 제45조제2항",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427",
        "processingPeriod": "2일",
        "shortenedPeriod": "-",
        "fee": "수수료 없음",
        "feeSimple": "무료",
        "requiredDocuments": [
            {"name": "국제물류주선업상속신고서 1부", "type": "필수", "note": "별지 제10호서식"},
            {"name": "상속인과 피상속인의 관계 증명 서류 1부 (가족관계증명서 등)", "type": "필수", "note": "상속관계 확인"},
            {"name": "동순위 상속인 동의서 1부", "type": "해당 시", "note": "동순위 다른 상속인이 있는 경우"},
            {"name": "피상속인 사망 증명 서류 1부", "type": "필수", "note": "사망진단서 또는 기본증명서"},
            {"name": "외국인 결격사유 미해당 증명서류 (아포스티유 또는 영사확인서)", "type": "해당 시", "note": "상속인이 외국인인 경우"}
        ],
        "officialCheck": [
            "자료 확인 필요 (주민등록등본, 결격사유 확인 등)"
        ],
        "reviewCriteria": [
            "서류 확인 후 신고 수리"
        ],
        "process": [
            "신고서 작성 및 접수",
            "검토 및 결재",
            "신고수리",
            "통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 25,
            "formPage": 26,
            "bookletPage": "1587~1588"
        },
        "form": {
            "title": "국제물류주선업상속신고서",
            "formNumber": "물류정책기본법 시행규칙 [별지 제10호서식]",
            "revisionDate": "2016. 4. 11.",
            "pdf": "documents/civil/intl-logistics-inheritance/form.pdf",
            "image": "documents/civil/intl-logistics-inheritance/form-page-01.png"
        }
    },
    {
        "id": "intl-logistics-merger",
        "number": "439",
        "title": "국제물류주선업 법인합병 신고",
        "category": "신고",
        "law": "물류정책기본법 제45조제2항",
        "submissionTo": "자동차관리과",
        "viaInquiry": "-",
        "dispositionAuthority": "남양주시장",
        "department": "자동차관리과",
        "phone": "031)590-2427",
        "processingPeriod": "2일",
        "shortenedPeriod": "-",
        "fee": "수수료 없음",
        "feeSimple": "무료",
        "requiredDocuments": [
            {"name": "국제물류주선업법인합병신고서 1부", "type": "필수", "note": "별지 제11호서식"},
            {"name": "합병계약서 사본 1부", "type": "필수", "note": "계약서"},
            {"name": "합병당사자 법인의 최근 1년 이내 사업용고정자산 명세서 1부", "type": "필수", "note": "자산 증빙"},
            {"name": "외국인 임원 결격사유 미해당 증명서류 (아포스티유 또는 영사확인서)", "type": "해당 시", "note": "합병 후 임원이 외국인인 경우"},
            {"name": "외국인투자기업 증명 서류", "type": "해당 시", "note": "합병 후 법인이 외투기업인 경우"}
        ],
        "officialCheck": [
            "법인 등기사항증명서",
            "외국법인 국내 영업소 설치 등기사항증명서 (해당 시)"
        ],
        "reviewCriteria": [
            "서류 확인 후 신고 수리"
        ],
        "process": [
            "신고서 작성 및 접수",
            "검토 및 결재",
            "신고수리",
            "통보"
        ],
        "source": {
            "file": "민원사무편람 책자(화물팀).pdf",
            "infoPage": 27,
            "formPage": 28,
            "bookletPage": "1589~1590"
        },
        "form": {
            "title": "국제물류주선업법인합병신고서",
            "formNumber": "물류정책기본법 시행규칙 [별지 제11호서식]",
            "revisionDate": "2016. 4. 11.",
            "pdf": "documents/civil/intl-logistics-merger/form.pdf",
            "image": "documents/civil/intl-logistics-merger/form-page-01.png"
        }
    }
]

print(f"Total services defined: {len(civil_services)}")

# Create assets and directories
os.makedirs("documents/civil", exist_ok=True)
os.makedirs("data", exist_ok=True)

for item in civil_services:
    srv_id = item["id"]
    srv_dir = os.path.join("documents", "civil", srv_id)
    os.makedirs(srv_dir, exist_ok=True)
    
    # 1. Save info.json inside the civil directory
    with open(os.path.join(srv_dir, "info.json"), "w", encoding="utf-8") as f:
        json.dump(item, f, ensure_ascii=False, indent=2)
    
    # 2. Extract PDF Form page (and Info page if needed)
    form_page_num = item["source"]["formPage"]  # 1-indexed
    info_page_num = item["source"]["infoPage"]  # 1-indexed
    
    # Create single-page standalone PDF for the form
    form_pdf_doc = pymupdf.open()
    form_pdf_doc.insert_pdf(doc, from_page=form_page_num - 1, to_page=form_page_num - 1)
    form_pdf_out = os.path.join(srv_dir, "form.pdf")
    form_pdf_doc.save(form_pdf_out)
    form_pdf_doc.close()
    
    # Create full 2-page civil manual PDF for this specific civil service
    civil_pdf_doc = pymupdf.open()
    civil_pdf_doc.insert_pdf(doc, from_page=info_page_num - 1, to_page=form_page_num - 1)
    civil_pdf_out = os.path.join(srv_dir, "manual.pdf")
    civil_pdf_doc.save(civil_pdf_out)
    civil_pdf_doc.close()
    
    # Render high-resolution PNG for form page (300 DPI: matrix zoom 300/72 = 4.166 or 2.5 for crisp web display)
    page = doc[form_page_num - 1]
    pix = page.get_pixmap(dpi=200)
    pix.save(os.path.join(srv_dir, "form-page-01.png"))
    
    # Also render info page image for rich visual reference / card
    info_page = doc[info_page_num - 1]
    pix_info = info_page.get_pixmap(dpi=150)
    pix_info.save(os.path.join(srv_dir, "info-page-01.png"))
    
    print(f"Generated assets for [{item['number']}] -> {srv_dir}")

# Save master civil_services.json in root and data/
with open("data/civil_services.json", "w", encoding="utf-8") as f:
    json.dump(civil_services, f, ensure_ascii=False, indent=2)

with open("civil_services.json", "w", encoding="utf-8") as f:
    json.dump(civil_services, f, ensure_ascii=False, indent=2)

print("All civil services and form files generated successfully!")
