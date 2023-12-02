/**
 * 공연료 계산을 위한 로직 클래스
 */
class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance; // 공연
    this.play = aPlay; // 공연정보
  }

  // 공연료 계산 메서드
  get amount() {
    throw new Error("서브클래스에서 처리하도록 설계되었습니다.");
  }

  // 적립 포인트 계산 메서드
  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

/**
 * 공연료 계산 로직 팩터리 함수
 * @param {*} aPerformance // 공연
 * @param {*} aPlay // 공연정보
 */
function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case "tragedy":
      return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

// 비극 공연료 계산로직
class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }

    return result;
  }
}

// 희극 공연료 계산로직
class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  // 희극 적립 포인트 추가 로직
  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

/**
 * 중간 데이터 생성 함수
 * @param {*} invoice 공연 청구서
 * @param {*} plays 공연 시나리오 정보
 */
export default function createStatementData(invoice, plays) {
  /**
   * 공연 시나리오 값을 불러오는 질의함수
   * @param {*} aPerformance 각 공연 관련 값
   */
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
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

  const statementData = {};
  statementData.customer = invoice.customer; // 고객정보
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연정보 -> 얕은복사를 통해서 불변성을 지키려함
  statementData.totalAmount = totalAmount(statementData); //총액
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 적립포인트 총합
  return statementData;

  // 얕은복사 함수
  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );
    const result = Object.assign({}, aPerformance); // 얕은 복사 수행
    result.play = playFor(result); // 연극정보
    result.amount = calculator.amount; // 금액 계산
    result.volumeCredits = calculator.volumeCredits; // 적립 포인트 계산
    return result;
  }
}
