import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState } from 'react';



// 会社情報の設定
const COMPANY_INFO = {
  name: '株式会社デンタルクリニック',
  address: '東京都新宿区西新宿1-1-1',
  phone: '03-1234-5678',
  email: 'info@dental-clinic.example.com',
  website: 'https://dental-clinic.example.com'
};

export default function JapanesePdfGenerator({ data, onGenerateStart, onGenerateEnd }) {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 評価を返す関数
  const getEvaluation = (score) => {
    if (score >= 4) return '優良';
    if (score >= 3) return '良好';
    if (score >= 2) return '要改善';
    return '要注意';
  };
  
  // PDFを生成する関数
  const generatePdf = () => {
    setIsGenerating(true);
    setError(null);
    
    onGenerateStart();
    
    try {
      console.log('PDF生成開始');
      const { clinicInfo, results } = data;
      console.log('データ:', { clinicInfo, results });
      
      // テキストベースのPDFを直接生成する方法に変更
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // フォント設定
      pdf.setFont('Helvetica');
      pdf.setFontSize(10);
      
      // タイトル
      pdf.setFontSize(18);
      pdf.text('歯科医院経営診断結果', 105, 20, { align: 'center' });
      
      // 医院情報
      pdf.setFontSize(14);
      pdf.text('医院情報', 20, 40);
      pdf.setFontSize(12);
      pdf.text(`医院名: ${clinicInfo.clinicName}`, 20, 50);
      pdf.text(`回答者: ${clinicInfo.respondentName}`, 20, 57);
      pdf.text(`診断日: ${new Date(clinicInfo.date).toLocaleDateString('ja-JP')}`, 20, 64);
      
      // 診断結果概要
      pdf.setFontSize(14);
      pdf.text('診断結果概要', 20, 80);
      pdf.setFontSize(12);
      pdf.text(`総合評価: ${results.status}`, 20, 90);
      pdf.text(`全20問中 ${results.totalYes}問が「はい」`, 20, 97);
      
      // カテゴリ別スコア
      pdf.setFontSize(14);
      pdf.text('カテゴリ別スコア', 20, 115);
      
      // テーブルデータ
      const tableData = [
        ['カテゴリ', 'スコア', '評価'],
        ['財務管理', `${results.categories.finance}/5`, getEvaluation(results.categories.finance)],
        ['患者数・売上', `${results.categories.patients}/5`, getEvaluation(results.categories.patients)],
        ['スタッフ管理', `${results.categories.staff}/5`, getEvaluation(results.categories.staff)],
        ['患者満足度', `${results.categories.satisfaction}/5`, getEvaluation(results.categories.satisfaction)]
      ];
      
      // テーブルの描画
      pdf.autoTable({
        startY: 120,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] }
      });
      
      // 改善アドバイス
      let adviceY = pdf.autoTable.previous.finalY + 15;
      pdf.setFontSize(14);
      pdf.text('改善アドバイス', 20, adviceY);
      pdf.setFontSize(10);
      adviceY += 10;
      
      if (results.categories.finance < 3) {
        pdf.text('【財務管理】毎月の収支を正確に把握し、3ヶ月先の資金計画を立てましょう。税理士などの専門家と定期的に相談することをお勧めします。', 20, adviceY, { maxWidth: 170 });
        adviceY += 15;
      }
      
      if (results.categories.patients < 3) {
        pdf.text('【患者数・売上】新規患者とリピーターの比率分析、リコール率の向上に取り組みましょう。自由診療の提案方法も見直すと良いでしょう。', 20, adviceY, { maxWidth: 170 });
        adviceY += 15;
      }
      
      if (results.categories.staff < 3) {
        pdf.text('【スタッフ管理】給与体系の見直しと教育研修の充実を図りましょう。労務トラブルの対応マニュアルも整備すると安心です。', 20, adviceY, { maxWidth: 170 });
        adviceY += 15;
      }
      
      if (results.categories.satisfaction < 3) {
        pdf.text('【患者満足度】口コミ対策と院内環境の整備を優先し、定期的な患者アンケートを実施して改善に活かしましょう。', 20, adviceY, { maxWidth: 170 });
        adviceY += 15;
      }
      
      if (results.categories.finance >= 3 && results.categories.patients >= 3 && 
          results.categories.staff >= 3 && results.categories.satisfaction >= 3) {
        pdf.text('全てのカテゴリで良好な結果です。現状を維持しながら、さらなる向上を目指しましょう。', 20, adviceY, { maxWidth: 170 });
        adviceY += 15;
      }
      
      // 会社情報をPDFに追加
      pdf.setFontSize(10);
      pdf.text('会社情報:', 20, 270);
      pdf.text(`${COMPANY_INFO.name}`, 20, 275);
      pdf.text(`住所: ${COMPANY_INFO.address}`, 20, 280);
      pdf.text(`電話: ${COMPANY_INFO.phone} | メール: ${COMPANY_INFO.email}`, 20, 285);
      pdf.text(`ウェブサイト: ${COMPANY_INFO.website}`, 20, 290);
      
      // PDFをブラウザで表示
      console.log('PDF生成準備完了');
      try {
        // PDFをBlobとして出力
        const pdfBlob = pdf.output('blob');
        // BlobからURLを作成
        const blobUrl = URL.createObjectURL(pdfBlob);
        // 新しいタブでPDFを開く
        window.open(blobUrl, '_blank');
        console.log('PDF生成完了、ブラウザで表示しました');
      } catch (saveError) {
        console.error('PDFの表示中にエラーが発生しました:', saveError);
        throw new Error('PDFの表示中にエラーが発生しました: ' + saveError.message);
      }
    } catch (error) {
      console.error('PDF生成エラー:', error);
      setError(error.message || 'PDFの生成中にエラーが発生しました');
      alert(`PDFの生成中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
      onGenerateEnd();
    }
  };
  
  const { clinicInfo, results } = data;
  
  return (
    <>
      {/* PDF生成ボタン */}
      <button
        onClick={generatePdf}
        disabled={isGenerating}
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PDF生成中...
          </span>
        ) : "日本語PDFを表示"}
      </button>
      
      {/* エラーメッセージ表示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>エラー: {error}</p>
          <p className="text-sm mt-1">ブラウザのコンソールを確認してください</p>
        </div>
      )}
    </>
  );
}
