
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Deal, Agent, MonthlyMetric, AgentSummary, ManualMetric } from './types';
import { MONTHS, AGENTS, Icons } from './constants';
import { geminiService } from './services/geminiService';

// --- Sub-components ---

const NavBar: React.FC = () => (
  <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Icons.PieChart />
          <span>INS Sales Master</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/add" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Icons.Plus />
            <span className="hidden sm:inline">Add Deal</span>
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const DealForm: React.FC<{ 
  onSave: (deal: Deal) => void, 
  initialData?: Deal 
}> = ({ onSave, initialData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Deal>>({
    agentId: AGENTS[1], // Default to Joanna
    dealDate: new Date().toISOString().split('T')[0],
    pf: false,
    issuedMonth: MONTHS[new Date().getMonth()],
    commissionPercentage: 60,
    expectedDrawdownMonth: MONTHS[new Date().getMonth()],
    salesSubChannel: 'HSV Miki',
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agentId || !formData.sumInsured) return;

    const deal: Deal = {
      ...formData as Deal,
      id: formData.id || crypto.randomUUID(),
      commissionAmount: (formData.sumInsured || 0) * ((formData.commissionPercentage || 0) / 100)
    };
    onSave(deal);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {initialData ? 'Edit Deal' : 'New Deal Entry'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Agent Name</label>
          <select 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.agentId || ''}
            onChange={e => setFormData({ ...formData, agentId: e.target.value })}
            required
          >
            <option value="" disabled>Select Agent</option>
            {AGENTS.map(agent => <option key={agent} value={agent}>{agent}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Client Name</label>
          <input 
            type="text" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.clientName || ''}
            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sales (Sub-channel)</label>
          <input 
            type="text" 
            list="sales-options"
            placeholder="e.g. HSV Miki"
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.salesSubChannel || ''}
            onChange={e => setFormData({ ...formData, salesSubChannel: e.target.value })}
          />
          <datalist id="sales-options">
            <option value="HSV Miki" />
            <option value="Direct Sales" />
            <option value="Referral" />
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Deal Date</label>
          <input 
            type="date" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.dealDate}
            onChange={e => setFormData({ ...formData, dealDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Plan</label>
          <input 
            type="text" 
            placeholder="e.g. CL 晉裕"
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.planName || ''}
            onChange={e => setFormData({ ...formData, planName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sum Insured (HKD)</label>
          <input 
            type="number" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.sumInsured || ''}
            onChange={e => setFormData({ ...formData, sumInsured: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Commission %</label>
          <input 
            type="number" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.commissionPercentage}
            onChange={e => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Issued Month</label>
          <select 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.issuedMonth}
            onChange={e => setFormData({ ...formData, issuedMonth: e.target.value })}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Expected Drawdown</label>
          <select 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.expectedDrawdownMonth}
            onChange={e => setFormData({ ...formData, expectedDrawdownMonth: e.target.value })}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          id="pf" 
          className="w-4 h-4 text-blue-600 rounded" 
          checked={formData.pf}
          onChange={e => setFormData({ ...formData, pf: e.target.checked })}
        />
        <label htmlFor="pf" className="text-sm text-slate-700 font-medium">Premium Financing (PF)</label>
      </div>
      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
      >
        {initialData ? 'Update Deal' : 'Save Deal'}
      </button>
    </form>
  );
};

// Generates the text for a single agent report
// UPDATED: Now filters to ONLY include favorited (starred) deals for the report
const generateAgentReportText = (s: AgentSummary, today: string) => {
  let text = `*${today}*\n\n`;
  text += `*${s.agentName}*\n`;
  
  const favoritedDeals = s.recentDeals.filter(d => d.isFavorited);

  if (favoritedDeals.length > 0) {
    favoritedDeals.forEach(d => {
      text += `Deal Date: ${d.dealDate}\n`;
      text += `Sales：${d.salesSubChannel}\n`;
      text += `Plan: ${d.planName}\n`;
      text += `PF: ${d.pf ? 'Yes' : 'No'}\n`;
      text += `Sum Insured: HKD${d.sumInsured.toLocaleString()}\n`;
      text += `Issued month: ${d.issuedMonth}\n`;
      text += `Commission%:${d.commissionPercentage}%(HKD${d.commissionAmount.toLocaleString()})\n`;
      text += `Client name: ${d.clientName}\n\n`;
    });
  } else {
    text += `Nil\n\n`;
  }

  const activeIncome = s.monthlyIncome.filter(m => m.amount > 0 || m.isManual);
  text += `*Total INS income*(每日累計）\n`;
  if (activeIncome.length > 0) {
    activeIncome.forEach(m => {
      text += `(${m.month}) HKD ${m.amount.toLocaleString()}(${m.dealCount} deals)\n`;
    });
  } else {
    text += `(nil)\n`;
  }
  
  const activeDrawdown = s.expectedDrawdown.filter(m => m.amount > 0 || m.isManual);
  text += `\n*Expected Drawdown Month*\n`;
  if (activeDrawdown.length > 0) {
    activeDrawdown.forEach(m => {
      text += `(${m.month}) HK$${m.amount.toLocaleString()} (${m.dealCount} deals)\n`;
    });
  } else {
    text += `(nil)\n`;
  }
  text += `\n.................\n`;
  return text;
};

const AgentReportCard: React.FC<{ summary: AgentSummary, today: string }> = ({ summary, today }) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const reportText = useMemo(() => generateAgentReportText(summary, today), [summary, today]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reportText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col group overflow-hidden transition-all">
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-750 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="text-slate-500">
            {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
          </div>
          <h3 className="font-bold text-slate-100">
            {summary.agentName}'s Report
          </h3>
        </div>
        <button 
          onClick={handleCopy}
          className={`${copied ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} text-[10px] px-3 py-1.5 rounded uppercase font-bold transition-all flex items-center gap-1.5`}
        >
          {copied ? 'Copied!' : <><Icons.Clipboard /> Copy</>}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-4 pt-0 border-t border-slate-700/50">
          <pre className="text-[10px] text-slate-400 font-mono bg-slate-900/50 p-3 rounded max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {reportText}
          </pre>
        </div>
      )}
    </div>
  );
};

const ReportGenerator: React.FC<{ summaries: AgentSummary[], onResetFavorites: () => void }> = ({ summaries, onResetFavorites }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');

  const fullReportText = useMemo(() => {
    return summaries.map(s => generateAgentReportText(s, today)).join('\n').trim();
  }, [summaries, today]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl border border-slate-700 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
          <Icons.Clipboard />
          Daily Reporting
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onResetFavorites}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            title="Unstar all deals"
          >
            Clear Records
          </button>
          <button 
            onClick={handleCopyAll}
            className={`${copiedAll ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'} px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2`}
          >
            {copiedAll ? 'Team Copied!' : 'Copy Team Report'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-widest border-b border-slate-800 pb-2 flex justify-between">
          <span>Daily Report Preview (Starred only)</span>
          <span className="text-[10px] lowercase text-slate-500">Star deals in the table to add them here</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {summaries.map(s => (
            <AgentReportCard key={s.agentName} summary={s} today={today} />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-3">Clipboard Content Preview</div>
        <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto text-slate-300 border border-slate-700/50">
          {fullReportText}
        </pre>
      </div>
    </div>
  );
};

const MonthlyOverrideEditor: React.FC<{ 
  agentName: string, 
  metrics: MonthlyMetric[], 
  type: 'income' | 'drawdown',
  onUpdate: (month: string, amount: number, count: number) => void,
  onReset: (month: string) => void
}> = ({ agentName, metrics, type, onUpdate, onReset }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {type === 'income' ? 'Total Income (Comm)' : 'Expected Drawdown (Comm)'}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {metrics.map(m => (
          <div key={m.month} className={`flex flex-col p-2 rounded-lg border transition-all ${m.isManual ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400">{m.month}</span>
              {m.isManual && (
                <button 
                  onClick={() => onReset(m.month)}
                  className="text-amber-600 hover:text-amber-800 text-[8px] font-black uppercase"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-1 py-0.5 text-[11px] bg-transparent outline-none border-b border-transparent focus:border-blue-400"
                  value={m.amount === 0 ? '' : m.amount}
                  placeholder="0"
                  onChange={e => onUpdate(m.month, Number(e.target.value), m.dealCount)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-bold">#</span>
                <input 
                  type="number" 
                  className="w-full pl-4 pr-1 py-0.5 text-[11px] bg-transparent outline-none border-b border-transparent focus:border-blue-400"
                  value={m.dealCount === 0 ? '' : m.dealCount}
                  placeholder="0"
                  onChange={e => onUpdate(m.month, m.amount, Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditDealPage: React.FC<{ deals: Deal[], onSave: (deal: Deal) => void }> = ({ deals, onSave }) => {
  const { id } = useParams();
  const deal = deals.find(d => d.id === id);

  if (!deal) return <div className="text-center p-10">Deal not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors">← Back to Dashboard</Link>
      </div>
      <DealForm onSave={onSave} initialData={deal} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('ins-deals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [manualMetrics, setManualMetrics] = useState<ManualMetric[]>(() => {
    const saved = localStorage.getItem('ins-manual-metrics');
    return saved ? JSON.parse(saved) : [];
  });

  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    localStorage.setItem('ins-deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('ins-manual-metrics', JSON.stringify(manualMetrics));
  }, [manualMetrics]);

  const saveDeal = (deal: Deal) => {
    setDeals(prev => {
      const exists = prev.find(d => d.id === deal.id);
      if (exists) {
        return prev.map(d => d.id === deal.id ? deal : d);
      }
      return [...prev, deal];
    });
  };
  
  const removeDeal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeals(prev => prev.filter(d => d.id !== id));
    }
  };

  const toggleFavorite = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isFavorited: !d.isFavorited } : d));
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all marked daily records?')) {
      setDeals(prev => prev.map(d => ({ ...d, isFavorited: false })));
    }
  };

  const updateManualMetric = (agentName: string, month: string, type: 'income' | 'drawdown', amount: number, dealCount: number) => {
    setManualMetrics(prev => {
      const existing = prev.find(m => m.agentName === agentName && m.month === month && m.type === type);
      if (existing) {
        return prev.map(m => (m.agentName === agentName && m.month === month && m.type === type) ? { ...m, amount, dealCount } : m);
      }
      return [...prev, { agentName, month, type, amount, dealCount }];
    });
  };

  const resetManualMetric = (agentName: string, month: string, type: 'income' | 'drawdown') => {
    setManualMetrics(prev => prev.filter(m => !(m.agentName === agentName && m.month === month && m.type === type)));
  };

  const summaries: AgentSummary[] = useMemo(() => {
    return AGENTS.map(agentName => {
      const agentDeals = deals.filter(d => d.agentId === agentName);
      const sortedByDate = [...agentDeals].sort((a, b) => new Date(b.dealDate).getTime() - new Date(a.dealDate).getTime());
      
      const incomeMap = new Map<string, { amount: number, count: number }>();
      const drawdownMap = new Map<string, { amount: number, count: number }>();

      agentDeals.forEach(d => {
        const income = incomeMap.get(d.issuedMonth) || { amount: 0, count: 0 };
        incomeMap.set(d.issuedMonth, { amount: income.amount + d.commissionAmount, count: income.count + 1 });

        const drawdown = drawdownMap.get(d.expectedDrawdownMonth) || { amount: 0, count: 0 };
        drawdownMap.set(d.expectedDrawdownMonth, { amount: drawdown.amount + d.commissionAmount, count: drawdown.count + 1 });
      });

      const applyOverrides = (month: string, auto: { amount: number, count: number }, type: 'income' | 'drawdown') => {
        const manual = manualMetrics.find(m => m.agentName === agentName && m.month === month && m.type === type);
        if (manual) {
          return { amount: manual.amount, dealCount: manual.dealCount, isManual: true };
        }
        return { ...auto, isManual: false };
      };

      const monthlyIncome = MONTHS.map(month => {
        const auto = incomeMap.get(month) || { amount: 0, count: 0 };
        return { month, ...applyOverrides(month, auto, 'income') };
      });

      const expectedDrawdown = MONTHS.map(month => {
        const auto = drawdownMap.get(month) || { amount: 0, count: 0 };
        return { month, ...applyOverrides(month, auto, 'drawdown') };
      });

      return {
        agentName,
        recentDeals: sortedByDate,
        monthlyIncome,
        expectedDrawdown
      };
    });
  }, [deals, manualMetrics]);

  const handleAIScan = async () => {
    const text = prompt("Paste your current report text here to auto-import deals:");
    if (!text) return;
    
    setIsParsing(true);
    try {
      const result = await geminiService.parseReport(text);
      if (result.deals && result.deals.length > 0) {
        const newDeals: Deal[] = result.deals.map((d: any) => {
          const sum = Number(d.sumInsured) || 0;
          const commPct = Number(d.commissionPercentage) || 60;
          return {
            ...d,
            id: crypto.randomUUID(),
            agentId: d.agentName || AGENTS[1], // Joanna
            dealDate: d.dealDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
            pf: d.pf || false,
            issuedMonth: d.issuedMonth || MONTHS[new Date().getMonth()],
            expectedDrawdownMonth: d.expectedDrawdownMonth || d.issuedMonth || MONTHS[new Date().getMonth()],
            salesSubChannel: d.salesSubChannel || 'HSV Miki',
            commissionPercentage: commPct,
            commissionAmount: sum * (commPct / 100),
            clientName: d.clientName || 'Unknown Client',
            sumInsured: sum,
            isFavorited: true // Auto-star AI imported deals as they are usually for the current report
          };
        });
        setDeals(prev => [...prev, ...newDeals]);
        alert(`Successfully imported ${newDeals.length} deals!`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse report. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">Sales Dashboard</h1>
                      <p className="text-slate-500 text-sm">Review transactions and manage daily reporting.</p>
                    </div>
                    <button 
                      onClick={handleAIScan}
                      disabled={isParsing}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <Icons.Sparkles />
                      {isParsing ? 'Processing...' : 'Import Report via AI'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-200 transition-colors">
                        <Icons.PieChart />
                      </div>
                      <div className="text-slate-500 text-sm font-medium mb-1">Total Sum Insured</div>
                      <div className="text-3xl font-bold text-slate-900">
                        HKD {deals.reduce((acc, curr) => acc + curr.sumInsured, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-emerald-50 group-hover:text-emerald-100 transition-colors">
                        <Icons.Plus />
                      </div>
                      <div className="text-slate-500 text-sm font-medium mb-1">Total Expected Comm</div>
                      <div className="text-3xl font-bold text-emerald-600">
                        HKD {deals.reduce((acc, curr) => acc + curr.commissionAmount, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Transaction History Grouped by Agent */}
                  <div className="space-y-8">
                    {summaries.map(s => (
                      <div key={s.agentName} id={`transactions-${s.agentName}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {s.agentName}'s Transactions
                          </h3>
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {s.recentDeals.length} deals
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200">
                                <th className="px-6 py-3">Sales / Sub</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Sum Insured</th>
                                <th className="px-6 py-3">Comm Amount</th>
                                <th className="px-6 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {s.recentDeals.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic text-sm">No transactions found for {s.agentName}.</td>
                                </tr>
                              ) : (
                                s.recentDeals.map(deal => (
                                  <tr key={deal.id} className={`hover:bg-slate-50 transition-colors group ${deal.isFavorited ? 'bg-amber-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                      <div className="font-medium text-slate-800 text-sm">{deal.salesSubChannel}</div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{deal.planName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                                      {deal.clientName}
                                      {deal.pf && <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-black">PF</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-semibold text-slate-900 text-sm">HKD {deal.sumInsured.toLocaleString()}</div>
                                      <div className="text-[10px] text-slate-500">{deal.dealDate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-semibold text-emerald-600 text-sm">HKD {deal.commissionAmount.toLocaleString()}</div>
                                      <div className="text-[10px] text-slate-500">{deal.commissionPercentage}%</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => toggleFavorite(deal.id)}
                                          className={`p-1.5 rounded transition-all ${deal.isFavorited ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'}`}
                                          title={deal.isFavorited ? "Remove from daily report" : "Add to daily report"}
                                        >
                                          {deal.isFavorited ? <Icons.StarFilled /> : <Icons.Star />}
                                        </button>
                                        <Link 
                                          to={`/edit/${deal.id}`}
                                          className="text-slate-300 hover:text-blue-600 transition-colors p-1.5"
                                        >
                                          <Icons.Edit />
                                        </Link>
                                        <button 
                                          onClick={() => removeDeal(deal.id)}
                                          className="text-slate-300 hover:text-red-600 transition-colors p-1.5"
                                        >
                                          <Icons.Trash />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Report Generator with Foldable summaries */}
                  <ReportGenerator summaries={summaries} onResetFavorites={clearAllFavorites} />
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">Monthly Commission Adjustments</h3>
                    </div>
                    <div className="space-y-8">
                      {summaries.map(s => (
                        <div key={s.agentName} className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <h4 className="font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {s.agentName}
                          </h4>
                          <MonthlyOverrideEditor 
                            agentName={s.agentName} 
                            metrics={s.monthlyIncome} 
                            type="income" 
                            onUpdate={(m, a, c) => updateManualMetric(s.agentName, m, 'income', a, c)}
                            onReset={(m) => resetManualMetric(s.agentName, m, 'income')}
                          />
                          <MonthlyOverrideEditor 
                            agentName={s.agentName} 
                            metrics={s.expectedDrawdown} 
                            type="drawdown" 
                            onUpdate={(m, a, c) => updateManualMetric(s.agentName, m, 'drawdown', a, c)}
                            onReset={(m) => resetManualMetric(s.agentName, m, 'drawdown')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Icons.StarFilled /> 
                      <span className="text-amber-500">How reporting works</span>
                    </h3>
                    <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4">
                      <li>Click the <strong>Star</strong> icon next to a deal to mark it for today's report.</li>
                      <li>Starred deals automatically appear in the <strong>Daily Reporting</strong> section.</li>
                      <li>Use <strong>Clear Records</strong> after you've successfully reported to reset for tomorrow.</li>
                      <li>AI-imported deals are automatically starred for your convenience.</li>
                    </ul>
                  </div>
                </div>
              </div>
            } />
            <Route path="/add" element={
              <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                  <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors">← Back to Dashboard</Link>
                </div>
                <DealForm onSave={saveDeal} />
              </div>
            } />
            <Route path="/edit/:id" element={<EditDealPage deals={deals} onSave={saveDeal} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
