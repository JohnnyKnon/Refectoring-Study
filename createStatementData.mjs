/**
 * 공연료 계산을 위한 로직 클래스
 */
class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance; // 공연
    this.play = aPlay; // 공연정보
  }
  get amount() {
    let result = 0; // 각 공연의 금액

    switch (this.play.type) {
      case "tragedy": // 비극
        result = 40000;
        if (this.performance.audience > 30) {
          // 관객이 30을 넘길 경우
          result += 1000 * (this.performance.audience - 30);
        }
        break;
      case "comedy": // 희극
        result = 30000;
        if (this.performance.audience > 20) {
          result += 10000 + 500 * (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }

    return result;
  }
}

/**
 * 중간 데이터 생성 함수
 * @param {*} invoice 공연 청구서
 * @param {*} plays 공연 시나리오 정보
 */
export default function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer; // 고객정보
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연정보 -> 얕은복사를 통해서 불변성을 지키려함
  statementData.totalAmount = totalAmount(statementData); //총액
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 적립포인트 총합
  return statementData;

  // 얕은복사 함수
  function enrichPerformance(aPerformance) {
    // 공연료 계산을 위한 로직 클래스
    const calculator = new PerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );
    const result = Object.assign({}, aPerformance); // 얕은 복사 수행
    result.play = playFor(result); // 연극정보
    result.amount = amountFor(result); // 금액 계산
    result.volumeCredits = volumeCreditsFor(result); // 적립 포인트 계산
    return result;
  }

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
   * @returns 금액 계산값
   */
  function amountFor(aPerformance) {
    return new PerformanceCalculator(aPerformance, playFor(aPerformance))
      .amount;
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
    if ("comedy" === aPerformance.play.type)
      volumeCredits += Math.floor(aPerformance.audience / 5);

    return volumeCredits;
  }

  /**
   * 총액 계산함수
   * @returns 총액값
   */
  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  /**
   * 적립 포인트 총합 계산함수
   * @returns 적립 포인트 총합
   */
  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}
