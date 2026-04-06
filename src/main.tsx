import { createRoot } from 'react-dom/client';
import { App } from './App.js';

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<App />);
