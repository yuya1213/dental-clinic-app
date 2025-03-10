import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

// 定数定義
const PDF_OPTIONS = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  compress: true
};

const CANVAS_OPTIONS = {
  scale: 3, // 高解像度を上げる
  useCORS: true, // クロスオリジン対応
  logging: false, // ログを無効化
  allowTaint: true, // 外部リソースを許可
  backgroundColor: '#ffffff', // 背景色を白に設定
  imageTimeout: 0, // 画像のロードタイムアウトを無効化
  removeContainer: true, // 一時的なコンテナを削除
  letterRendering: true, // 文字を個別にレンダリング
  foreignObjectRendering: false // foreignObjectを使用しない
};

export default function JapanesePdfGenerator({ data, printTargetRef, onGenerateStart, onGenerateEnd }) {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // プリント前に要素のスタイルを調整する関数
  const prepareElementForPrinting = (element) => {
    // 元のスタイルを保存
    const originalStyles = {};
    const elementsToStyle = element.querySelectorAll('*');
    
    // すべてのテキスト要素の色を濃くする
    elementsToStyle.forEach((el, index) => {
      // テキスト要素のみ対象
      if (el.innerText && el.innerText.trim().length > 0) {
        originalStyles[index] = {
          color: el.style.color,
          fontWeight: el.style.fontWeight,
          textShadow: el.style.textShadow
        };
        
        // 色を濃くし、フォントを太くする
        el.style.color = '#000000';
        el.style.fontWeight = 'bold';
        // テキストにシャドウを追加して読みやすくする
        el.style.textShadow = '0 0 0 #000';
      }
    });
    
    return () => {
      // 元のスタイルに戻す
      elementsToStyle.forEach((el, index) => {
        if (originalStyles[index]) {
          el.style.color = originalStyles[index].color;
          el.style.fontWeight = originalStyles[index].fontWeight;
          el.style.textShadow = originalStyles[index].textShadow;
        }
      });
    };
  };
  
  // HTML要素をキャンバスに変換してPDFを生成する関数
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    onGenerateStart();
    
    try {
      console.log('PDF生成開始');
      if (!printTargetRef || !printTargetRef.current) {
        throw new Error('印刷対象の要素が見つかりません');
      }
      
      // プリント前に要素のスタイルを調整
      const restoreStyles = prepareElementForPrinting(printTargetRef.current);
      
      // HTML要素をキャンバスに変換
      const canvas = await html2canvas(printTargetRef.current, CANVAS_OPTIONS);
      console.log('HTML要素をキャンバスに変換しました');
      
      // スタイルを元に戻す
      restoreStyles();
      
      // PDFを生成
      const pdf = new jsPDF(PDF_OPTIONS);
      
      // キャンバスを高品質のPNGとしてPDFに追加
      const imgData = canvas.toDataURL('image/png', 1.0); // 最高品質
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // コントラストを高めるための設定
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      console.log('キャンバスをPDFに追加しました');
      
      // PDFをブラウザで表示
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
      console.log('PDF生成完了、ブラウザで表示しました');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      setError(error.message || 'PDFの生成中にエラーが発生しました');
      alert(`PDFの生成中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
      onGenerateEnd();
    }
  };
  
  // 画像としてダウンロードする関数
  const downloadAsImage = async () => {
    setIsGenerating(true);
    setError(null);
    
    onGenerateStart();
    
    try {
      console.log('画像生成開始');
      if (!printTargetRef || !printTargetRef.current) {
        throw new Error('印刷対象の要素が見つかりません');
      }
      
      // プリント前に要素のスタイルを調整
      const restoreStyles = prepareElementForPrinting(printTargetRef.current);

      // HTML要素をキャンバスに変換
      const canvas = await html2canvas(printTargetRef.current, CANVAS_OPTIONS);
      console.log('HTML要素をキャンバスに変換しました');
      
      // スタイルを元に戻す
      restoreStyles();
      
      // キャンバスを高品質の画像としてダウンロード
      const imgData = canvas.toDataURL('image/png', 1.0); // 最高品質
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `診断結果_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('画像のダウンロードが完了しました');
    } catch (error) {
      console.error('画像生成エラー:', error);
      setError(error.message || '画像の生成中にエラーが発生しました');
      alert(`画像の生成中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
      onGenerateEnd();
    }
  };
  
  const { clinicInfo, results } = data;
  
  return (
    <div className="flex flex-col space-y-4">
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
            処理中...
          </span>
        ) : "診断結果をPDFで表示"}
      </button>
      
      {/* 画像ダウンロードボタン */}
      <button
        onClick={downloadAsImage}
        disabled={isGenerating}
        className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            処理中...
          </span>
        ) : "診断結果を画像でダウンロード"}
      </button>
      
      {/* エラーメッセージ表示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>エラー: {error}</p>
          <p className="text-sm mt-1">ブラウザのコンソールを確認してください</p>
        </div>
      )}
    </div>
  );
}
