import React from 'react';
import Calculator from './components/Calculator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Calculator />
      
      {/* Footer Info */}
      <div className="fixed bottom-4 text-center w-full pointer-events-none">
        <p className="text-gray-600 text-xs">
          Built with React & Gemini API
        </p>
      </div>
    </div>
  );
};

export default App;