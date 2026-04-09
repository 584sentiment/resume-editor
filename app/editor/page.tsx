import { EditorWrapper } from '@/app/components/EditorWrapper';

interface EditorPageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  const templateIndex = params.template ? parseInt(params.template) : 0;
  return <EditorWrapper templateIndex={templateIndex} />;
}
