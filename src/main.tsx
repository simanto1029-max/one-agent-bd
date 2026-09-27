import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {initCleanConsole} from './utils/logger.ts';
import App from './App.tsx';
import './index.css';

initCleanConsole();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
