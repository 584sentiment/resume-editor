export default function EditorLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">正在加载编辑器...</p>
      </div>
    </div>
  );
}
