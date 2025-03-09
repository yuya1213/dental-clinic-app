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

      // 元のスタイルを保存
      const originalStyles = {};
      const elementsToEnhance = printTargetRef.current.querySelectorAll('*');
      
      // 印刷用に一時的にスタイルを強化
      elementsToEnhance.forEach((element, index) => {
        // 現在のスタイルを保存
        originalStyles[index] = {
          color: element.style.color,
          backgroundColor: element.style.backgroundColor,
          borderColor: element.style.borderColor,
          fontSize: element.style.fontSize
        };
        
        // テキストの色を濃くする
        if (window.getComputedStyle(element).color.includes('rgba') || 
            window.getComputedStyle(element).color.includes('rgb(')) {
          element.style.color = '#000000';
        }
        
        // 背景色がある場合は濃くする
        if (window.getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)' && 
            window.getComputedStyle(element).backgroundColor !== 'transparent') {
          const bgColor = window.getComputedStyle(element).backgroundColor;
          if (bgColor.includes('rgba')) {
            // 透明度を下げる
            element.style.backgroundColor = bgColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, 'rgba($1, $2, $3, 1)');
          }
        }
        
        // ボーダーがある場合は濃くする
        if (window.getComputedStyle(element).borderColor !== 'rgb(0, 0, 0)' && 
            window.getComputedStyle(element).borderWidth !== '0px') {
          element.style.borderColor = '#000000';
        }
      });

      // 会社情報の準備
      const companyInfoHtml = `
        <div style="font-family: sans-serif; font-size: 10px; padding: 10px; border-top: 1px solid #000; margin-top: 10px;">
          <p style="margin: 2px 0; color: #000;"><strong>会社情報:</strong></p>
          <p style="margin: 2px 0; color: #000;">${COMPANY_INFO.name}</p>
          <p style="margin: 2px 0; color: #000;">住所: ${COMPANY_INFO.address}</p>
          <p style="margin: 2px 0; color: #000;">電話: ${COMPANY_INFO.phone} | メール: ${COMPANY_INFO.email}</p>
          <p style="margin: 2px 0; color: #000;">ウェブサイト: ${COMPANY_INFO.website}</p>
        </div>
      `;
      
      // 会社情報を表示するための一時的な要素を作成
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = companyInfoHtml;
      tempDiv.style.position = 'absolute';
      tempDiv.style.bottom = '0';
      tempDiv.style.width = '100%';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = '#000000';
      
      // 一時的な要素を追加
      printTargetRef.current.appendChild(tempDiv);
      
      // 元のサイズを保存
      const originalWidth = printTargetRef.current.style.width;
      const originalHeight = printTargetRef.current.style.height;
      const originalMaxWidth = printTargetRef.current.style.maxWidth;
      
      // 1ページに収まるようにサイズを調整
      printTargetRef.current.style.width = '210mm';
      printTargetRef.current.style.maxWidth = '210mm';
      
      console.log('HTML要素のキャプチャを開始');
      
      try {
        // HTML要素をキャンバスに変換
        const canvas = await html2canvas(printTargetRef.current, {
          scale: 1.5, // 解像度調整（1ページに収まるように調整）
          useCORS: true, // 外部リソースを許可
          logging: false, // ログを無効化
          backgroundColor: '#ffffff', // 背景色を白に
          scrollY: -window.scrollY, // スクロール位置を考慮
          windowWidth: 1000, // 固定幅を設定
          windowHeight: 1414, // A4比率に合わせた高さ
          imageTimeout: 0, // 画像読み込みタイムアウトなし
          onclone: (clonedDoc) => {
            // クローンされたドキュメントのスタイルを強化
            const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore="true"]');
            if (clonedElement) {
              clonedElement.style.display = 'none';
            }
          }
        });
        
        // キャンバスからイメージデータを取得（品質を上げる）
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // PDFのサイズを設定（A4）
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // キャンバスの縦横比を計算（1ページに収まるように調整）
        const imgWidth = 210; // A4の幅（mm）
        const pageHeight = 297; // A4の高さ（mm）
        const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, pageHeight);
        
        // イメージをPDFに追加（位置調整）
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
        // 元のスタイルを復元
        elementsToEnhance.forEach((element, index) => {
          element.style.color = originalStyles[index].color;
          element.style.backgroundColor = originalStyles[index].backgroundColor;
          element.style.borderColor = originalStyles[index].borderColor;
          element.style.fontSize = originalStyles[index].fontSize;
        });
        
        // 元のサイズを復元
        printTargetRef.current.style.width = originalWidth;
        printTargetRef.current.style.height = originalHeight;
        printTargetRef.current.style.maxWidth = originalMaxWidth;
        
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
