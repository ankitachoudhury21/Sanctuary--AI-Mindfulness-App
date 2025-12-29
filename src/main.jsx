import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("FATAL ERROR: Could not find root element in index.html");
}
