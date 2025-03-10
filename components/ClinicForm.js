import { useState, useEffect } from 'react';

export default function ClinicForm({ onSubmit, isSubmitting }) {
  // 現在の日付を YYYY-MM-DD 形式で取得
  const today = new Date().toISOString().split('T')[0];
  
  const [clinicInfo, setClinicInfo] = useState({
    clinicName: '',
    respondentName: '',
    email: '',
    date: today, // 現在の日付をデフォルト値として設定
  });
  
  const [answers, setAnswers] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: null, q7: null, q8: null, q9: null, q10: null,
    q11: null, q12: null, q13: null, q14: null, q15: null,
    q16: null, q17: null, q18: null, q19: null, q20: null,
  });
  
  const [isFormValid, setIsFormValid] = useState(false);
  
  // フォームの検証
  useEffect(() => {
    const infoValid = clinicInfo.clinicName && clinicInfo.respondentName && clinicInfo.email;
    const answersValid = Object.values(answers).every(a => a !== null);
    setIsFormValid(infoValid && answersValid);
  }, [clinicInfo, answers]);
  
  const handleInfoChange = (e) => {
    setClinicInfo({
      ...clinicInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAnswerChange = (question, value) => {
    setAnswers({
      ...answers,
      [question]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({ clinicInfo, answers });
    }
  };
  
  // 質問リスト
  const questions = [
    // 財務管理
    { id: 'q1', category: '財務管理', text: '毎月の収支を把握していますか？' },
    { id: 'q2', category: '財務管理', text: '年間の経費削減目標を設定していますか？' },
    { id: 'q3', category: '財務管理', text: '保険診療と自費診療の割合を把握していますか？' },
    { id: 'q4', category: '財務管理', text: '固定費と変動費を区別して管理していますか？' },
    { id: 'q5', category: '財務管理', text: '税理士と定期的に打ち合わせをしていますか？' },
    
    // 患者数・売上
    { id: 'q6', category: '患者数・売上', text: '新患数を毎月集計していますか？' },
    { id: 'q7', category: '患者数・売上', text: '再来院率を把握していますか？' },
    { id: 'q8', category: '患者数・売上', text: '患者一人あたりの平均診療単価を把握していますか？' },
    { id: 'q9', category: '患者数・売上', text: '診療圏内の競合状況を把握していますか？' },
    { id: 'q10', category: '患者数・売上', text: 'ウェブサイトやSNSでの集患対策を行っていますか？' },
    
    // スタッフ管理
    { id: 'q11', category: 'スタッフ管理', text: 'スタッフとの定期的な面談を実施していますか？' },
    { id: 'q12', category: 'スタッフ管理', text: 'スタッフの教育・研修計画がありますか？' },
    { id: 'q13', category: 'スタッフ管理', text: '給与体系は明確ですか？' },
    { id: 'q14', category: 'スタッフ管理', text: 'スタッフの業務マニュアルはありますか？' },
    { id: 'q15', category: 'スタッフ管理', text: 'スタッフの離職率は低いですか？' },
    
    // 患者満足度
    { id: 'q16', category: '患者満足度', text: '患者アンケートを定期的に実施していますか？' },
    { id: 'q17', category: '患者満足度', text: '待ち時間の短縮に取り組んでいますか？' },
    { id: 'q18', category: '患者満足度', text: '治療内容の説明は十分に行っていますか？' },
    { id: 'q19', category: '患者満足度', text: '院内の清潔感を保つ工夫をしていますか？' },
    { id: 'q20', category: '患者満足度', text: '患者からの紹介が多いですか？' },
  ];

  // カテゴリー別の色設定
  const categoryColors = {
    '財務管理': 'border-indigo-500 bg-indigo-50',
    '患者数・売上': 'border-amber-500 bg-amber-50',
    'スタッフ管理': 'border-emerald-500 bg-emerald-50',
    '患者満足度': 'border-rose-500 bg-rose-50'
  };
  
  // 日本語の日付フォーマット（YYYY年MM月DD日）に変換する関数
  const formatDateJP = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pb-2 border-b">医院情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="clinicName">医院名</label>
            <div className="bg-blue-50 border-2 border-indigo-300 rounded-lg overflow-hidden">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="clinicName"
                  name="clinicName"
                  value={clinicInfo.clinicName}
                  onChange={handleInfoChange}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="例：○○歯科クリニック"
                  required
                  autoComplete="off"
                  style={{ color: '#000000' }} // 文字色を明示的に黒に設定
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="respondentName">回答者名</label>
            <div className="bg-blue-50 border-2 border-indigo-300 rounded-lg overflow-hidden">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="respondentName"
                  name="respondentName"
                  value={clinicInfo.respondentName}
                  onChange={handleInfoChange}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="例：山田 太郎"
                  required
                  autoComplete="off"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">メールアドレス</label>
            <div className="bg-blue-50 border-2 border-indigo-300 rounded-lg overflow-hidden">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={clinicInfo.email}
                  onChange={handleInfoChange}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="例：info@example.com"
                  required
                  autoComplete="off"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="date">診断日</label>
            <div className="bg-blue-50 border-2 border-indigo-300 rounded-lg overflow-hidden">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={clinicInfo.date}
                  onChange={handleInfoChange}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                  required
                  autoComplete="off"
                  style={{ color: '#000000' }}
                />
                <div className="px-4 py-3 text-gray-700 font-medium">
                  {clinicInfo.date && formatDateJP(clinicInfo.date)}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>今日の日付: {formatDateJP(today)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pb-2 border-b">診断チェックシート</h2>
        <p className="mb-6 text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">各質問に対して「はい」または「いいえ」でお答えください。正確な診断結果を得るために、すべての質問にお答えください。</p>
        
        {Object.entries(
          questions.reduce((acc, q) => {
            if (!acc[q.category]) acc[q.category] = [];
            acc[q.category].push(q);
            return acc;
          }, {})
        ).map(([category, categoryQuestions], categoryIndex) => (
          <div key={category} className={`mb-8 p-6 rounded-lg border-l-4 ${categoryColors[category]}`}>
            <h3 className="text-xl font-bold mb-4 text-gray-800">{category}</h3>
            
            {categoryQuestions.map((question, index) => (
              <div key={question.id} className="p-4 bg-white rounded-lg shadow-sm mb-3 border border-gray-100">
                <p className="mb-3 font-medium text-gray-800">{index + 1}. {question.text}</p>
                <div className="flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="true"
                      checked={answers[question.id] === true}
                      onChange={() => handleAnswerChange(question.id, true)}
                      className="form-radio h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-800">はい</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="false"
                      checked={answers[question.id] === false}
                      onChange={() => handleAnswerChange(question.id, false)}
                      className="form-radio h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-800">いいえ</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`px-8 py-4 rounded-lg text-lg font-semibold shadow-md transition-all duration-200 ${
            isFormValid && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-1'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              送信中...
            </span>
          ) : '診断結果を見る'}
        </button>
        
        <p className="mt-4 text-sm text-gray-500">
          ※ すべての質問に回答すると診断結果が表示されます
        </p>
      </div>
    </form>
  );
} 