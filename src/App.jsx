import React from 'react';

function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-blue-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-teal-100">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">Sanctuary</h1>
        <p className="text-gray-600 text-lg">Deployment Successful! 🚀</p>
        <p className="mt-4 text-sm text-gray-400">Your app is now live on Google Cloud.</p>
      </div>
    </div>
  );
}

export default App;
