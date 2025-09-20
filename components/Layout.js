export default function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gray-50 scroll-container">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title || 'ML Quiz App'}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}