import React, { useState } from 'react';
import { ShieldAlert, FileWarning, Eye, Lock, Download, Trash2, Activity } from 'lucide-react';
import { Textarea, Button, Card, Badge } from '../components/UI';
import AiAnalysisResult from '../components/AiAnalysisResult';
import { mockDarkWebLookup } from '../services/mockOsintService';
import { analyzeIntelWithGemini } from '../services/geminiService';
import { IntelResult, DarkWebResult } from '../types';

interface Props {
  onResult: (result: IntelResult) => void;
  apiKey: string;
}

const DarkWebIntel: React.FC<Props> = ({ onResult, apiKey }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DarkWebResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<{id: string, text: string} | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleBulkSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const indicators = input.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    
    setResults([]);

    for (const indicator of indicators) {
      try {
        const data = await mockDarkWebLookup(indicator);
        setResults(prev => [data, ...prev]);
        onResult(data);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  const handleAnalyze = async (item: DarkWebResult) => {
    if (!apiKey) return;
    setAnalyzingId(item.id);
    try {
      const text = await analyzeIntelWithGemini(item, apiKey);
      setCurrentAnalysis({ id: item.id, text });
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  const downloadResults = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "darkweb_osint_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Dark Web Surveillance</h2>
          <p className="text-gray-400">Monitor IOCs, usernames, and hashes across hidden services.</p>
        </div>
        {results.length > 0 && (
           <Button variant="secondary" onClick={downloadResults} className="text-sm">
             <Download className="w-4 h-4 mr-2" />
             Export JSON
           </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
           <Card title="Indicator Input" className="border-red-900/20">
            <div className="space-y-4">
              <Textarea 
                label="IOCs / Selectors (One per line)"
                placeholder="username&#10;7c4a8d09ca3762af...&#10;192.168.1.1" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                className="font-mono text-sm border-red-900/30 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleBulkSearch} isLoading={loading} className="w-full">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Deep Scan
                </Button>
                 <Button onClick={() => { setInput(''); setResults([]); }} variant="secondary">
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
           {results.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-12 text-gray-600">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p>Awaiting indicators...</p>
            </div>
          )}

          {results.map((result) => (
            <div key={result.id} className={`bg-gray-800 rounded-xl overflow-hidden border ${result.data.found ? 'border-red-500/50' : 'border-gray-700'}`}>
                 {/* Header */}
                 <div className={`px-6 py-4 flex justify-between items-center ${result.data.found ? 'bg-red-900/20' : 'bg-gray-900/50'}`}>
                     <div className="flex items-center gap-3">
                         {result.data.found ? (
                             <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                         ) : (
                             <ShieldAlert className="w-5 h-5 text-green-500" />
                         )}
                         <span className="font-mono font-bold text-white">{result.query}</span>
                     </div>
                     <span className="text-xs text-gray-400 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
                 </div>

                 {/* Body */}
                 <div className="p-6">
                     {result.data.found ? (
                         <div className="space-y-4">
                             <div className="flex items-center gap-2 text-red-400 bg-red-900/10 p-3 rounded-lg border border-red-900/20">
                                 <FileWarning className="w-5 h-5" />
                                 <span className="font-bold">POSITIVE MATCH FOUND</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase mb-1">Source</p>
                                     <div className="flex flex-wrap gap-2">
                                         {result.data.sources.map((src, i) => (
                                             <Badge key={i} color="red">{src}</Badge>
                                         ))}
                                     </div>
                                 </div>
                                 <div>
                                      <p className="text-xs text-gray-500 uppercase mb-1">Classification</p>
                                      <span className="text-white font-mono">{result.data.category}</span>
                                 </div>
                             </div>
                         </div>
                     ) : (
                         <div className="text-center py-2 text-gray-500">
                             <p>No compromised data found in indexed hidden services.</p>
                         </div>
                     )}

                    {/* AI Analysis */}
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        {currentAnalysis?.id === result.id ? (
                             <AiAnalysisResult analysis={currentAnalysis.text} />
                        ) : (
                            <Button 
                                onClick={() => handleAnalyze(result)} 
                                isLoading={analyzingId === result.id} 
                                disabled={!apiKey}
                                variant="secondary"
                                className="w-full text-xs"
                            >
                                {apiKey ? "Run Threat Assessment" : "Configure API Key"}
                            </Button>
                        )}
                    </div>
                 </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DarkWebIntel;