'use client';

import dynamic from 'next/dynamic';
import EditorLoading from '@/app/editor/loading';

const EditorClient = dynamic(
  () => import('@/app/components/EditorClient').then(mod => ({ default: mod.EditorPage })),
  {
    ssr: false,
    loading: () => <EditorLoading />,
  }
);

interface EditorWrapperProps {
  templateIndex: number;
}

export function EditorWrapper({ templateIndex }: EditorWrapperProps) {
  return <EditorClient templateIndex={templateIndex} />;
}
