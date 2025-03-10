import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

// 定数定義
const PDF_OPTIONS = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  compress: false // 圧縮を無効化して品質を向上
};

const CANVAS_OPTIONS = {
  scale: 3, // 高解像度に設定（2〜5の間が推奨）
  useCORS: true, // クロスオリジン対応
  logging: false, // ログを無効化
  allowTaint: true, // 外部リソースを許可
  backgroundColor: '#ffffff', // 背景色を白に設定
  imageTimeout: 0, // 画像のロードタイムアウトを無効化
  removeContainer: true, // 一時的なコンテナを削除
  letterRendering: true, // 文字を個別にレンダリング
  foreignObjectRendering: false, // foreignObjectを使用しない
  windowWidth: 1200, // 幅を固定して一貫性を確保
  windowHeight: 1600 // 高さを固定して一貫性を確保
};

export default function JapanesePdfGenerator({ data, printTargetRef, onGenerateStart, onGenerateEnd }) {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  

  
  // プリント前に要素のスタイルを調整する関数（コントラスト強化版）
  const prepareElementForPrinting = (element) => {
    // 元のスタイルを保存
    const originalStyles = {};
    const elementsToStyle = element.querySelectorAll('*');
    
    // 全体のコンテナスタイルを調整
    const originalContainerStyle = {
      backgroundColor: element.style.backgroundColor,
      border: element.style.border,
      boxShadow: element.style.boxShadow
    };
    
    // コンテナの背景を真っ白に、境界線をはっきりさせる
    element.style.backgroundColor = '#ffffff';
    element.style.border = '2px solid #000000';
    element.style.boxShadow = 'none';
    
    // すべての要素のスタイルを調整
    elementsToStyle.forEach((el, index) => {
      // スタイル情報を保存
      originalStyles[index] = {
        color: el.style.color,
        fontWeight: el.style.fontWeight,
        textShadow: el.style.textShadow,
        backgroundColor: el.style.backgroundColor,
        borderColor: el.style.borderColor,
        opacity: el.style.opacity,
        filter: el.style.filter
      };
      
      // テキスト要素の処理
      if (el.innerText && el.innerText.trim().length > 0) {
        // テキストを黒く、太く、鮮明に
        el.style.color = '#000000';
        el.style.fontWeight = '900'; // 最も太いフォント
        el.style.textShadow = 'none'; // シャドウを削除してクリアに
        el.style.opacity = '1'; // 完全に不透明に
        el.style.filter = 'contrast(1.2) saturate(1.5)'; // コントラストと彩度を上げる
      }
      
      // 背景色を持つ要素は、より濃い色に
      if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent' && el.style.backgroundColor !== '') {
        // 背景色を持つ要素は、より鮮明に
        try {
          // 背景色が薄い場合は濃くする
          const bgColor = window.getComputedStyle(el).backgroundColor;
          if (bgColor.includes('rgba') && bgColor.split(',')[3].includes('0.')) {
            // 透明度が低い場合は上げる
            el.style.backgroundColor = bgColor.replace(/rgba\((.*?),(.*?),(.*?),.*?\)/, 'rgba($1,$2,$3,1)');
          }
        } catch (e) {
          // エラー時は何もしない
        }
      }
      
      // ボーダーを持つ要素は、より濃いボーダーに
      if (el.style.borderColor) {
        el.style.borderColor = '#000000';
      }
    });
    
    return () => {
      // 元のスタイルに戻す
      element.style.backgroundColor = originalContainerStyle.backgroundColor;
      element.style.border = originalContainerStyle.border;
      element.style.boxShadow = originalContainerStyle.boxShadow;
      
      elementsToStyle.forEach((el, index) => {
        if (originalStyles[index]) {
          el.style.color = originalStyles[index].color;
          el.style.fontWeight = originalStyles[index].fontWeight;
          el.style.textShadow = originalStyles[index].textShadow;
          el.style.backgroundColor = originalStyles[index].backgroundColor;
          el.style.borderColor = originalStyles[index].borderColor;
          el.style.opacity = originalStyles[index].opacity;
          el.style.filter = originalStyles[index].filter;
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
      
      // 印刷対象要素のクローンを作成して修正を適用
      const clonedElement = printTargetRef.current.cloneNode(true);
      document.body.appendChild(clonedElement);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '1200px'; // 固定幅で一貫性を確保
      
      // クローンに対してスタイル調整を適用
      const restoreClonedStyles = prepareElementForPrinting(clonedElement);
      
      // 少し待機して、スタイル変更が適用されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // HTML要素をキャンバスに変換（クローンを使用）
      const canvas = await html2canvas(clonedElement, CANVAS_OPTIONS);
      console.log('HTML要素をキャンバスに変換しました');
      
      // クローンを削除
      restoreClonedStyles();
      document.body.removeChild(clonedElement);
      
      // スタイルを元に戻す
      restoreStyles();
      
      // PDFを生成（日本語フォント設定）
      const pdf = new jsPDF(PDF_OPTIONS);
      
      // 日本語フォントを設定
      pdf.setFont('kozgopromedium', 'normal');
      
      // キャンバスの処理 - コントラストを強化
      const ctx = canvas.getContext('2d');
      
      // コントラストを高める処理
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 各ピクセルの色を強化
      for (let i = 0; i < data.length; i += 4) {
        // RGB値を取得
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 色の濃さを増す
        data[i] = Math.min(r * 1.2, 255);     // Rを増強
        data[i + 1] = Math.min(g * 1.2, 255); // Gを増強
        data[i + 2] = Math.min(b * 1.2, 255); // Bを増強
      }
      
      // 変更したデータをキャンバスに書き戻す
      ctx.putImageData(imageData, 0, 0);
      
      // さらにオーバーレイでコントラストを強化
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 元の合成モードに戻す
      ctx.globalCompositeOperation = 'source-over';
      
      // キャンバスを高品質のPNGとしてPDFに追加
      const imgData = canvas.toDataURL('image/png', 1.0); // 最高品質
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // コントラストを高めるための設定
      // 日本語フォントを再設定（重要）
      pdf.setFont('kozgopromedium', 'normal');
      
      // 圧縮なしで高品質画像を追加
      pdf.addImage({
        imageData: imgData,
        format: 'PNG',
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        compression: 'NONE',
        rotation: 0,
        mask: false
      });
      
      // 日本語フォントを再度確認
      pdf.setFont('kozgopromedium', 'normal');
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

      // 印刷対象要素のクローンを作成して修正を適用
      const clonedElement = printTargetRef.current.cloneNode(true);
      document.body.appendChild(clonedElement);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '1200px'; // 固定幅で一貫性を確保
      
      // クローンに対してスタイル調整を適用
      const restoreClonedStyles = prepareElementForPrinting(clonedElement);
      
      // 少し待機して、スタイル変更が適用されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // HTML要素をキャンバスに変換（クローンを使用）
      const canvas = await html2canvas(clonedElement, CANVAS_OPTIONS);
      console.log('HTML要素をキャンバスに変換しました');
      
      // クローンを削除
      restoreClonedStyles();
      document.body.removeChild(clonedElement);
      
      // スタイルを元に戻す
      restoreStyles();
      
      // キャンバスの処理 - コントラストを強化
      const ctx = canvas.getContext('2d');
      
      // コントラストを高める処理
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 各ピクセルの色を強化
      for (let i = 0; i < data.length; i += 4) {
        // RGB値を取得
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 色の濃さを増す
        data[i] = Math.min(r * 1.2, 255);     // Rを増強
        data[i + 1] = Math.min(g * 1.2, 255); // Gを増強
        data[i + 2] = Math.min(b * 1.2, 255); // Bを増強
      }
      
      // 変更したデータをキャンバスに書き戻す
      ctx.putImageData(imageData, 0, 0);
      
      // さらにオーバーレイでコントラストを強化
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 元の合成モードに戻す
      ctx.globalCompositeOperation = 'source-over';
      
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
