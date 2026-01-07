
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Deal, Agent, MonthlyMetric, AgentSummary } from './types';
import { MONTHS, Icons } from './constants';
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
          <input 
            type="text" 
            placeholder="e.g. Joanna"
            className="mt-1 block w-full rounded-md border-slate-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.agentId || ''}
            onChange={e => setFormData({ ...formData, agentId: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Client Name</label>
          <input 
            type="text" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
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
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
            value={formData.dealDate}
            onChange={e => setFormData({ ...formData, dealDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Plan</label>
          <input 
            type="text" 
            placeholder="e.g. CL 晉裕"
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
            value={formData.planName || ''}
            onChange={e => setFormData({ ...formData, planName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Sum Insured (HKD)</label>
          <input 
            type="number" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
            value={formData.sumInsured || ''}
            onChange={e => setFormData({ ...formData, sumInsured: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Commission %</label>
          <input 
            type="number" 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
            value={formData.commissionPercentage}
            onChange={e => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Issued Month</label>
          <select 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
            value={formData.issuedMonth}
            onChange={e => setFormData({ ...formData, issuedMonth: e.target.value })}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Expected Drawdown</label>
          <select 
            className="mt-1 block w-full rounded-md border-slate-300 border p-2"
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

const ReportGenerator: React.FC<{ summaries: AgentSummary[] }> = ({ summaries }) => {
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    const today = new Date().toISOString().split('T')[0];
    let text = `*${today}*\n\n`;

    summaries.forEach(s => {
      text += `*${s.agentName}*\n`;
      if (s.recentDeals.length > 0) {
        const d = s.recentDeals[0];
        text += `Deal Date: ${d.dealDate}\n`;
        text += `Sales：${d.salesSubChannel || 'HSV Miki'}\n`;
        text += `Plan: ${d.planName || ''}\n`;
        text += `PF: ${d.pf ? 'Yes' : 'No'}\n`;
        text += `Sum Insured: HKD${d.sumInsured.toLocaleString()}\n`;
        text += `Issued month: ${d.issuedMonth}\n`;
        text += `Commission%:${d.commissionPercentage}%(HKD${d.commissionAmount.toLocaleString()})\n`;
        text += `Client name: ${d.clientName}\n\n`;
      } else {
        text += `Nil\n\n`;
      }

      text += `*Total INS income*(每日累計）\n`;
      s.monthlyIncome.forEach(m => {
        text += `(${m.month}) HKD ${m.amount.toLocaleString()}(${m.dealCount} deals)\n`;
      });
      text += `\n*Expected Drawdown Month*\n`;
      s.expectedDrawdown.forEach(m => {
        text += `(${m.month}) ${m.amount > 0 ? 'HK$' + m.amount.toLocaleString() : 'nil'} (${m.dealCount} deals)\n`;
      });
      text += `\n.................\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Clipboard />
          Report Summary
        </h2>
        <button 
          onClick={handleCopy}
          className={`${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'} px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap leading-relaxed">
        {generateText()}
      </pre>
    </div>
  );
};

// --- Page Components ---

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
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    localStorage.setItem('ins-deals', JSON.stringify(deals));
  }, [deals]);

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

  const summaries: AgentSummary[] = useMemo(() => {
    const agents = Array.from(new Set(deals.map(d => d.agentId)));
    return agents.map(agentName => {
      const agentDeals = deals.filter(d => d.agentId === agentName);
      const sortedByDate = [...agentDeals].sort((a, b) => new Date(b.dealDate).getTime() - new Date(a.dealDate).getTime());
      
      const incomeMap = new Map<string, { amount: number, count: number }>();
      const drawdownMap = new Map<string, { amount: number, count: number }>();

      agentDeals.forEach(d => {
        const income = incomeMap.get(d.issuedMonth) || { amount: 0, count: 0 };
        incomeMap.set(d.issuedMonth, { amount: income.amount + d.sumInsured, count: income.count + 1 });

        const drawdown = drawdownMap.get(d.expectedDrawdownMonth) || { amount: 0, count: 0 };
        drawdownMap.set(d.expectedDrawdownMonth, { amount: drawdown.amount + d.sumInsured, count: drawdown.count + 1 });
      });

      const monthlyIncome = Array.from(incomeMap.entries()).map(([month, stats]) => ({
        month, amount: stats.amount, dealCount: stats.count
      })).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

      const expectedDrawdown = Array.from(drawdownMap.entries()).map(([month, stats]) => ({
        month, amount: stats.amount, dealCount: stats.count
      })).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

      return {
        agentName,
        recentDeals: sortedByDate.slice(0, 1),
        monthlyIncome,
        expectedDrawdown
      };
    });
  }, [deals]);

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
            agentId: d.agentName || 'Joanna',
            dealDate: d.dealDate || new Date().toISOString().split('T')[0],
            pf: d.pf || false,
            issuedMonth: d.issuedMonth || MONTHS[new Date().getMonth()],
            expectedDrawdownMonth: d.issuedMonth || MONTHS[new Date().getMonth()],
            salesSubChannel: d.salesSubChannel || 'HSV Miki',
            commissionPercentage: commPct,
            commissionAmount: sum * (commPct / 100),
            clientName: d.clientName || 'Unknown Client',
            sumInsured: sum
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
      <div className="min-h-screen bg-slate-50 pb-20">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">Quick Dashboard</h1>
                      <p className="text-slate-500 text-sm">Review current active sales metrics</p>
                    </div>
                    <button 
                      onClick={handleAIScan}
                      disabled={isParsing}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <Icons.Sparkles />
                      {isParsing ? 'Processing...' : 'Import via AI'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-sm font-medium mb-1">Total Active Sum</div>
                      <div className="text-3xl font-bold text-slate-900">
                        HKD {deals.reduce((acc, curr) => acc + curr.sumInsured, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-sm font-medium mb-1">Total Deals Recorded</div>
                      <div className="text-3xl font-bold text-slate-900">{deals.length}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Transaction History</h3>
                      <Link to="/add" className="text-blue-600 text-sm font-medium hover:underline">Add New</Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-3">Agent</th>
                            <th className="px-6 py-3">Sales / Sub</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Sum Insured</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {deals.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No deals found. Start by adding one!</td>
                            </tr>
                          )}
                          {deals.slice().reverse().map(deal => (
                            <tr key={deal.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-800">{deal.agentId}</div>
                                <div className="text-xs text-slate-400">{deal.planName}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-sm font-medium">{deal.salesSubChannel}</td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{deal.clientName}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900">HKD {deal.sumInsured.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">{deal.issuedMonth} Issued</div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-sm">{deal.dealDate}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Link 
                                    to={`/edit/${deal.id}`}
                                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                  >
                                    <Icons.Edit />
                                  </Link>
                                  <button 
                                    onClick={() => removeDeal(deal.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                  >
                                    <Icons.Trash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <ReportGenerator summaries={summaries} />
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Tips for Reporting</h3>
                    <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4">
                      <li>Use <strong>AI Import</strong> to sync logs. It now detects custom "Sales" values.</li>
                      <li>You can <strong>Edit</strong> existing deals using the pencil icon.</li>
                      <li>The <strong>Sales</strong> field supports custom entries and provides common suggestions.</li>
                      <li>The copy button provides the exact format requested for team updates.</li>
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
