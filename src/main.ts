import './style.css';
import { Router } from './core/router.js';
import { renderHomePage } from './pages/home/index.js';
import { renderEditorPage } from './pages/editor/index.js';

const app = document.querySelector<HTMLDivElement>('#app')!;

const router = new Router();

router
  .add('#editor', (params) => {
    const templateIndex = params.template ? parseInt(params.template) : undefined;
    renderEditorPage(app, templateIndex);
  })
  .add('#', () => {
    renderHomePage(app);
  })
  .start();
