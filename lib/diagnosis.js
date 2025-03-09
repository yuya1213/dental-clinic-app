// 診断結果の計算
export function calculateResults(answers) {
  const categories = {
    finance: [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5].filter(a => a === true).length,
    patients: [answers.q6, answers.q7, answers.q8, answers.q9, answers.q10].filter(a => a === true).length,
    staff: [answers.q11, answers.q12, answers.q13, answers.q14, answers.q15].filter(a => a === true).length,
    satisfaction: [answers.q16, answers.q17, answers.q18, answers.q19, answers.q20].filter(a => a === true).length,
  };
  
  const totalYes = Object.values(categories).reduce((sum, val) => sum + val, 0);
  
  return {
    categories,
    totalYes,
    status: totalYes >= 15 ? "安定" : totalYes >= 10 ? "改善点あり" : "リスクあり"
  };
} 