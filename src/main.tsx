import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { SEOProvider } from './lib/seo';
import seoConfig from '../seo-config';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SEOProvider config={seoConfig}>
      <App />
    </SEOProvider>
  </StrictMode>
);
