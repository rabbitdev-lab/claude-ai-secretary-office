/**
 * 특강 2 연습용 메일·일정 넣기 (Google Apps Script)
 *
 * 연습용으로 따로 만든 구글 계정에서 실행하세요. 평소 쓰는 계정이나 회사 계정에서는 실행하지 않습니다.
 *
 * 1. 연습용 계정으로 script.google.com → 새 프로젝트 → 이 파일 내용을 전부 붙여 넣습니다.
 * 2. 왼쪽 "서비스" 옆 + → "Gmail API"를 추가합니다 (식별자 Gmail 그대로).
 * 3. 위쪽 함수 목록에서 seedDemo를 고르고 실행 → 권한을 허용합니다.
 *    - 메일 16통이 받은편지함에 "안 읽음"으로 들어가고 "특강데모" 라벨이 붙습니다.
 *    - 메일 받은 시각은 실행한 시각 기준으로 몇 시간 전으로 찍힙니다.
 *    - 캘린더에 2026-12-04, 12-07, 12-08 일정 6개가 생깁니다. 설명에 [특강데모]가 붙습니다.
 *      다른 날짜에 연습하려면 아래 BASE_DAY를 바꿉니다.
 * 4. 다 쓴 뒤에는 cleanupDemo를 실행합니다. cleanupDemo는 특강데모 라벨이 붙은 메일을 휴지통으로 옮기고 [특강데모] 일정을 지웁니다.
 *
 * 보낸 사람 주소는 모두 실제로 없는 .example 도메인입니다. 메일은 발송되지 않고 받은편지함에만 들어갑니다.
 */

const ME_NAME = "박현진";
const MAILS = [
 {
  "h": 1,
  "name": "이수진",
  "addr": "sujin.lee@greenleaf.example",
  "cat": "답장 필요",
  "subj": "[문의] 팀 단위 승인 기능 출시 일정이 궁금합니다",
  "body": "안녕하세요, 그린리프컴퍼니 재무팀 이수진입니다.\n\n지난달 요청드렸던 팀장 일괄 승인 기능은 언제쯤 쓸 수 있을까요?\n연말 정산 시즌이라 팀장님들이 경비를 한 번에 검토할 수 있으면 큰 도움이 될 것 같습니다.\n대략적인 일정이라도 알려 주시면 내부에 공유하겠습니다.\n\n감사합니다.\n이수진 드림"
 },
 {
  "h": 2,
  "name": "정민호",
  "addr": "minho.jung@osol-logis.example",
  "cat": "답장 필요(긴급)",
  "subj": "[긴급] 법인카드 내역이 3일째 연동되지 않습니다",
  "body": "안녕하세요. 오솔로지스틱스 총무팀 정민호입니다.\n\n12월 1일부터 법인카드 사용 내역이 정산메이트에 들어오지 않고 있습니다.\n직원 40명이 경비를 올리지 못하고 있어서 확인이 급합니다.\n카드사는 신한카드이고, 오류 메시지는 따로 뜨지 않습니다.\n\n오늘 중으로 상황을 알려 주실 수 있을까요?\n\n정민호 드림"
 },
 {
  "h": 3,
  "name": "강지훈",
  "addr": "jihoon.kang@jungsanmate.example",
  "cat": "답장 필요",
  "subj": "금요일 경영회의 자료 요청",
  "body": "현진 님,\n\n금요일 경영회의에서 팀 승인 기능 일정을 공유하려고 합니다.\n출시 일정, 현재 진행 상황, 위험 요소를 한 장으로 정리해서 오늘 오후 5시까지 보내 주세요.\n\n지훈"
 },
 {
  "h": 4,
  "name": "김민지",
  "addr": "minji.kim@jungsanmate.example",
  "cat": "확인 필요",
  "subj": "모바일 승인 목록 시안 공유드려요",
  "body": "현진 님, 모바일 승인 목록 시안 공유드려요.\n\n- 목록 화면 2안 (카드형, 표형)\n- 일괄 승인 버튼 위치 2안\n\n다음 주 월요일(12/7)까지 어느 안으로 갈지 피드백 주시면 상세 화면 작업 들어가겠습니다.\n\n민지"
 },
 {
  "h": 5,
  "name": "이재호",
  "addr": "jaeho.lee@jungsanmate.example",
  "cat": "읽어만 두기",
  "subj": "[완료] 반려 사유 컬럼 개발 서버 반영",
  "body": "현진 님,\n\n회의 때 말씀드린 반려 사유 컬럼 추가 작업 개발 서버에 반영했습니다.\nQA 요청은 다음 주에 드리겠습니다.\n\n재호"
 },
 {
  "h": 6,
  "name": "최서연",
  "addr": "seoyeon.choi@jungsanmate.example",
  "cat": "답장 필요",
  "subj": "Re: 팀 승인 기능 고객 공지 초안",
  "body": "현진 님,\n\n지난주 회의에서 말씀하신 고객 공지 초안 혹시 언제쯤 받을 수 있을까요?\n요즘 관련 문의가 하루에 대여섯 건씩 들어오고 있어서, 공지가 나가면 CS 응대가 훨씬 수월할 것 같아요.\n\n서연"
 },
 {
  "h": 8,
  "name": "한도윤",
  "addr": "doyoon.han@payon.example",
  "cat": "답장 필요(일정)",
  "subj": "[페이온] 제휴 논의 미팅 요청드립니다",
  "body": "안녕하세요, 페이온 제휴팀 한도윤입니다.\n\n간편결제 연동 제휴 건으로 한 번 뵙고 싶습니다.\n다음 주 화요일(12/8) 오후 2시에 1시간 정도 화상으로 가능하실까요?\n어려우시면 편하신 시간을 알려 주세요.\n\n한도윤 드림"
 },
 {
  "h": 10,
  "name": "경영지원팀",
  "addr": "admin@jungsanmate.example",
  "cat": "확인 필요",
  "subj": "[설문] 연말 워크숍 일정 투표 (12/5 마감)",
  "body": "안녕하세요, 경영지원팀입니다.\n\n연말 워크숍 날짜를 정하려고 합니다.\n12월 5일(토)까지 아래 설문에 참여해 주세요.\n- 12/18(금)\n- 12/22(화)\n\n감사합니다."
 },
 {
  "h": 12,
  "name": "Daniel Tan",
  "addr": "daniel.tan@fintrail.example",
  "cat": "답장 필요(영문)",
  "subj": "API integration timeline for Q1",
  "body": "Hi Hyunjin,\n\nHope you're doing well. Our team in Singapore is planning the Q1 roadmap,\nand we'd like to confirm when the expense approval API will be available for partners.\n\nCould you share a rough timeline and whether a sandbox will be provided?\n\nBest regards,\nDaniel Tan\nPartnerships, FinTrail"
 },
 {
  "h": 14,
  "name": "SaaS 위클리",
  "addr": "letter@saasweekly.example",
  "cat": "읽어만 두기",
  "subj": "이번 주 SaaS 트렌드: 경비 관리 시장의 AI 도입",
  "body": "이번 주 SaaS 위클리입니다.\n\n1. 경비 관리 서비스들이 영수증 인식에 AI를 붙이고 있습니다.\n2. 중소기업 대상 결제 서비스의 묶음 판매가 늘고 있습니다.\n3. 연말 예산 시즌, B2B 영업 메일 응답률이 떨어집니다.\n\n다음 주에 또 찾아뵙겠습니다."
 },
 {
  "h": 16,
  "name": "클라우드몰",
  "addr": "promo@cloudmall.example",
  "cat": "광고",
  "subj": "[광고] 연말 한정 클라우드 서버 40% 할인",
  "body": "연말 한정 특가!\n클라우드 서버 1년 약정 시 40% 할인해 드립니다.\n12월 31일까지."
 },
 {
  "h": 20,
  "name": "정태훈",
  "addr": "taehoon.jung@jungsanmate.example",
  "cat": "팀원 보고",
  "subj": "[주간보고] 정태훈 - 12월 1주",
  "body": "이번 주\n- 영수증 촬영 화면 개선 완료\n- 안드로이드 카메라 권한 팝업 중복 문제 원인 확인 중 (일부 기종)\n\n다음 주\n- 카메라 권한 문제 수정\n- 승인 목록 화면 개발 착수 (시안 확정 후)\n\n이슈\n- 시안 확정이 늦어지면 승인 목록 개발 일정도 밀립니다"
 },
 {
  "h": 21,
  "name": "김민지",
  "addr": "minji.kim@jungsanmate.example",
  "cat": "팀원 보고",
  "subj": "[주간보고] 김민지 - 12월 1주",
  "body": "이번 주\n- 모바일 승인 목록 시안 2안 작업 완료\n\n다음 주\n- 시안 확정 후 상세 화면 작업\n- 디자인 시스템 개편 범위 정리\n\n이슈\n- 없음"
 },
 {
  "h": 22,
  "name": "이재호",
  "addr": "jaeho.lee@jungsanmate.example",
  "cat": "팀원 보고",
  "subj": "[주간보고] 이재호 - 12월 1주",
  "body": "이번 주\n- 반려 사유 컬럼 추가, 개발 서버 반영\n- 일괄 승인 API 설계\n\n다음 주\n- 일괄 승인 API 개발\n- 법인카드 연동 오류 문의 원인 확인 (CS 요청)\n\n이슈\n- 백엔드 인원이 부족해 법인카드 연동 오류 확인이 늦어질 수 있음"
 },
 {
  "h": 26,
  "name": "Google 캘린더",
  "addr": "calendar-notification@google.example",
  "cat": "일정",
  "subj": "초대: Q1 로드맵 리뷰 - 12월 8일(화) 오후 2시",
  "body": "강지훈 님이 회의에 초대했습니다.\n\nQ1 로드맵 리뷰\n12월 8일(화) 오후 2:00 ~ 3:00\n참석: 강지훈, 박현진, 이재호, 김민지"
 },
 {
  "h": 30,
  "name": "정산메이트 결제",
  "addr": "billing@jungsanmate.example",
  "cat": "읽어만 두기",
  "subj": "[영수증] 11월 SaaS 도구 사용료 결제 완료",
  "body": "11월 사용료가 결제되었습니다.\n- 디자인 협업 도구: 120,000원\n- 회의 녹화 도구: 45,000원\n합계: 165,000원"
 }
];
const EVENTS = [
 {
  "day": 0,
  "start": "10:00",
  "end": "10:40",
  "title": "제품팀 주간 리뷰",
  "desc": "참석: 박현진, 김민지, 이재호, 정태훈, 최서연"
 },
 {
  "day": 0,
  "start": "14:00",
  "end": "15:00",
  "title": "디자인 시스템 개편 범위 회의",
  "desc": "참석: 박현진, 김민지, 정태훈"
 },
 {
  "day": 0,
  "start": "17:00",
  "end": "17:30",
  "title": "경영회의 자료 제출 마감",
  "desc": "강지훈 님께 팀 승인 기능 일정 한 장"
 },
 {
  "day": 3,
  "start": "10:00",
  "end": "10:30",
  "title": "1:1 - 김민지",
  "desc": ""
 },
 {
  "day": 4,
  "start": "14:00",
  "end": "15:00",
  "title": "Q1 로드맵 리뷰",
  "desc": "참석: 강지훈, 박현진, 이재호, 김민지"
 },
 {
  "day": 4,
  "start": "16:00",
  "end": "16:30",
  "title": "CS 이슈 점검",
  "desc": "참석: 박현진, 최서연"
 }
];
const BASE_DAY = new Date(2026, 11, 4); // 일정의 기준일 2026-12-04 (월은 0부터 시작하므로 11 = 12월)
const LABEL = '특강데모';
const TAG = '[특강데모]';

function enc_(text) {
  return '=?UTF-8?B?' + Utilities.base64Encode(text, Utilities.Charset.UTF_8) + '?=';
}

function seedDemo() {
  const me = Session.getActiveUser().getEmail();
  const label = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
  const labelId = Gmail.Users.Labels.list('me').labels.filter(function (l) { return l.name === LABEL; })[0].id;
  const now = new Date();
  MAILS.forEach(function (m) {
    const date = new Date(now.getTime() - m.h * 3600 * 1000);
    const raw = [
      'From: ' + enc_(m.name) + ' <' + m.addr + '>',
      'To: ' + enc_(ME_NAME) + ' <' + me + '>',
      'Subject: ' + enc_(m.subj),
      'Date: ' + Utilities.formatDate(date, 'GMT', "EEE, dd MMM yyyy HH:mm:ss '+0000'"),
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Utilities.base64Encode(m.body, Utilities.Charset.UTF_8)
    ].join('\r\n');
    const blob = Utilities.newBlob(raw, 'message/rfc822');
    Gmail.Users.Messages.insert({ labelIds: ['INBOX', 'UNREAD', labelId] }, 'me', blob, { internalDateSource: 'dateHeader' });
  });
  const cal = CalendarApp.getDefaultCalendar();
  EVENTS.forEach(function (e) {
    const day = new Date(BASE_DAY.getTime());
    day.setDate(day.getDate() + e.day);
    const s = e.start.split(':'), t = e.end.split(':');
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), +s[0], +s[1]);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), +t[0], +t[1]);
    cal.createEvent(e.title, start, end, { description: (e.desc ? e.desc + '\n' : '') + TAG });
  });
  Logger.log('메일 ' + MAILS.length + '통, 일정 ' + EVENTS.length + '개를 넣었습니다.');
}

function cleanupDemo() {
  const label = GmailApp.getUserLabelByName(LABEL);
  if (label) {
    label.getThreads().forEach(function (t) { t.moveToTrash(); });
  }
  const cal = CalendarApp.getDefaultCalendar();
  const from = new Date(2026, 10, 1), to = new Date(2027, 0, 31);
  cal.getEvents(from, to, { search: TAG }).forEach(function (ev) {
    if ((ev.getDescription() || '').indexOf(TAG) >= 0) ev.deleteEvent();
  });
  Logger.log('데모 메일과 일정을 지웠습니다.');
}
