import { useState, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import dynamic from 'next/dynamic';

// クライアント側でのみ読み込むようにする（SSRを無効化）
const ImageDownloader = dynamic(
  () => import('./ImageDownloader'),
  { ssr: false }
);

// テキストの色を濃くするためのスタイル定義
const darkTextStyles = {
  heading: 'text-gray-900 font-extrabold',
  subheading: 'text-gray-800 font-bold',
  normalText: 'text-gray-800',
  smallText: 'text-gray-700'
};

export default function DiagnosisResult({ data, onRestart, onDownloadPdf, isPdfGenerating: externalIsPdfGenerating }) {
  // 内部でもPDF生成状態を管理する
  const [isPdfGenerating, setIsPdfGenerating] = useState(externalIsPdfGenerating);
  const { clinicInfo, answers, results } = data;
  
  // PDF生成用の参照を作成
  const printTargetRef = useRef(null);
  
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
  
  // ステータスに応じたメッセージと色（より濃い色に調整）
  let statusColor = "text-emerald-800";
  let statusBgColor = "bg-emerald-100";
  let statusBorderColor = "border-emerald-600";
  let statusMessage = "経営は安定しています！今の体制を維持しながら改善を進めましょう。";
  let detailedAdvice = "現在の良好な経営状態を維持するために、定期的な経営状況の確認を続けてください。新しい取り組みや技術の導入も積極的に検討し、さらなる成長を目指しましょう。";
  
  if (results.totalYes < 10) {
    statusColor = "text-rose-800";
    statusBgColor = "bg-rose-100";
    statusBorderColor = "border-rose-600";
    statusMessage = "経営にリスクあり！早めに対策を講じることをおすすめします。";
    detailedAdvice = "現在の経営状況には改善すべき点が多くあります。まずは財務状況を正確に把握し、スタッフとの情報共有を徹底しましょう。専門家へのコンサルティング依頼も検討してください。";
  } else if (results.totalYes < 15) {
    statusColor = "text-amber-800";
    statusBgColor = "bg-amber-100";
    statusBorderColor = "border-amber-600";
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

  // カテゴリ別の色設定（より濃い色に調整）
  const categoryColors = {
    finance: {
      text: "text-indigo-800",
      bg: "bg-indigo-600",
      light: "bg-indigo-200"
    },
    patients: {
      text: "text-amber-800",
      bg: "bg-amber-600",
      light: "bg-amber-200"
    },
    staff: {
      text: "text-emerald-800",
      bg: "bg-emerald-600",
      light: "bg-emerald-200"
    },
    satisfaction: {
      text: "text-rose-800",
      bg: "bg-rose-600",
      light: "bg-rose-200"
    }
  };
  
  return (
    <div ref={printTargetRef} className="bg-white p-8 rounded-xl shadow-lg mb-6 animate-fade-in max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">診断結果</h2>
      
      <div className={`${statusBgColor} p-6 rounded-lg border ${statusBorderColor} mb-10`}>
        <div className={`text-2xl font-bold ${statusColor} mb-4 text-center`}>
          {results.status}
        </div>
        <p className="text-lg mb-3 font-bold text-gray-800">{statusMessage}</p>
        <p className="text-gray-700 font-medium">{detailedAdvice}</p>
        <div className="mt-4 text-center">
          <span className="inline-block bg-white px-4 py-2 rounded-full text-gray-800 font-bold shadow-md border border-gray-300">
            全20問中 <span className={`font-extrabold ${statusColor}`}>{results.totalYes}問</span> が「はい」
          </span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-10 mb-12">
        <div className="lg:w-1/2">
          <h3 className="text-xl font-extrabold mb-6 text-gray-900 pb-2 border-b-2 border-gray-300">カテゴリ別スコア</h3>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-lg text-indigo-800">財務管理</span>
                <span className="font-extrabold text-lg text-gray-900">{results.categories.finance}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 border border-gray-300">
                <div className="bg-indigo-600 h-4 rounded-full shadow-inner" style={{ width: `${(results.categories.finance/5)*100}%` }}></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">財務状況の把握と計画的な経営</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-lg text-amber-800">患者数</span>
                <span className="font-extrabold text-lg text-gray-900">{results.categories.patients}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 border border-gray-300">
                <div className="bg-amber-600 h-4 rounded-full shadow-inner" style={{ width: `${(results.categories.patients/5)*100}%` }}></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">患者数の管理と売上向上の取り組み</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-lg text-emerald-800">スタッフ管理</span>
                <span className="font-extrabold text-lg text-gray-900">{results.categories.staff}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 border border-gray-300">
                <div className="bg-emerald-600 h-4 rounded-full shadow-inner" style={{ width: `${(results.categories.staff/5)*100}%` }}></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">スタッフの育成と労務管理</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-lg text-rose-800">満足度</span>
                <span className="font-extrabold text-lg text-gray-900">{results.categories.satisfaction}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 border border-gray-300">
                <div className="bg-rose-600 h-4 rounded-full shadow-inner" style={{ width: `${(results.categories.satisfaction/5)*100}%` }}></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">患者体験の向上と口コミ対策</p>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <h3 className="text-xl font-extrabold mb-6 text-gray-900 pb-2 border-b-2 border-gray-300">経営バランス分析</h3>
          <div className="h-80 lg:h-96 bg-white p-4 rounded-lg shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="65%" data={getChartData()}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#1f2937', fontSize: 14, fontWeight: 700 }}
                  stroke="#4b5563"
                  axisLine={{ strokeWidth: 2 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
                  tickCount={4}
                  tickFormatter={(value) => value === 0 ? '' : `${value}`}
                  angle={45}
                  orientation="left"
                />
                <Radar
                  name="経営状況"
                  dataKey="A"
                  stroke="#3730a3"
                  fill="#6366f1"
                  fillOpacity={0.8}
                  dot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
                  activeDot={{ r: 8, strokeWidth: 2, fill: "#ffffff" }}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-5 h-5 bg-indigo-600 opacity-80 mr-2 rounded-sm border border-indigo-800"></div>
              <span className="text-sm font-bold text-gray-800">現在の経営状況（100点満点）</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700 font-medium max-w-xs mx-auto">
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
          <h3 className="text-xl font-extrabold mb-6 text-gray-900 pb-2 border-b-2 border-gray-300">改善提案</h3>
          <div className="space-y-4">
            {categoryAdvice.map((advice, index) => {
              const category = advice.includes("財務管理") ? "finance" : 
                              advice.includes("患者数・売上") ? "patients" : 
                              advice.includes("スタッフ管理") ? "staff" : "satisfaction";
              const colors = categoryColors[category];
              
              return (
                <div key={index} className={`${colors.light} p-5 rounded-lg border-l-4 ${colors.bg === 'bg-indigo-600' ? 'border-indigo-600' : colors.bg === 'bg-amber-600' ? 'border-amber-600' : colors.bg === 'bg-emerald-600' ? 'border-emerald-600' : 'border-rose-600'} shadow-md`}>
                  <p className="text-gray-900 font-medium">{advice}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-center gap-6 mt-10">
        {/* 画像ダウンロードコンポーネント */}
        <ImageDownloader 
          data={data} 
          printTargetRef={printTargetRef}
          onGenerateStart={() => setIsPdfGenerating(true)}
          onGenerateEnd={() => setIsPdfGenerating(false)}
        />
        
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gray-200 text-gray-900 font-bold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 transition-colors duration-200 border-2 border-gray-400"
        >
          新しい診断を開始
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-700 font-medium">
        PDFには会社の問い合わせ先とWebサイトのQRコードが記載されています
      </div>
    </div>
  );
} 