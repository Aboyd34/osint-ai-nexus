import React, { useState } from 'react';
import { Phone, Globe, Smartphone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Input, Button, Card, Badge } from '../components/UI';
import AiAnalysisResult from '../components/AiAnalysisResult';
import { mockPhoneLookup } from '../services/mockOsintService';
import { analyzeIntelWithGemini } from '../services/geminiService';
import { IntelResult, PhoneIntelResult } from '../types';

interface Props {
  onResult: (result: IntelResult) => void;
  apiKey: string;
}

const PhoneIntel: React.FC<Props> = ({ onResult, apiKey }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhoneIntelResult | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    setAnalysis(null);
    try {
      const data = await mockPhoneLookup(query);
      setResult(data);
      onResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!result || !apiKey) return;
    setAnalyzing(true);
    try {
      const text = await analyzeIntelWithGemini(result, apiKey);
      setAnalysis(text);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Phone Intelligence</h2>
        <p className="text-gray-400">Carrier lookups, geolocation, and line type validation.</p>
      </div>

      <Card className="max-w-3xl">
        <div className="flex gap-4">
          <Input 
            placeholder="+1 (212) 555-0123" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} isLoading={loading}>
            <Phone className="w-4 h-4 mr-2" />
            Scan
          </Button>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
          <Card title="Technical Details" className="h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm">Status</span>
                <Badge color={result.data.valid ? 'green' : 'red'}>
                  {result.data.valid ? 'VALID' : 'INVALID'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> Line Type
                </span>
                <span className="text-white font-mono">{result.data.line_type}</span>
              </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Carrier
                </span>
                <span className="text-white font-mono">{result.data.carrier}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <span className="text-white font-mono">{result.data.location}</span>
              </div>
            </div>
            
             <div className="mt-6">
                {!analysis ? (
                  <Button 
                    onClick={handleAnalyze} 
                    isLoading={analyzing} 
                    disabled={!apiKey}
                    className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
                  >
                    {apiKey ? "Initialize Gemini Analysis" : "Add API Key for AI Analysis"}
                  </Button>
                ) : (
                   <AiAnalysisResult analysis={analysis} />
                )}
            </div>
          </Card>

          <Card title="Geospatial Estimation" className="h-full relative min-h-[300px]">
             {/* Placeholder for Map - Using an image to represent functionality */}
             <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center animate-pulse mb-4">
                        <MapPin className="w-8 h-8 text-cyan-400" />
                    </div>
                    <p className="text-cyan-400 font-mono text-sm">Triangulating...</p>
                    <p className="text-white font-bold mt-2">{result.data.location}</p>
                    <p className="text-gray-500 text-xs mt-1">{result.data.country_code}</p>
                </div>
             </div>
             <img 
                src="https://picsum.photos/600/400?grayscale&blur=2" 
                alt="Map Placeholder" 
                className="w-full h-full object-cover opacity-20 mix-blend-overlay"
             />
          </Card>
        </div>
      )}
    </div>
  );
};

export default PhoneIntel;
