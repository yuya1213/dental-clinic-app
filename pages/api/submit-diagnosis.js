import { connectDB, Diagnosis } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // MongoDBに接続
    await connectDB();
    
    const data = req.body;
    
    // 診断データをデータベースに保存
    const diagnosis = new Diagnosis({
      clinicInfo: data.clinicInfo,
      answers: data.answers,
      results: data.results
    });
    
    await diagnosis.save();
    
    // 成功レスポンス
    return res.status(200).json({ 
      success: true, 
      message: '診断結果が正常に送信されました',
      data: diagnosis
    });
  } catch (error) {
    console.error('診断結果の送信エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: '診断結果の送信中にエラーが発生しました'
    });
  }
} 