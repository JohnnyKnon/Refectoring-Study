/**
 * 달러 포맷함수
 * @param {Number} aNumber 포맷할 넘버
 * @returns 달러 포맷된 문자열
 */
function usd(aNumber) {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100); // 단위 변환 로직

  return formattedNumber;
}

/**
 * 공연료 청구서를 출력하는 함수
 * @param {*} invoice 공연 청구서
 * @param {*} plays 공연 시나리오 정보
 * @returns 청구서
 */
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer; // 고객정보
  statementData.performances = invoice.performances; // 공연정보
  return renderPlainText(statementData, plays);
}

/**
 * 공연료 청구서를 단순 텍스트로 출력하는 함수
 * @param {*} data 고객정보, 공연정보,
 * @param {*} plays 공연 시나리오 정보
 * @returns 청구서
 */
function renderPlainText(data, plays) {
  /**
   * 공연 시나리오 값을 불러오는 질의함수
   * @param {*} aPerformance 각 공연 관련 값
   */
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  /**
   * 금액 계산 함수
   * @param {*} aPerformance 각 공연 관련 값
   * @param {*} play 각 공연 시나리오 개별값
   * @returns 금액 계산값
   */
  function amountFor(aPerformance) {
    let result = 0; // 각 공연의 금액

    switch (playFor(aPerformance).type) {
      case "tragedy": // 비극
        result = 40000;
        if (aPerformance.audience > 30) {
          // 관객이 30을 넘길 경우
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy": // 희극
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }

    return result;
  }

  /**
   * 적립 포인트 계산함수
   * @param {*} aPerformance 각 공연 관련 값
   * @returns 적립 포인트 계산
   */
  function volumeCreditsFor(aPerformance) {
    let volumeCredits = 0; // 공연 포인트
    // 포인트를 적립한다.
    volumeCredits += Math.max(aPerformance.audience - 30, 0);
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === playFor(aPerformance).type)
      volumeCredits += Math.floor(aPerformance.audience / 5);

    return volumeCredits;
  }

  /**
   * 적립 포인트 총합 계산함수
   * @returns 적립 포인트 총합
   */
  function totalVolumeCredits() {
    let result = 0; // 공연 적립 포인트
    for (let perf of data.performances) {
      // 적립 포인트 계산 후 적용
      result += volumeCreditsFor(perf);
    }
    return result;
  }

  /**
   * 총액 계산함수
   * @returns 총액값
   */
  function totalAmount() {
    let result = 0; // 총액
    for (let perf of data.performances) {
      result += amountFor(perf);
    }
    return result;
  }

  // 청구내역 최종 결과로직
  let result = `청구 내역 (고객명: ${data.customer})\n`; // 결과값 (기본으로 고객명)
  for (let perf of data.performances) {
    // 청구 내역을 출력한다.
    result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${
      perf.audience
    }석)\n`;
  }
  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트 : ${totalVolumeCredits()}점\n`;
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
