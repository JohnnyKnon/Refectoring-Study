// 중간데이터 생성 함수
import createStatementData from "./createStatementData.mjs";

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
  return renderPlainText(createStatementData(invoice, plays));
}

/**
 * 공연료 청구서를 단순 텍스트로 출력하는 함수
 * @param {*} data 고객정보, 공연정보,
 * @param {*} plays 공연 시나리오 정보
 * @returns 청구서
 */
function renderPlainText(data, plays) {
  // 청구내역 최종 결과로직
  let result = `청구 내역 (고객명: ${data.customer})\n`; // 결과값 (기본으로 고객명)
  for (let perf of data.performances) {
    // 청구 내역을 출력한다.
    result += `${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
  }
  result += `총액: ${usd(data.totalAmount)}\n`;
  result += `적립 포인트 : ${data.totalVolumeCredits}점\n`;
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
