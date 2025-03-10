import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { renderFirstPage, renderSecondPage, FONT_NAME } from './PdfRendering';

// 日本語フォントのURL（参照用）
const FONT_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@4.5.0/files/noto-sans-jp-japanese-400-normal.woff';

export default function JapanesePdfGenerator({ data, printTargetRef, onGenerateStart, onGenerateEnd }) {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  
  // 日本語フォントの読み込みは必要ない（jsPDFに内蔵されているフォントを使用）
  useEffect(() => {
    // フォントは既に読み込み済みとして処理を続行
    setFontLoaded(true);
  }, []);
  
  // 評価関数は別ファイルに移動しました
  
  // PDFを生成する関数 - html2canvasを使用したアプローチ
  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    
    onGenerateStart();
    
    try {
      console.log('PDF生成開始');
      if (!printTargetRef || !printTargetRef.current) {
        throw new Error('印刷対象の要素が見つかりません');
      }

      // 2つのアプローチを組み合わせる
      // 1. HTML要素をキャンバスに変換（日本語テキストの問題を回避）
      // 2. 標準的なjsPDFの機能も使用（テーブルなど）

      // PDFのサイズを設定（A4）
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });
      
      // 日本語フォントを設定
      pdf.setFont(FONT_NAME);
      pdf.setLanguage('ja'); // 日本語設定

      // アプローチ1: 分割したファイルからPDFの基本部分を生成
      renderFirstPage(pdf, data);
      renderSecondPage(pdf);
      
      // アプローチ2: HTML要素をキャンバスに変換してPDFに追加
      if (printTargetRef && printTargetRef.current) {
        try {
          // HTML要素をキャンバスに変換
          const canvas = await html2canvas(printTargetRef.current, {
            scale: 2, // 高解像度
            useCORS: true, // クロスオリジン対応
            logging: false, // ログを無効化
            allowTaint: true, // 外部リソースを許可
          });
          
          // キャンバスをPDFに追加（3ページ目）
          pdf.addPage();
          
          // キャンバスをイメージとして追加
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          console.log('HTML要素をPDFに追加しました');
        } catch (canvasError) {
          console.error('HTML要素のキャンバス変換エラー:', canvasError);
          // エラーが発生しても処理を続行（基本的なPDFは生成済み）
        }
      }
      
      // PDFをブラウザで表示
      console.log('PDF生成準備完了');
      
      // PDFをBlobとして出力
      const pdfBlob = pdf.output('blob');
      // BlobからURLを作成
      const blobUrl = URL.createObjectURL(pdfBlob);
      // 新しいタブでPDFを開く
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
