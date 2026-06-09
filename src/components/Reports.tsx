import React, { useState } from 'react';
import { Client, Contract, OneOffCharge, OneOffCategory } from '../types';
import { 
  FileSpreadsheet, 
  Download, 
  BarChart4, 
  Users, 
  DollarSign, 
  Percent, 
  CheckCircle, 
  AlertTriangle,
  ArrowDownToLine,
  Check
} from 'lucide-react';

interface ReportsProps {
  clients: Client[];
  contracts: Contract[];
  charges: OneOffCharge[];
}

export default function Reports({ clients, contracts, charges }: ReportsProps) {
  const [copied, setCopied] = useState(false);

  // Normalize contribution to MRR for displaying
  const calculateMRRContribution = (value: number, cycle: string) => {
    switch (cycle) {
      case 'trimestral': return value / 3;
      case 'semestral': return value / 6;
      case 'anual': return value / 12;
      case 'mensal':
      default:
        return value;
    }
  };

  // 1. Calculations: Total active MRR (monthly normalized)
  const activeContracts = contracts.filter(c => c.status === 'ativo');
  const normalizedMRR = activeContracts.reduce((sum, c) => sum + calculateMRRContribution(c.value, c.billingCycle), 0);
  const grossMonthlyVol = activeContracts.reduce((sum, c) => sum + c.value, 0);

  // 2. Extra charges stats
  const totalExtra = charges.reduce((sum, c) => sum + c.value, 0);
  const paidExtra = charges.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.value, 0);
  const pendingExtra = charges.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.value, 0);
  const overdueExtra = charges.filter(c => c.status === 'atrasado').reduce((sum, c) => sum + c.value, 0);

  // Consolidated operational revenue
  const consolidatedTotal = grossMonthlyVol + paidExtra;

  // 3. Billing cycles breakdown
  const cyclesBreakdown = activeContracts.reduce((acc, c) => {
    acc[c.billingCycle] = (acc[c.billingCycle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cyclesValueBreakdown = activeContracts.reduce((acc, c) => {
    acc[c.billingCycle] = (acc[c.billingCycle] || 0) + c.value;
    return acc;
  }, {} as Record<string, number>);

  // 4. One-off extra categories breakdown
  const categoryLabels: Record<OneOffCategory, string> = {
    uniforme: 'Uniforme Escolar',
    material: 'Material Didático / Apostilas',
    taxa: 'Taxas Administrativas',
    prova_substitutiva: 'Provas Substitutivas',
    outro: 'Outros Extras'
  };

  const categoriesTotal = charges.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.value;
    return acc;
  }, {} as Record<OneOffCategory, number>);

  // 5. Top customers by receipts (recurring contracts nominal value + paid extras)
  const customersReport = clients.map(client => {
    // Current active contracts for this client
    const customerContracts = contracts.filter(c => c.clientId === client.id && c.status === 'ativo');
    const recurringMonthly = customerContracts.reduce((sum, c) => sum + calculateMRRContribution(c.value, c.billingCycle), 0);
    
    // Total paid extras
    const customerPaidExtras = charges.filter(c => c.clientId === client.id && c.status === 'pago').reduce((sum, c) => sum + c.value, 0);
    const customerPendingExtras = charges.filter(c => c.clientId === client.id && c.status !== 'pago').reduce((sum, c) => sum + c.value, 0);

    return {
      id: client.id,
      name: client.name,
      document: client.document,
      status: client.status,
      recurringMonthly,
      paidExtras: customerPaidExtras,
      pendingExtras: customerPendingExtras,
      consolidatedVolume: recurringMonthly + customerPaidExtras
    };
  }).sort((a, b) => b.consolidatedVolume - a.consolidatedVolume);

  // CSV Generator Simulation
  const handleExportCSV = () => {
    const csvHeader = 'Cod Cliente,Cliente,Documento,Status de Cadastro,Recorrencia Mensal Estavel (BRL),Volume de Extras Pagos (BRL),Volume de Extras Devidos (BRL)\n';
    const csvRows = customersReport.map(cust => 
      `"${cust.id}","${cust.name}","${cust.document}","${cust.status}",${cust.recurringMonthly.toFixed(2)},${cust.paidExtras.toFixed(2)},${cust.pendingExtras.toFixed(2)}`
    ).join('\n');

    const fullCSV = csvHeader + csvRows;
    navigator.clipboard.writeText(fullCSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-management-view">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios de Conciliação e Auditoria</h1>
          <p className="text-slate-400 text-sm mt-1">
            Geração de demonstrativos contábeis consolidados, distribuição por ciclos contratuais e ranking de faturamento por carteira.
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          id="btn-export-csv"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300 animate-pulse" />
              CSV Copiado p/ Área de Transferência!
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              Exportar Matriz Financeira (CSV)
            </>
          )}
        </button>
      </div>

      {/* Grid: 3 columns (Visual stats breakdown box) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Cycles breakdown */}
        <div className="bg-[#12131e] border border-[#212333]/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212333] pb-3 mb-2">
            <BarChart4 className="w-4 h-4 text-indigo-400 font-bold" />
            <h3 className="font-bold text-sm text-white">Ciclos de Recorrência Ativos</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            {['mensal', 'trimestral', 'semestral', 'anual'].map((cycle) => {
              const count = cyclesBreakdown[cycle] || 0;
              const value = cyclesValueBreakdown[cycle] || 0;
              const totalActiveCount = activeContracts.length || 1;
              const slicePercent = Math.round((count / totalActiveCount) * 100);

              return (
                <div key={cycle} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-350">
                    <span className="capitalize font-semibold">{cycle} ({count} planos)</span>
                    <span className="font-bold text-slate-200 font-mono">{formatBRL(value)}/ciclo</span>
                  </div>
                  <div className="w-full bg-[#171825] h-2 rounded-full overflow-hidden border border-[#292a3e]/30">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${slicePercent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">{slicePercent}% da base de contratos</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 2: Categories of Extras */}
        <div className="bg-[#12131e] border border-[#212333]/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212333] pb-3 mb-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Rateio Contábil de Extras</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            {(['uniforme', 'material', 'taxa', 'prova_substitutiva', 'outro'] as OneOffCategory[]).map((cat) => {
              const val = categoriesTotal[cat] || 0;
              const totalAllExtras = totalExtra || 1;
              const slicePercent = Math.round((val / totalAllExtras) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-350">
                    <span className="font-semibold">{categoryLabels[cat]}</span>
                    <span className="font-bold text-slate-200 font-mono">{formatBRL(val)}</span>
                  </div>
                  <div className="w-full bg-[#171825] h-2 rounded-full overflow-hidden border border-[#292a3e]/30">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${slicePercent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">{slicePercent}% das cobranças avulsas</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 3: General solvency efficiency */}
        <div className="bg-[#12131e] border border-[#212333]/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#212333] pb-3 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Eficiência de Arrecadação</h3>
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="bg-[#161725] p-3.5 rounded-lg border border-[#212333] space-y-2">
              <div className="flex justify-between text-slate-350 text-xs">
                <span>Cobranças Extras Liquidadas:</span>
                <span className="font-semibold text-emerald-400 font-mono">{formatBRL(paidExtra)}</span>
              </div>
              <div className="flex justify-between text-slate-350 text-xs">
                <span>Cobranças Extras Pendentes:</span>
                <span className="font-semibold text-amber-400 font-mono">{formatBRL(pendingExtra)}</span>
              </div>
              <div className="flex justify-between text-slate-350 text-xs">
                <span>Cobranças Extras Atrasadas:</span>
                <span className="font-semibold text-rose-450 font-mono">{formatBRL(overdueExtra)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Índice de Adimplemento (Extras)</span>
              <div className="flex items-center gap-2">
                <div className="w-full bg-[#171825] h-3 rounded-full overflow-hidden border border-[#292a3e]/30">
                  <div 
                    className="bg-emerald-500 h-full rounded-full animate-pulse" 
                    style={{ 
                      width: `${charges.length > 0 ? (charges.filter(c => c.status === 'pago').length / charges.length) * 100 : 100}%` 
                    }} 
                  />
                </div>
                <span className="font-extrabold text-white shrink-0 font-mono text-sm">
                  {charges.length > 0 
                    ? `${Math.round((charges.filter(c => c.status === 'pago').length / charges.length) * 100)}%`
                    : '100%'}
                </span>
              </div>
              <span className="text-[10px] text-slate-550 block mt-0.5 leading-relaxed">
                Reflete a quantidade de faturas acessórias liquidadas em relação ao total de faturas extras emitidas.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Bottom list structure: Ranking of top clients and consolidate logs */}
      <div className="bg-[#12131e] border border-[#212333]/90 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#212333] bg-[#1a1b2a]/40">
          <h3 className="font-bold text-white text-sm">Demonstrativo por Cliente (Faturamento Consolidado Individual)</h3>
          <p className="text-xs text-slate-400 mt-1">Estimativa de repasse e arrecadação de cada cliente na carteira, integrando sua recorrência normalizada e os pagamentos extras efetuados.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="billing-ranking-table">
            <thead className="bg-[#171825] text-slate-450 uppercase font-bold text-[10px] border-b border-[#212333]">
              <tr>
                <th className="p-4">Cliente / Contratante</th>
                <th className="p-4 font-mono">Documento</th>
                <th className="p-4">Status de Cadastro</th>
                <th className="p-4 text-right">Recorrência Mensal (MRR)</th>
                <th className="p-4 text-right">Extras Liquidados</th>
                <th className="p-4 text-right">Extras Pendentes/Atrasados</th>
                <th className="p-4 text-right">Volume Consolidado Realizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e202e] text-slate-350">
              {customersReport.map((c, index) => {
                return (
                  <tr key={c.id} className="hover:bg-[#1a1c2b]/30 transition-colors">
                    <td className="p-4 flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#181a29] font-bold text-slate-400 text-[10px] flex items-center justify-center border border-[#2c2f45]/50">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-white">{c.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {c.document}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        c.status === 'ativo' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' : 'bg-slate-900 text-slate-500 border border-slate-800/10'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-300 font-mono">
                      {formatBRL(c.recurringMonthly)}
                    </td>
                    <td className="p-4 text-right font-semibold text-emerald-400 font-mono">
                      {formatBRL(c.paidExtras)}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-400 font-mono">
                      {formatBRL(c.pendingExtras)}
                    </td>
                    <td className="p-4 text-right font-extrabold text-indigo-300 bg-[#161726]/40 font-mono">
                      {formatBRL(c.recurringMonthly + c.paidExtras)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
