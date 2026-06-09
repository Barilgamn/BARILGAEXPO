import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { LanguageProvider } from './i18n.tsx';
import { AdminProvider } from './context/AdminContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
