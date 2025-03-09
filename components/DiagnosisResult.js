import { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import dynamic from 'next/dynamic';

// クライアント側でのみ読み込むようにする（SSRを無効化）
const JapanesePdfGenerator = dynamic(
  () => import('./JapanesePdfGenerator'),
  { ssr: false }
);

export default function DiagnosisResult({ data, onRestart, onDownloadPdf, isPdfGenerating: externalIsPdfGenerating }) {
  // 内部でもPDF生成状態を管理する
  const [isPdfGenerating, setIsPdfGenerating] = useState(externalIsPdfGenerating);
  const { clinicInfo, answers, results } = data;
  
  // レーダーチャートデータの生成
  const getChartData = () => {
    return [
      {
        subject: "財務管理",
        A: (results.categories.finance / 5) * 100,
        fullMark: 100
      },
      {
        subject: "患者数",
        A: (results.categories.patients / 5) * 100,
        fullMark: 100
      },
      {
        subject: "スタッフ管理",
        A: (results.categories.staff / 5) * 100,
        fullMark: 100
      },
      {
        subject: "満足度",
        A: (results.categories.satisfaction / 5) * 100,
        fullMark: 100
      }
    ];
  };
  
  // ステータスに応じたメッセージと色
  let statusColor = "text-emerald-600";
  let statusBgColor = "bg-emerald-50";
  let statusBorderColor = "border-emerald-500";
  let statusMessage = "経営は安定しています！今の体制を維持しながら改善を進めましょう。";
  let detailedAdvice = "現在の良好な経営状態を維持するために、定期的な経営状況の確認を続けてください。新しい取り組みや技術の導入も積極的に検討し、さらなる成長を目指しましょう。";
  
  if (results.totalYes < 10) {
    statusColor = "text-rose-600";
    statusBgColor = "bg-rose-50";
    statusBorderColor = "border-rose-500";
    statusMessage = "経営にリスクあり！早めに対策を講じることをおすすめします。";
    detailedAdvice = "現在の経営状況には改善すべき点が多くあります。まずは財務状況を正確に把握し、スタッフとの情報共有を徹底しましょう。専門家へのコンサルティング依頼も検討してください。";
  } else if (results.totalYes < 15) {
    statusColor = "text-amber-600";
    statusBgColor = "bg-amber-50";
    statusBorderColor = "border-amber-500";
    statusMessage = "改善点がいくつかあります。弱い部分を強化しましょう。";
    detailedAdvice = "ある程度の経営基盤はできていますが、いくつかの分野で改善が必要です。特にスコアの低い分野から優先的に取り組み、バランスの取れた経営を目指しましょう。";
  }
  
  // カテゴリ別アドバイス
  const categoryAdvice = [];
  if (results.categories.finance < 3) {
    categoryAdvice.push("【財務管理】毎月の収支を正確に把握し、3ヶ月先の資金計画を立てましょう。税理士などの専門家と定期的に相談することをお勧めします。");
  }
  if (results.categories.patients < 3) {
    categoryAdvice.push("【患者数・売上】新規患者とリピーターの比率分析、リコール率の向上に取り組みましょう。自由診療の提案方法も見直すと良いでしょう。");
  }
  if (results.categories.staff < 3) {
    categoryAdvice.push("【スタッフ管理】給与体系の見直しと教育研修の充実を図りましょう。労務トラブルの対応マニュアルも整備すると安心です。");
  }
  if (results.categories.satisfaction < 3) {
    categoryAdvice.push("【患者満足度】口コミ対策と院内環境の整備を優先し、定期的な患者アンケートを実施して改善に活かしましょう。");
  }

  // カテゴリ別の色設定
  const categoryColors = {
    finance: {
      text: "text-indigo-600",
      bg: "bg-indigo-500",
      light: "bg-indigo-100"
    },
    patients: {
      text: "text-amber-600",
      bg: "bg-amber-500",
      light: "bg-amber-100"
    },
    staff: {
      text: "text-emerald-600",
      bg: "bg-emerald-500",
      light: "bg-emerald-100"
    },
    satisfaction: {
      text: "text-rose-600",
      bg: "bg-rose-500",
      light: "bg-rose-100"
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mb-6 animate-fade-in max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">診断結果</h2>
      
      <div className={`${statusBgColor} p-6 rounded-lg border ${statusBorderColor} mb-10`}>
        <div className={`text-2xl font-bold ${statusColor} mb-4 text-center`}>
          {results.status}
        </div>
        <p className="text-lg mb-3 font-medium text-gray-700">{statusMessage}</p>
        <p className="text-gray-600">{detailedAdvice}</p>
        <div className="mt-4 text-center">
          <span className="inline-block bg-white px-4 py-2 rounded-full text-gray-700 font-medium shadow-sm">
            全20問中 <span className={`font-bold ${statusColor}`}>{results.totalYes}問</span> が「はい」
          </span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-10 mb-12">
        <div className="lg:w-1/2">
          <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">カテゴリ別スコア</h3>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-indigo-600">財務管理</span>
                <span className="font-bold text-lg">{results.categories.finance}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(results.categories.finance/5)*100}%` }}></div>
              </div>
              <p className="text-gray-600 text-sm">財務状況の把握と計画的な経営</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-amber-600">患者数</span>
                <span className="font-bold text-lg">{results.categories.patients}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${(results.categories.patients/5)*100}%` }}></div>
              </div>
              <p className="text-gray-600 text-sm">患者数の管理と売上向上の取り組み</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-emerald-600">スタッフ管理</span>
                <span className="font-bold text-lg">{results.categories.staff}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${(results.categories.staff/5)*100}%` }}></div>
              </div>
              <p className="text-gray-600 text-sm">スタッフの育成と労務管理</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-lg text-rose-600">満足度</span>
                <span className="font-bold text-lg">{results.categories.satisfaction}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${(results.categories.satisfaction/5)*100}%` }}></div>
              </div>
              <p className="text-gray-600 text-sm">患者体験の向上と口コミ対策</p>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">経営バランス分析</h3>
          <div className="h-80 lg:h-96 bg-white p-4 rounded-lg shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="65%" data={getChartData()}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 500 }}
                  stroke="#9ca3af"
                  axisLine={{ strokeWidth: 1.5 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickCount={4}
                  tickFormatter={(value) => value === 0 ? '' : `${value}`}
                  angle={45}
                  orientation="left"
                />
                <Radar
                  name="経営状況"
                  dataKey="A"
                  stroke="#4f46e5"
                  fill="#818cf8"
                  fillOpacity={0.6}
                  dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                  activeDot={{ r: 7, strokeWidth: 2, fill: "#ffffff" }}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-400 opacity-70 mr-2 rounded-sm"></div>
              <span className="text-sm font-medium text-gray-700">現在の経営状況（100点満点）</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 max-w-xs mx-auto">
              <div className="text-left">財務管理: 財務状況の把握</div>
              <div className="text-left">患者数: 患者数と売上</div>
              <div className="text-left">スタッフ管理: 人材育成</div>
              <div className="text-left">満足度: 患者満足度</div>
            </div>
          </div>
        </div>
      </div>
      
      {categoryAdvice.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">改善提案</h3>
          <div className="space-y-4">
            {categoryAdvice.map((advice, index) => {
              const category = advice.includes("財務管理") ? "finance" : 
                              advice.includes("患者数・売上") ? "patients" : 
                              advice.includes("スタッフ管理") ? "staff" : "satisfaction";
              const colors = categoryColors[category];
              
              return (
                <div key={index} className={`${colors.light} p-5 rounded-lg border-l-4 ${colors.bg === 'bg-indigo-500' ? 'border-indigo-500' : colors.bg === 'bg-amber-500' ? 'border-amber-500' : colors.bg === 'bg-emerald-500' ? 'border-emerald-500' : 'border-rose-500'}`}>
                  <p className="text-gray-800">{advice}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-center gap-6 mt-10">
        <button
          onClick={onDownloadPdf}
          disabled={isPdfGenerating}
          className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isPdfGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              PDF生成中...
            </span>
          ) : "PDFをダウンロード（英語）"}
        </button>
        
        {/* 日本語PDF生成コンポーネント */}
        <JapanesePdfGenerator 
          data={data} 
          onGenerateStart={() => setIsPdfGenerating(true)}
          onGenerateEnd={() => setIsPdfGenerating(false)}
        />
        
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          新しい診断を開始
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        PDFには会社の問い合わせ先とWebサイトのQRコードが記載されています
      </div>
    </div>
  );
} 