import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState } from 'react';
import html2canvas from 'html2canvas';



// 会社情報の設定
const COMPANY_INFO = {
  name: '株式会社デンタルクリニック',
  address: '東京都新宿区西新宿1-1-1',
  phone: '03-1234-5678',
  email: 'info@dental-clinic.example.com',
  website: 'https://dental-clinic.example.com'
};

export default function JapanesePdfGenerator({ data, printTargetRef, onGenerateStart, onGenerateEnd }) {
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
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    onGenerateStart();
    
    try {
      console.log('PDF生成開始');
      if (!printTargetRef || !printTargetRef.current) {
        throw new Error('印刷対象の要素が見つかりません');
      }

      // 会社情報の準備
      const companyInfoHtml = `
        <div style="font-family: sans-serif; font-size: 10px; padding: 10px; border-top: 1px solid #eee; margin-top: 20px;">
          <p><strong>会社情報:</strong></p>
          <p>${COMPANY_INFO.name}</p>
          <p>住所: ${COMPANY_INFO.address}</p>
          <p>電話: ${COMPANY_INFO.phone} | メール: ${COMPANY_INFO.email}</p>
          <p>ウェブサイト: ${COMPANY_INFO.website}</p>
        </div>
      `;
      
      // 会社情報を表示するための一時的な要素を作成
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = companyInfoHtml;
      tempDiv.style.position = 'absolute';
      tempDiv.style.bottom = '0';
      tempDiv.style.width = '100%';
      tempDiv.style.backgroundColor = 'white';
      
      // 一時的な要素を追加
      printTargetRef.current.appendChild(tempDiv);
      
      console.log('HTML要素のキャプチャを開始');
      
      try {
        // HTML要素をキャンバスに変換
        const canvas = await html2canvas(printTargetRef.current, {
          scale: 2, // 高解像度
          useCORS: true, // 外部リソースを許可
          logging: false, // ログを無効化
          backgroundColor: '#ffffff', // 背景色を白に
          scrollY: -window.scrollY // スクロール位置を考慮
        });
        
        // キャンバスからイメージデータを取得
        const imgData = canvas.toDataURL('image/png');
        
        // PDFのサイズを設定（A4）
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // キャンバスの縦横比を計算
        const imgWidth = 210; // A4の幅（mm）
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // イメージをPDFに追加
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // PDFをブラウザで表示
        console.log('PDF生成準備完了');
        
        // PDFをBlobとして出力
        const pdfBlob = pdf.output('blob');
        // BlobからURLを作成
        const blobUrl = URL.createObjectURL(pdfBlob);
        // 新しいタブでPDFを開く
        window.open(blobUrl, '_blank');
        console.log('PDF生成完了、ブラウザで表示しました');
      } catch (captureError) {
        console.error('HTML要素のキャプチャ中にエラーが発生しました:', captureError);
        throw new Error('HTML要素のキャプチャ中にエラーが発生しました: ' + captureError.message);
      } finally {
        // 一時的な要素を削除
        if (tempDiv && tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
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
        ) : "診断結果をPDFで表示"}
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
