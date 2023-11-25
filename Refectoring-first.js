/**
 *3자리수 콤마찍는 함수
 * @param {Number} num 포맷할 넘버
 * @returns
 */
function format(num) {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return formattedNumber;
}

/**
 * 공연료 청구서를 출력하는 함수
 * @param {*} invoice 청구서
 * @param {*} plays 공연정보
 */
function statement(invoice, plays) {
  let totalAmount = 0; // 총액
  let volumeCredits = 0; // 공연 포인트
  let result = `청구 내역 (고객명: ${invoice.customer})\n`; // 결과값

  for (let perf of invoice.performances) {
    const play = plays[perf.playID]; // 해당하는 공연정보
    let thisAmount = 0; // 각 공연의 금액

    switch (play.type) {
      case "tragedy": // 비극
        thisAmount = 40000;
        if (perf.audience > 30) {
          // 관객이 30을 넘길 경우
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy": // 희극
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }

    // 포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    // 청구 내역을 출력한다.
    result += `${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트 : ${volumeCredits}점\n`;

  return result;
}

/**
 * plays.json 파일을 가져오는 함수
 * @returns {Promise<Object>} plays.json 파일의 데이터를 포함하는 Promise 객체
 */
const fetchPlays = async () => {
  try {
    const response = await fetch("json/plays.json");
    if (!response.ok) throw new Error("네트워크 응답이 올바르지 않음");
    return response.json();
  } catch (error) {
    console.error("공연 데이터를 불러오는 중 오류 발생:", error);
    throw error;
  }
};

/**
 * invoices.json 파일을 가져오는 함수
 * @returns {Promise<Object>} invoices.json 파일의 데이터를 포함하는 Promise 객체
 */
const fetchInvoices = async () => {
  try {
    const response = await fetch("json/invoices.json");
    if (!response.ok) throw new Error("네트워크 응답이 올바르지 않음");
    return response.json();
  } catch (error) {
    console.error("인보이스 데이터를 불러오는 중 오류 발생:", error);
    throw error;
  }
};

/**
 * plays.json과 invoices.json 파일을 병렬로 가져와서 처리하는 함수
 * @returns {void}
 */
const fetchData = async () => {
  try {
    const [playsData, invoicesData] = await Promise.all([
      fetchPlays(),
      fetchInvoices(),
    ]);

    if (playsData && invoicesData) {
      console.log(statement(invoicesData[0], playsData));
    }
  } catch (error) {
    console.error("데이터를 불러오는 중 오류 발생:", error);
  }
};

// fetchData 함수 호출
fetchData();