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
    
    // PDF生成を英語で行い、後でクライアント側で日本語表示を行うように修正
    doc.setFont('helvetica');
    
    // ヘッダー
    doc.setFontSize(20);
    doc.text('Dental Clinic Management Diagnosis', 105, 20, { align: 'center' });
    
    // 医院情報
    doc.setFontSize(14);
    doc.text('Clinic Information', 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Clinic: ${clinicInfo.clinicName}`, 30, 50);
    doc.text(`Respondent: ${clinicInfo.respondentName}`, 30, 60);
    doc.text(`Date: ${new Date(clinicInfo.date).toLocaleDateString('en-US')}`, 30, 70);
    
    // 診断結果概要
    doc.setFontSize(14);
    doc.text('Diagnosis Summary', 20, 90);
    
    doc.setFontSize(12);
    doc.text(`Overall Rating: ${results.status}`, 30, 100);
    doc.text(`${results.totalYes} out of 20 questions answered "Yes"`, 30, 110);
    
    // カテゴリ別スコア
    doc.setFontSize(14);
    doc.text('Category Scores', 20, 130);
    
    // テーブルデータの作成
    const tableData = [
      ['Category', 'Score', 'Evaluation'],
      ['Financial Management', `${results.categories.finance}/5`, getEvaluationInEnglish(results.categories.finance)],
      ['Patient Numbers & Sales', `${results.categories.patients}/5`, getEvaluationInEnglish(results.categories.patients)],
      ['Staff Management', `${results.categories.staff}/5`, getEvaluationInEnglish(results.categories.staff)],
      ['Patient Satisfaction', `${results.categories.satisfaction}/5`, getEvaluationInEnglish(results.categories.satisfaction)]
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
    doc.text('Improvement Advice', 20, doc.autoTable.previous.finalY + 20);
    
    // カテゴリ別アドバイス
    let yPos = doc.autoTable.previous.finalY + 30;
    const adviceList = [];
    
    if (results.categories.finance < 3) {
      adviceList.push('[Financial Management] Track monthly income and expenses accurately, and create a financial plan for the next 3 months. We recommend consulting with a tax accountant regularly.');
    }
    if (results.categories.patients < 3) {
      adviceList.push('[Patient Numbers & Sales] Analyze the ratio of new patients to repeat patients, and work on improving recall rates. It would also be good to review how you propose elective treatments.');
    }
    if (results.categories.staff < 3) {
      adviceList.push('[Staff Management] Review the salary system and enhance educational training. It is also reassuring to prepare a manual for dealing with labor issues.');
    }
    if (results.categories.satisfaction < 3) {
      adviceList.push('[Patient Satisfaction] Prioritize review management and clinic environment improvements, and conduct regular patient surveys to make improvements.');
    }
    
    // アドバイスがない場合
    if (adviceList.length === 0) {
      adviceList.push('Good results in all categories. Maintain the current status while aiming for further improvement.');
    }
    
    // アドバイスの描画
    adviceList.forEach((advice, index) => {
      const lines = doc.splitTextToSize(advice, 170);
      doc.text(lines, 30, yPos);
      yPos += 10 * lines.length;
    });
    
    // フッター
    doc.setFontSize(10);
    doc.text('© 2025 Dental Clinic Management Diagnosis System', 105, 280, { align: 'center' });
    
    // PDFのバイナリデータを返す
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Diagnosis_Result_${clinicInfo.clinicName}.pdf"`);
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

// 英語での評価を返す関数
function getEvaluationInEnglish(score) {
  if (score >= 4) return 'Excellent';
  if (score >= 3) return 'Good';
  if (score >= 2) return 'Needs Improvement';
  return 'Caution';
}
