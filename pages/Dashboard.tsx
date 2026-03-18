import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { IntelResult, IntelType } from '../types';
import { Card, Button } from '../components/UI';
import { generateDashboardSummary } from '../services/geminiService';
import { Sparkles, Shield, Search, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  history: IntelResult[];
  apiKey: string;
}

const Dashboard: React.FC<DashboardProps> = ({ history, apiKey }) => {
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const typeData = [
    { name: 'Phone', value: history.filter(h => h.type === 'PHONE').length },
    { name: 'Email', value: history.filter(h => h.type === 'EMAIL').length },
    { name: 'Dark Web', value: history.filter(h => h.type === 'DARKWEB').length },
  ];

  const riskData = [
    { name: 'Low Risk', value: history.filter(h => h.riskScore < 40).length, color: '#22c55e' },
    { name: 'Medium Risk', value: history.filter(h => h.riskScore >= 40 && h.riskScore < 70).length, color: '#eab308' },
    { name: 'High Risk', value: history.filter(h => h.riskScore >= 70).length, color: '#ef4444' },
  ];

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const result = await generateDashboardSummary(history, apiKey);
    setSummary(result);
    setLoadingSummary(false);
  };

  // Stats Component
  const StatBox = ({ icon: Icon, label, value, subtext }: any) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex items-start space-x-4">
      <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
          <p className="text-gray-400 mt-1">Real-time intelligence overview and system status.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-400 font-mono">Active Monitoring</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox 
          icon={Search} 
          label="Total Lookups" 
          value={history.length} 
          subtext="This Session" 
        />
        <StatBox 
          icon={AlertTriangle} 
          label="High Risk Threats" 
          value={history.filter(h => h.riskScore >= 70).length}
          subtext="Requires Attention" 
        />
        <StatBox 
          icon={Shield} 
          label="System Status" 
          value="SECURE" 
          subtext="Encrypted Connection" 
        />
      </div>

      {/* AI Summary Section */}
      <Card className="border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-medium text-white">AI Threat Landscape Analysis</h3>
            </div>
            {!summary && history.length > 0 && (
                 <Button 
                 onClick={handleGenerateSummary} 
                 isLoading={loadingSummary} 
                 className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20"
               >
                 Generate Report
               </Button>
            )}
        </div>
        {summary ? (
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                 <p className="text-gray-300 leading-relaxed">{summary}</p>
            </div>
        ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
                {history.length === 0 
                    ? "No data available for analysis. Perform lookups to generate insights." 
                    : "Click 'Generate Report' to analyze session history with Gemini 2.5."}
            </div>
        )}
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Investigation Types">
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    cursor={{fill: '#374151', opacity: 0.2}}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Risk Distribution">
          <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
              {riskData.map(r => (
                  <div key={r.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></div>
                      <span className="text-xs text-gray-400">{r.name}</span>
                  </div>
              ))}
          </div>
        </Card>
      </div>
      
      {/* Recent Activity Table */}
      <Card title="Recent Interceptions">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-800">
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider font-mono">Timestamp</th>
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider font-mono">Type</th>
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider font-mono">Target</th>
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider font-mono text-right">Risk Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {history.length > 0 ? history.map(h => (
                        <tr key={h.id} className="group hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 text-sm text-gray-400 font-mono">
                                {new Date(h.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-3 text-sm">
                                <span className={`px-2 py-1 rounded-md text-xs font-mono ${
                                    h.type === 'PHONE' ? 'bg-blue-500/10 text-blue-400' : 
                                    h.type === 'EMAIL' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-red-500/10 text-red-400'
                                }`}>
                                    {h.type}
                                </span>
                            </td>
                            <td className="py-3 text-sm text-gray-300 font-mono">{h.query}</td>
                            <td className="py-3 text-sm text-right">
                                <span className={`font-mono ${
                                    h.riskScore > 70 ? 'text-red-400' : h.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                    {h.riskScore}/100
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No recent activity detected.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
