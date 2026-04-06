import { useState, useEffect } from 'react';
import { HomePage } from './pages/home/index.js';
import { EditorPage } from './pages/editor/index.js';
import './style.css';

type Route = { page: 'home' } | { page: 'editor'; templateIndex?: number };

function parseHash(hash: string): Route {
  if (hash.startsWith('#editor')) {
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const template = params.get('template');
    return { page: 'editor', templateIndex: template ? parseInt(template) : undefined };
  }
  return { page: 'home' };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route.page === 'editor') {
    return <EditorPage templateIndex={route.templateIndex} />;
  }
  return <HomePage />;
}
