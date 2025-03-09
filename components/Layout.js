export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">歯科医院 経営健康診断</h1>
          <p className="text-gray-800 mt-2">
            このチェックシートを使って、あなたの歯科医院の経営状況を診断しましょう！
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 