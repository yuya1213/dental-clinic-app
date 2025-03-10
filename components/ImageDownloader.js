import { useState } from 'react';
import html2canvas from 'html2canvas';

// シンプルなキャンバスオプション
const CANVAS_OPTIONS = {
  scale: 2, // 適度な解像度
  useCORS: true,
  backgroundColor: '#ffffff',
  allowTaint: true
};

export default function ImageDownloader({ data, printTargetRef, onGenerateStart, onGenerateEnd }) {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 画像としてダウンロードする関数（シンプル版）
  const downloadAsImage = async () => {
    setIsGenerating(true);
    setError(null);
    onGenerateStart();
    
    try {
      console.log('画像生成開始');
      if (!printTargetRef || !printTargetRef.current) {
        throw new Error('印刷対象の要素が見つかりません');
      }
      
      // 直接要素をキャンバスに変換
      const canvas = await html2canvas(printTargetRef.current, CANVAS_OPTIONS);
      console.log('HTML要素をキャンバスに変換しました');
      
      // キャンバスを画像としてダウンロード
      const imgData = canvas.toDataURL('image/png', 1.0);
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
  
  return (
    <div className="flex flex-col space-y-4">
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
