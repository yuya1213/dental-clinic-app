import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const { clinicInfo, results } = data;
    
    // PDFドキュメントの作成
    const doc = new jsPDF();
    
    // 日本語フォントの設定
    // 注: 実際のデプロイでは日本語フォントを追加する必要があります
    
    // ヘッダー
    doc.setFontSize(20);
    doc.text('歯科医院経営診断結果', 105, 20, { align: 'center' });
    
    // 医院情報
    doc.setFontSize(14);
    doc.text('医院情報', 20, 40);
    
    doc.setFontSize(12);
    doc.text(`医院名: ${clinicInfo.clinicName}`, 30, 50);
    doc.text(`回答者: ${clinicInfo.respondentName}`, 30, 60);
    doc.text(`診断日: ${new Date(clinicInfo.date).toLocaleDateString('ja-JP')}`, 30, 70);
    
    // 診断結果概要
    doc.setFontSize(14);
    doc.text('診断結果概要', 20, 90);
    
    doc.setFontSize(12);
    doc.text(`総合評価: ${results.status}`, 30, 100);
    doc.text(`全20問中 ${results.totalYes}問が「はい」`, 30, 110);
    
    // カテゴリ別スコア
    doc.setFontSize(14);
    doc.text('カテゴリ別スコア', 20, 130);
    
    // テーブルデータの作成
    const tableData = [
      ['カテゴリ', 'スコア', '評価'],
      ['財務管理', `${results.categories.finance}/5`, getEvaluation(results.categories.finance)],
      ['患者数・売上', `${results.categories.patients}/5`, getEvaluation(results.categories.patients)],
      ['スタッフ管理', `${results.categories.staff}/5`, getEvaluation(results.categories.staff)],
      ['患者満足度', `${results.categories.satisfaction}/5`, getEvaluation(results.categories.satisfaction)]
    ];
    
    // テーブルの描画
    doc.autoTable({
      startY: 140,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [73, 95, 233],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 12,
        cellPadding: 5
      }
    });
    
    // 改善アドバイス
    doc.setFontSize(14);
    doc.text('改善アドバイス', 20, doc.autoTable.previous.finalY + 20);
    
    // カテゴリ別アドバイス
    let yPos = doc.autoTable.previous.finalY + 30;
    const adviceList = [];
    
    if (results.categories.finance < 3) {
      adviceList.push('【財務管理】毎月の収支を正確に把握し、3ヶ月先の資金計画を立てましょう。税理士などの専門家と定期的に相談することをお勧めします。');
    }
    if (results.categories.patients < 3) {
      adviceList.push('【患者数・売上】新規患者とリピーターの比率分析、リコール率の向上に取り組みましょう。自由診療の提案方法も見直すと良いでしょう。');
    }
    if (results.categories.staff < 3) {
      adviceList.push('【スタッフ管理】給与体系の見直しと教育研修の充実を図りましょう。労務トラブルの対応マニュアルも整備すると安心です。');
    }
    if (results.categories.satisfaction < 3) {
      adviceList.push('【患者満足度】口コミ対策と院内環境の整備を優先し、定期的な患者アンケートを実施して改善に活かしましょう。');
    }
    
    // アドバイスがない場合
    if (adviceList.length === 0) {
      adviceList.push('全てのカテゴリで良好な結果です。現状を維持しながら、さらなる向上を目指しましょう。');
    }
    
    // アドバイスの描画
    adviceList.forEach((advice, index) => {
      const lines = doc.splitTextToSize(advice, 170);
      doc.text(lines, 30, yPos);
      yPos += 10 * lines.length;
    });
    
    // フッター
    doc.setFontSize(10);
    doc.text('© 2025 歯科医院経営診断システム', 105, 280, { align: 'center' });
    
    // PDFのバイナリデータを返す
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="診断結果_${clinicInfo.clinicName}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'PDFの生成中にエラーが発生しました'
    });
  }
}

// スコアに基づく評価を返す関数
function getEvaluation(score) {
  if (score >= 4) return '優良';
  if (score >= 3) return '良好';
  if (score >= 2) return '要改善';
  return '要注意';
}
