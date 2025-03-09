import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

// 会社情報の設定
const COMPANY_INFO = {
  name: '株式会社デンタルクリニック',
  address: '東京都新宿区西新宿1-1-1',
  phone: '03-1234-5678',
  email: 'info@dental-clinic.example.com',
  website: 'https://dental-clinic.example.com'
};

export default function JapanesePdfGenerator({ data, onGenerateStart, onGenerateEnd }) {
  const pdfRef = useRef(null);
  
  // 評価を返す関数
  const getEvaluation = (score) => {
    if (score >= 4) return '優良';
    if (score >= 3) return '良好';
    if (score >= 2) return '要改善';
    return '要注意';
  };
  
  // PDFを生成する関数
  const generatePdf = async () => {
    if (!pdfRef.current) return;
    
    onGenerateStart();
    
    try {
      const { clinicInfo, results } = data;
      
      // HTML要素をキャンバスに変換
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // 高解像度
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      // PDFのサイズ設定
      const imgWidth = 210; // A4サイズの幅(mm)
      const pageHeight = 297; // A4サイズの高さ(mm)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const heightLeft = imgHeight;
      
      // PDFドキュメントの作成
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // キャンバスの内容をPDFに追加
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 会社情報をPDFに追加
      pdf.setFontSize(10);
      pdf.text('会社情報:', 20, 270);
      pdf.text(`${COMPANY_INFO.name}`, 20, 275);
      pdf.text(`住所: ${COMPANY_INFO.address}`, 20, 280);
      pdf.text(`電話: ${COMPANY_INFO.phone} | メール: ${COMPANY_INFO.email}`, 20, 285);
      pdf.text(`ウェブサイト: ${COMPANY_INFO.website}`, 20, 290);
      
      // PDFをダウンロード
      pdf.save(`診断結果_${clinicInfo.clinicName}.pdf`);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      onGenerateEnd();
    }
  };
  
  const { clinicInfo, results } = data;
  
  return (
    <>
      {/* PDF生成ボタン */}
      <button
        onClick={generatePdf}
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
      >
        日本語PDFをダウンロード
      </button>
      
      {/* PDF用のHTML要素（非表示） */}
      <div className="hidden">
        <div ref={pdfRef} className="bg-white p-8" style={{ width: '800px' }}>
          <h1 className="text-3xl font-bold mb-8 text-center">歯科医院経営診断結果</h1>
          
          <h2 className="text-xl font-bold mb-4">医院情報</h2>
          <p className="mb-2">医院名: {clinicInfo.clinicName}</p>
          <p className="mb-2">回答者: {clinicInfo.respondentName}</p>
          <p className="mb-2">診断日: {new Date(clinicInfo.date).toLocaleDateString('ja-JP')}</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">診断結果概要</h2>
          <p className="mb-2">総合評価: {results.status}</p>
          <p className="mb-2">全20問中 {results.totalYes}問が「はい」</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">カテゴリ別スコア</h2>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2 bg-gray-200">カテゴリ</th>
                <th className="border border-gray-400 p-2 bg-gray-200">スコア</th>
                <th className="border border-gray-400 p-2 bg-gray-200">評価</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2">財務管理</td>
                <td className="border border-gray-400 p-2">{results.categories.finance}/5</td>
                <td className="border border-gray-400 p-2">{getEvaluation(results.categories.finance)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">患者数・売上</td>
                <td className="border border-gray-400 p-2">{results.categories.patients}/5</td>
                <td className="border border-gray-400 p-2">{getEvaluation(results.categories.patients)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">スタッフ管理</td>
                <td className="border border-gray-400 p-2">{results.categories.staff}/5</td>
                <td className="border border-gray-400 p-2">{getEvaluation(results.categories.staff)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">患者満足度</td>
                <td className="border border-gray-400 p-2">{results.categories.satisfaction}/5</td>
                <td className="border border-gray-400 p-2">{getEvaluation(results.categories.satisfaction)}</td>
              </tr>
            </tbody>
          </table>
          
          <h2 className="text-xl font-bold mt-8 mb-4">改善アドバイス</h2>
          <div className="space-y-4">
            {results.categories.finance < 3 && (
              <p className="mb-2">【財務管理】毎月の収支を正確に把握し、3ヶ月先の資金計画を立てましょう。税理士などの専門家と定期的に相談することをお勧めします。</p>
            )}
            {results.categories.patients < 3 && (
              <p className="mb-2">【患者数・売上】新規患者とリピーターの比率分析、リコール率の向上に取り組みましょう。自由診療の提案方法も見直すと良いでしょう。</p>
            )}
            {results.categories.staff < 3 && (
              <p className="mb-2">【スタッフ管理】給与体系の見直しと教育研修の充実を図りましょう。労務トラブルの対応マニュアルも整備すると安心です。</p>
            )}
            {results.categories.satisfaction < 3 && (
              <p className="mb-2">【患者満足度】口コミ対策と院内環境の整備を優先し、定期的な患者アンケートを実施して改善に活かしましょう。</p>
            )}
            {results.categories.finance >= 3 && results.categories.patients >= 3 && 
             results.categories.staff >= 3 && results.categories.satisfaction >= 3 && (
              <p className="mb-2">全てのカテゴリで良好な結果です。現状を維持しながら、さらなる向上を目指しましょう。</p>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm">
            <p>© 2025 歯科医院経営診断システム</p>
          </div>
        </div>
      </div>
    </>
  );
}
