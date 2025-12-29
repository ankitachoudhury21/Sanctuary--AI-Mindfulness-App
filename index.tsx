
import React from 'react';
import { createRoot } from 'react-dom/client'; // Changed to named import for createRoot
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement); // Changed to use the named import
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);