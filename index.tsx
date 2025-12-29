import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 

// --- DEBUGGING LOGIC ---
console.log("System Check: Main file is running...");

try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error("FATAL: Cannot find <div id='root'> in index.html");
  }

  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
       <App />
    </React.StrictMode>
  );
  
} catch (error) {
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Application Crashed</h1>
      <p><strong>Error:</strong> ${error.message}</p>
    </div>
  `;
  console.error("System Crash:", error);
}
