import { useState } from 'react';
import Layout from '../components/Layout';
import ClinicForm from '../components/ClinicForm';
import DiagnosisResult from '../components/DiagnosisResult';
import { calculateResults } from '../lib/diagnosis';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState(null);
  
  // フォーム送信処理
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // 結果を計算
      const results = calculateResults(formData.answers);
      
      // データをAPIに送信
      const response = await fetch('/api/submit-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, results })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '診断結果の送信に失敗しました');
      }
      
      // 診断データを設定
      setDiagnosisData({ ...formData, results });
      setShowResults(true);
    } catch (error) {
      console.error('診断送信エラー:', error);
      alert('診断結果の送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 診断をやり直す
  const handleRestart = () => {
    setShowResults(false);
    setDiagnosisData(null);
  };
  
  // PDFダウンロード
  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    
    try {
      // PDFを生成するAPIを呼び出す
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosisData)
      });
      
      if (!response.ok) {
        throw new Error('PDFの生成に失敗しました');
      }
      
      // PDFをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `診断結果_${diagnosisData.clinicInfo.clinicName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  return (
    <Layout>
      {!showResults ? (
        <ClinicForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting} 
        />
      ) : (
        <DiagnosisResult 
          data={diagnosisData} 
          onRestart={handleRestart}
          onDownloadPdf={handleDownloadPdf}
          isPdfGenerating={isPdfGenerating}
        />
      )}
    </Layout>
  );
}