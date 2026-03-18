import React from 'react';
import { Sparkles } from 'lucide-react';

const AiAnalysisResult: React.FC<{ analysis: string | null }> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="mt-6 bg-gray-900/50 border border-cyan-900/30 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-cyan-950/30 border-b border-cyan-900/30 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Gemini Intelligence Assessment</span>
      </div>
      <div className="p-4 text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap">
        {analysis}
      </div>
    </div>
  );
};

export default AiAnalysisResult;
