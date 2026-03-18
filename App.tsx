import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Settings, 
  Menu, 
  X, 
  Search,
  Activity,
  MapPin,
  Globe
} from 'lucide-react';
import { View, IntelResult } from './types';
import { generateDashboardSummary } from './services/geminiService';

// Pages
import Dashboard from './pages/Dashboard';
import PhoneIntel from './pages/PhoneIntel';
import EmailIntel from './pages/EmailIntel';
import DarkWebIntel from './pages/DarkWebIntel';
import { Input, Button, Card } from './components/UI';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || "");
  
  // Global State for the session
  const [history, setHistory] = useState<IntelResult[]>([]);

  const addToHistory = (result: IntelResult) => {
    setHistory(prev => [result, ...prev]);
  };

  // Navigation Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center px-4 py-3 mb-1 transition-colors rounded-lg group ${
        currentView === view 
          ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400 rounded-r-none' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${currentView === view ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard history={history} apiKey={apiKey} />;
      case View.PHONE:
        return <PhoneIntel onResult={addToHistory} apiKey={apiKey} />;
      case View.EMAIL:
        return <EmailIntel onResult={addToHistory} apiKey={apiKey} />;
      case View.DARKWEB:
        return <DarkWebIntel onResult={addToHistory} apiKey={apiKey} />;
      case View.SETTINGS:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-gray-400">Configure your environment.</p>
              </div>
            </div>
            
            <Card title="API Configuration">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-4">
                    This application uses the Google Gemini API for threat analysis. 
                    Please provide your API key below. The key is stored only in memory for this session.
                  </p>
                  <Input 
                    label="Gemini API Key" 
                    type="password" 
                    placeholder="AIza..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => alert("Key Saved to Session Memory")}>Save Configuration</Button>
                </div>
              </div>
            </Card>

             <Card title="Data Management">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Session History</h4>
                  <p className="text-sm text-gray-400">Clear all locally stored search results.</p>
                </div>
                <Button variant="danger" onClick={() => setHistory([])}>Clear History</Button>
              </div>
            </Card>
          </div>
        );
      default:
        return <Dashboard history={history} apiKey={apiKey} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg tracking-wider">OSINT NEXUS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b border-gray-800 hidden md:flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold text-lg tracking-wider font-mono text-white">OSINT<span className="text-cyan-400">.AI</span></span>
        </div>

        <div className="flex-1 py-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modules</p>
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={View.PHONE} icon={Phone} label="Phone Intel" />
            <NavItem view={View.EMAIL} icon={Mail} label="Email Intel" />
            <NavItem view={View.DARKWEB} icon={ShieldAlert} label="Dark Web" />
          </div>
          
          <div className="mt-8 space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</p>
            <NavItem view={View.SETTINGS} icon={Settings} label="Settings" />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400 font-mono">System Online</span>
            </div>
            <p className="text-[10px] text-gray-600 font-mono">v2.5.0-flash</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-gray-900 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] pointer-events-none"></div>

        <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
