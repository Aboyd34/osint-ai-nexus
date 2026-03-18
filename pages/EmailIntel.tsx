import React, { useState } from 'react';
import { Mail, ShieldCheck, AlertOctagon, Users, Download, Trash2 } from 'lucide-react';
import { Textarea, Button, Card, Badge } from '../components/UI';
import AiAnalysisResult from '../components/AiAnalysisResult';
import { mockEmailLookup } from '../services/mockOsintService';
import { analyzeIntelWithGemini } from '../services/geminiService';
import { IntelResult, EmailIntelResult } from '../types';

interface Props {
  onResult: (result: IntelResult) => void;
  apiKey: string;
}

const EmailIntel: React.FC<Props> = ({ onResult, apiKey }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailIntelResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<{id: string, text: string} | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleBulkSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const emails = input.split('\n').map(e => e.trim()).filter(e => e.length > 0);
    
    // Clear previous if starting new batch
    setResults([]);

    for (const email of emails) {
      try {
        // Sequential processing to simulate pipeline
        const data = await mockEmailLookup(email);
        setResults(prev => [data, ...prev]);
        onResult(data); // Update global history/summary
      } catch (e) {
        console.error(`Failed to process ${email}`, e);
      }
    }
    setLoading(false);
  };

  const handleAnalyze = async (item: EmailIntelResult) => {
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
    downloadAnchorNode.setAttribute("download", "email_osint_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Email OSINT Module</h2>
          <p className="text-gray-400">Bulk process email lists for breach verification and domain analysis.</p>
        </div>
        {results.length > 0 && (
           <Button variant="secondary" onClick={downloadResults} className="text-sm">
             <Download className="w-4 h-4 mr-2" />
             Export JSON
           </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Target Acquisition">
            <div className="space-y-4">
              <Textarea 
                label="Target Emails (One per line)"
                placeholder="target1@example.com&#10;target2@corp.net&#10;admin@site.org" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleBulkSearch} isLoading={loading} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Run Module
                </Button>
                <Button onClick={() => { setInput(''); setResults([]); }} variant="secondary">
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Feed */}
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-12 text-gray-600">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <p>Awaiting targets...</p>
            </div>
          )}

          {results.map((result) => (
            <Card key={result.id} className="border-l-4 border-l-cyan-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{result.query}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Processed: {new Date(result.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className={`px-3 py-1 rounded font-mono text-sm font-bold ${result.riskScore > 50 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  RISK: {result.riskScore}/100
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                  <span className="text-xs text-gray-500 block">MX Records</span>
                  <div className="flex items-center gap-1 mt-1">
                    {result.data.mx_records ? <ShieldCheck className="w-3 h-3 text-green-400" /> : <AlertOctagon className="w-3 h-3 text-red-400" />}
                    <span className="text-sm font-mono text-gray-300">{result.data.mx_records ? 'Valid' : 'Missing'}</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                  <span className="text-xs text-gray-500 block">Type</span>
                  <span className="text-sm font-mono text-gray-300 mt-1 block">
                    {result.data.disposable ? 'Disposable' : 'Permanent'}
                  </span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                  <span className="text-xs text-gray-500 block">Domain</span>
                  <span className="text-sm font-mono text-gray-300 mt-1 block truncate">{result.data.domain}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                  <span className="text-xs text-gray-500 block">Breaches</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className={`w-3 h-3 ${result.data.breach_count > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className={`text-sm font-mono ${result.data.breach_count > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                      {result.data.breach_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis Section per card */}
              <div className="border-t border-gray-800 pt-4">
                {currentAnalysis?.id === result.id ? (
                   <AiAnalysisResult analysis={currentAnalysis.text} />
                ) : (
                  <Button 
                    onClick={() => handleAnalyze(result)}
                    isLoading={analyzingId === result.id}
                    disabled={!apiKey}
                    className="w-full py-1 text-xs bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400"
                  >
                    {apiKey ? "Generate AI Assessment" : "Configure API Key for Intelligence"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailIntel;