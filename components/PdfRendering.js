// PDF生成のためのユーティリティ関数
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// 会社情報の設定
export const COMPANY_INFO = {
  name: '株式会社メディカルネット',
  address: '東京都渋谷区幡ケ谷１丁目３４−１４ 宝ビル 3F',
  phone: '03-5790-5261',
  website: 'https://medicalnet-support.com/'
};

// 会社のコーポレートカラー（水色）
export const CORPORATE_COLOR = '#3498db';

// 日本語フォントの設定
export const FONT_NAME = 'kozgopromedium';

// 評価を返す関数
export const getEvaluation = (score) => {
  if (score >= 4) return '優良';
  if (score >= 3) return '良好';
  if (score >= 2) return '要改善';
  return '要注意';
};

// PDFの最初のページを生成する関数
export const renderFirstPage = (pdf, data) => {
  // 日本語フォントを設定（kozgopromediumは内蔵の日本語フォント）
  pdf.setFont(FONT_NAME);
  pdf.setLanguage('ja'); // 日本語設定
  
  // 1ページ目: 診断結果
  // ヘッダー
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('診断結果', 105, 20, { align: 'center' });
  
  // クリニック情報
  pdf.setFontSize(12);
  pdf.text(`クリニック名: ${data.clinicInfo.name}`, 20, 40);
  pdf.text(`診断日: ${new Date().toLocaleDateString('ja-JP')}`, 20, 50);
  
  // 結果テーブル
  pdf.setFontSize(14);
  pdf.text('診断項目の評価', 105, 70, { align: 'center' });
  
  // テーブルデータの準備
  const categories = [
    { category: '財務管理', score: data.results.categories.finance },
    { category: '患者数', score: data.results.categories.patients },
    { category: 'スタッフ管理', score: data.results.categories.staff },
    { category: '満足度', score: data.results.categories.satisfaction }
  ];
  
  const tableData = categories.map(item => [
    item.category,
    item.score.toFixed(1),
    getEvaluation(item.score)
  ]);
  
  // テーブルヘッダー
  const tableHeaders = [['診断項目', 'スコア', '評価']];
  
  // テーブルの描画
  pdf.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: 80,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      font: FONT_NAME, // 明示的にフォントを指定
      fontStyle: 'normal'
    },
    headStyles: {
      fillColor: [52, 152, 219], // コーポレートカラー
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      font: FONT_NAME // ヘッダーにも明示的にフォントを指定
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 100, font: FONT_NAME },
      1: { cellWidth: 30, halign: 'center', font: FONT_NAME },
      2: { cellWidth: 40, halign: 'center', font: FONT_NAME },
    },
    willDrawCell: (data) => {
      // セルを描画する前に呼ばれるコールバック
      pdf.setFont(FONT_NAME);
    },
    didDrawCell: (data) => {
      // セルの描画後に呼ばれるコールバック
      pdf.setFont(FONT_NAME);
    }
  });
  
  // 総合評価
  const scores = Object.values(data.results.categories);
  const totalScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const totalEvaluation = getEvaluation(totalScore);
  
  const finalY = pdf.autoTable.previous.finalY + 20;
  pdf.setFontSize(14);
  pdf.text('総合評価', 105, finalY, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`総合スコア: ${totalScore.toFixed(1)}`, 20, finalY + 15);
  pdf.text(`評価: ${totalEvaluation}`, 20, finalY + 25);
  
  // アドバイス
  pdf.setFontSize(14);
  pdf.text('改善アドバイス', 105, finalY + 45, { align: 'center' });
  
  pdf.setFontSize(10);
  let adviceY = finalY + 55;
  
  // カテゴリ別アドバイス
  const categoryAdvice = [];
  if (data.results.categories.finance < 3) {
    categoryAdvice.push("【財務管理】毎月の収支を正確に把握し、3ヶ月先の資金計画を立てましょう。税理士などの専門家と定期的に相談することをお勧めします。");
  }
  if (data.results.categories.patients < 3) {
    categoryAdvice.push("【患者数・売上】新規患者とリピーターの比率分析、リコール率の向上に取り組みましょう。自由診療の提案方法も見直すと良いでしょう。");
  }
  if (data.results.categories.staff < 3) {
    categoryAdvice.push("【スタッフ管理】給与体系の見直しと教育研修の充実を図りましょう。労務トラブルの対応マニュアルも整備すると安心です。");
  }
  if (data.results.categories.satisfaction < 3) {
    categoryAdvice.push("【患者満足度】口コミ対策と院内環境の整備を優先し、定期的な患者アンケートを実施して改善に活かしましょう。");
  }
  
  categoryAdvice.forEach(advice => {
    pdf.text(advice, 20, adviceY);
    adviceY += 10;
  });
  
  if (categoryAdvice.length === 0) {
    pdf.text("すべての項目で良好な結果です。現状を維持しながら、さらなる向上を目指しましょう。", 20, adviceY);
  }
  
  return pdf;
};

// PDFの2ページ目を生成する関数
export const renderSecondPage = (pdf) => {
  pdf.addPage();
  
  // ヘッダー
  pdf.setFontSize(16);
  pdf.setTextColor(52, 152, 219); // コーポレートカラー
  pdf.text('株式会社メディカルネット', 105, 30, { align: 'center' });
  
  // 会社ロゴの代わりに会社名を大きく表示
  pdf.setFontSize(24);
  pdf.text('Medical Net', 105, 50, { align: 'center' });
  
  // 会社情報
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('会社情報', 105, 80, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`会社名: ${COMPANY_INFO.name}`, 40, 100);
  pdf.text(`住所: ${COMPANY_INFO.address}`, 40, 110);
  pdf.text(`電話: ${COMPANY_INFO.phone}`, 40, 120);
  pdf.text(`ウェブサイト: ${COMPANY_INFO.website}`, 40, 130);
  
  // 会社概要
  pdf.setFontSize(12);
  pdf.text('会社概要', 105, 160, { align: 'center' });
  
  pdf.setFontSize(10);
  const description = [
    '株式会社メディカルネットは、歯科医院の経営サポートを',
    '専門とする企業です。診断ツールの提供、マーケティング支援、',
    '経営コンサルティングなど、歯科医院の成長と発展をサポート',
    'するさまざまなサービスを提供しています。'
  ];
  
  let descY = 180;
  description.forEach(line => {
    pdf.text(line, 40, descY);
    descY += 10;
  });
  
  // フッター
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('© 2025 株式会社メディカルネット All Rights Reserved.', 105, 280, { align: 'center' });
  
  return pdf;
};
