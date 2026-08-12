import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { EngineProvider } from './engine/EngineProvider.jsx';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <EngineProvider>
        <App />
      </EngineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
