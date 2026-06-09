import React, { useState } from 'react';
import { Client, Contract, OneOffCharge, OneOffCategory } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Plus,
  BookOpen,
  Shirt,
  Percent,
  FileText
} from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  contracts: Contract[];
  charges: OneOffCharge[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ clients, contracts, charges, onNavigate }: DashboardProps) {
  // Filters & State
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Calculates MRR exclusively from ACTIVE contracts
  const activeContracts = contracts.filter(c => c.status === 'ativo');
  
  // Nominal Sum of active recurring contracts
  const grossRecurringVolume = activeContracts.reduce((sum, c) => sum + c.value, 0);

  // Normalized Monthly Recurring Revenue (MRR)
  // Monthly equivalent calculation:
  // - mensal: value
  // - trimestral: value / 3
  // - semestral: value / 6
  // - anual: value / 12
  const normalizedMRR = activeContracts.reduce((sum, c) => {
    switch (c.billingCycle) {
      case 'trimestral': return sum + (c.value / 3);
      case 'semestral': return sum + (c.value / 6);
      case 'anual': return sum + (c.value / 12);
      case 'mensal':
      default:
        return sum + c.value;
    }
  }, 0);

  // One-off Extra Charges calculations (Materials, uniforms, fees, makeup exams etc)
  const extraChargesFiltered = charges.filter(c => {
    if (selectedPeriod === 'paid') return c.status === 'pago';
    if (selectedPeriod === 'unpaid') return c.status !== 'pago';
    return true;
  });

  const totalExtraCharges = extraChargesFiltered.reduce((sum, c) => sum + c.value, 0);
  const paidExtraCharges = charges.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.value, 0);
  const pendingExtraCharges = charges.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.value, 0);
  const overdueExtraCharges = charges.filter(c => c.status === 'atrasado').reduce((sum, c) => sum + c.value, 0);

  // Consolidated Billing (Faturamento Consolidado)
  // Let's frame this clearly: Nominal Active Recurring + Paid Extras (or Total Extras depending on perspective)
  // We'll show all components in a clear math layout so managers see everything.
  const consolidatedTotal = grossRecurringVolume + paidExtraCharges;

  // Active general clients
  const activeClientsCount = clients.filter(c => c.status === 'ativo').length;

  // Extra charges categories breakdown
  const categoryLabels: Record<OneOffCategory, string> = {
    uniforme: 'Uniformes',
    material: 'Materiais',
    taxa: 'Taxas Administrativas',
    prova_substitutiva: 'Provas Substitutivas',
    outro: 'Outros Extras'
  };

  const categoryIcons: Record<OneOffCategory, React.ReactNode> = {
    uniforme: <Shirt className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    material: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    taxa: <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    prova_substitutiva: <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    outro: <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
  };

  const extrasByCategory = charges.reduce((acc, charge) => {
    acc[charge.category] = (acc[charge.category] || 0) + charge.value;
    return acc;
  }, {} as Record<OneOffCategory, number>);

  const maxCategoryValue = Math.max(...Object.values(extrasByCategory), 1);

  // Latest transactions / activity log
  const recentCharges = [...charges]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Gestão Financeira</h1>
          <p className="text-slate-400 text-sm mt-1">
            Análises de receita recorrente contratual e controle individual de cobranças avulsas em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('cobranças')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            id="btn-quick-new-charge"
          >
            <Plus className="w-4 h-4" />
            Lançar Cobrança Avulsa
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR Card */}
        <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-5 shadow-lg relative overflow-hidden" id="card-mrr">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Receita Recorrente - MRR</span>
            <div className="p-2 bg-indigo-950/40 border border-indigo-800/30 text-indigo-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">{formatBRL(normalizedMRR)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ativo normalizado mensalmente
            </p>
            <div className="border-t border-[#1d1f2f] mt-4 pt-3 flex justify-between text-xs text-slate-400">
              <span>Soma bruta mensal:</span>
              <span className="font-semibold text-slate-200">{formatBRL(grossRecurringVolume)}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-indigo-500/10 to-transparent pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Extra Revenue Card */}
        <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-5 shadow-lg relative overflow-hidden" id="card-extras">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Receitas Extras (Avulsas)</span>
            <div className="p-2 bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">{formatBRL(totalExtraCharges)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Uniformes, materiais, taxas e extras
            </p>
            <div className="border-t border-[#1d1f2f] mt-4 pt-3 flex justify-between text-xs text-slate-400">
              <span>Extras Já Recebidos:</span>
              <span className="font-semibold text-emerald-400">{formatBRL(paidExtraCharges)}</span>
            </div>
          </div>
        </div>

        {/* Consolidated Billing Card */}
        <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-5 shadow-lg relative overflow-hidden" id="card-consolidated">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Faturamento Consolidado</span>
            <div className="p-2 bg-blue-950/40 border border-blue-800/30 text-blue-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">{formatBRL(consolidatedTotal)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Soma Brutal Ativos + Extras Pagos
            </p>
            <div className="border-t border-[#1d1f2f] mt-4 pt-3 flex justify-between text-xs text-slate-400">
              <span>Pendente + Atrasado:</span>
              <span className="font-semibold text-amber-550">{formatBRL(pendingExtraCharges + overdueExtraCharges)}</span>
            </div>
          </div>
        </div>

        {/* Clients Ratio Card */}
        <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-5 shadow-lg relative overflow-hidden" id="card-clients">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Base de Clientes</span>
            <div className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">{activeClientsCount} <span className="text-sm font-normal text-slate-400">ativos</span></h3>
            <p className="text-xs text-slate-400 mt-1">
              De um total de {clients.length} cadastrados
            </p>
            <div className="border-t border-[#1d1f2f] mt-4 pt-3 flex justify-between text-xs text-slate-400">
              <span>Taxa de Adimplemento:</span>
              <span className="font-semibold text-indigo-400">
                {charges.length > 0 
                  ? `${Math.round((charges.filter(c => c.status === 'pago').length / charges.length) * 100)}%`
                  : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Area for Overdue Extra Charges */}
      {overdueExtraCharges > 0 && (
        <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 flex items-start gap-3 text-rose-200" id="overdue-warning-banner">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Atenção Administrativa:</span> Existem cobranças avulsas vencidas e não pagas que somam <strong className="font-bold text-rose-300">{formatBRL(overdueExtraCharges)}</strong>. 
            Recomendamos o contato direto ou a emissão de notificações de cobrança na aba de clientes.
          </div>
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Distribution graphs and explanations */}
        <div className="lg:col-span-2 bg-[#12131e] rounded-xl border border-[#212333]/90 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#212333] pb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Origem de Receitas Extras</h3>
              <p className="text-xs text-slate-450 mt-0.5">Separação rigorosa para evitar impactos ou distorções na métrica de Receita Recorrente</p>
            </div>
            <div className="flex gap-1 bg-[#1a1b2a] p-1 rounded-lg text-xs border border-[#2b2d41] self-start sm:self-auto">
              <button 
                onClick={() => setSelectedPeriod('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${selectedPeriod === 'all' ? 'bg-[#24263b] shadow-md font-medium text-white' : 'text-slate-450 hover:text-white'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setSelectedPeriod('paid')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${selectedPeriod === 'paid' ? 'bg-[#24263b] shadow-md font-medium text-emerald-400' : 'text-slate-450 hover:text-white'}`}
              >
                Pagos
              </button>
              <button 
                onClick={() => setSelectedPeriod('unpaid')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${selectedPeriod === 'unpaid' ? 'bg-[#24263b] shadow-md font-medium text-amber-400' : 'text-slate-450 hover:text-white'}`}
              >
                Pendentes
              </button>
            </div>
          </div>

          {/* Graphical Representation of Categories (SVG + Tailwind custom layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Visual breakdown bars */}
            <div className="space-y-4">
              {(['uniforme', 'material', 'taxa', 'prova_substitutiva', 'outro'] as OneOffCategory[]).map((cat) => {
                const totalVal = charges
                  .filter(c => {
                    const statusMatch = selectedPeriod === 'all' 
                      ? true 
                      : selectedPeriod === 'paid' 
                        ? c.status === 'pago' 
                        : c.status !== 'pago';
                    return c.category === cat && statusMatch;
                  })
                  .reduce((sum, c) => sum + c.value, 0);

                const percent = Math.min(Math.round((totalVal / maxCategoryValue) * 100), 100) || 0;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {categoryIcons[cat]}
                        <span className="font-semibold text-slate-300">{categoryLabels[cat]}</span>
                      </div>
                      <span className="font-bold text-white">{formatBRL(totalVal)}</span>
                    </div>
                    <div className="w-full bg-[#1b1c29] h-2.5 rounded-full overflow-hidden border border-[#282a3d]/40">
                      <div 
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat === 'uniforme' ? 'bg-amber-500' :
                          cat === 'material' ? 'bg-emerald-500' :
                          cat === 'taxa' ? 'bg-blue-500' :
                          cat === 'prova_substitutiva' ? 'bg-purple-500' :
                          'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory widget and visual circular layout */}
            <div className="bg-[#1a1b2a]/60 rounded-xl p-5 border border-[#2d2f44] flex flex-col justify-between h-full space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Diretriz Contábil do Sistema</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                  Para garantir a acurácia do LTV (Lifetime Value) e avaliações de captação de investimento, este software possui isolamento absoluto entre:
                </p>
                <ul className="text-xs text-slate-350 mt-3 space-y-1.5 list-disc pl-4 font-sans">
                  <li><strong>Contratos Recorrentes:</strong> Contribuem diretamente para a métrica de <b>MRR</b>.</li>
                  <li><strong>Acessórios / Extras:</strong> São faturados de forma paralela sem inflar os contratos regulares.</li>
                </ul>
              </div>
              <div className="text-[11px] text-slate-400 bg-[#0d0e14]/90 px-3 py-2 rounded-lg border border-[#242636] font-mono">
                Fórmula de MRR = ∑ (Contrato Ativo / Meses do Ciclo)
              </div>
            </div>
          </div>

          {/* Interactive Comparison chart (SVG customized representation) */}
          <div className="pt-4 border-t border-[#212333]">
            <h4 className="text-sm font-bold text-slate-200 mb-3">Linha de Faturamento Mensal (Análise de Consistência)</h4>
            <div className="w-full bg-[#161724]/60 rounded-xl p-4 border border-[#222435]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block"></span>
                    <span className="text-slate-300">Receita Recorrente Estável: {formatBRL(normalizedMRR)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full inline-block"></span>
                    <span className="text-slate-300">Arrecadação de Extras: {formatBRL(paidExtraCharges)}</span>
                  </div>
                </div>
              </div>
              
              {/* Graphical simulation using SVG for elegant, stable layout */}
              <div className="h-28 flex items-end gap-3 px-2 pt-2 border-b border-[#2d2f44]">
                {/* Simulated months to prove consistent recurrent revenue line with volatile extra bills */}
                {[
                  { label: 'Jan', rec: normalizedMRR * 0.9, extra: 650 },
                  { label: 'Fev', rec: normalizedMRR * 0.95, extra: 120 },
                  { label: 'Mar', rec: normalizedMRR * 0.98, extra: 0 },
                  { label: 'Abr', rec: normalizedMRR * 1.0, extra: 0 },
                  { label: 'Mai', rec: normalizedMRR, extra: 100 },
                  { label: 'Jun (Atual)', rec: normalizedMRR, extra: paidExtraCharges },
                ].map((item, i) => {
                  const maxVal = normalizedMRR + 1000;
                  const recHeight = (item.rec / maxVal) * 100;
                  const extraHeight = (item.extra / maxVal) * 100;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-slate-950 text-slate-200 border border-slate-800 text-[10px] py-1.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-mono shadow-xl">
                        Recorrente: {formatBRL(item.rec)} | Extra: {formatBRL(item.extra)}
                      </div>
                      <div className="w-full flex gap-1 justify-center items-end h-full">
                        {/* Recorrente bar */}
                        <div 
                          className="w-4 bg-indigo-500 rounded-t-sm group-hover:opacity-80 transition-opacity" 
                          style={{ height: `${Math.max(recHeight, 4)}%` }} 
                        />
                        {/* Extra bar */}
                        <div 
                          className="w-4 bg-emerald-400 rounded-t-sm group-hover:opacity-85 transition-opacity" 
                          style={{ height: `${Math.max(extraHeight, item.extra > 0 ? 4 : 0)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 font-mono">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Extra Charges timeline and status */}
        <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#212333] pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Cobranças Extras Recentes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monitoramento de recebimentos adicionais</p>
              </div>
              <button 
                onClick={() => onNavigate('cobranças')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-4">
              {recentCharges.map((charge) => {
                const client = clients.find(c => c.id === charge.clientId);
                return (
                  <div key={charge.id} className="text-xs flex flex-col p-3 rounded-lg border border-[#212333] bg-[#1a1b2a]/30 hover:border-[#2f3148] transition-colors gap-1">
                    <div className="flex justify-between items-start gap-2">
                       <span className="font-semibold text-slate-200 truncate max-w-[124px]">{charge.description}</span>
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                         charge.status === 'pago' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/20' :
                         charge.status === 'atrasado' ? 'bg-rose-950/40 text-rose-400 border border-rose-850/20' : 'bg-amber-950/40 text-amber-400 border border-amber-800/20'
                       }`}>
                         {charge.status === 'pago' ? 'Pago' : charge.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                       </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 text-slate-400">
                      <span>Cliente: <strong className="font-semibold text-slate-300">{client ? client.name : 'N/A'}</strong></span>
                      <span className="font-bold text-slate-200 font-mono">{formatBRL(charge.value)}</span>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 border-t border-[#222435] pt-1 leading-none">
                      <span>Vencimento: {charge.dueDate}</span>
                      {charge.paidAt && <span className="text-emerald-450">PAGO: {charge.paidAt}</span>}
                    </div>
                  </div>
                );
              })}

              {recentCharges.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma cobrança extra registrada até o momento.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#212333] bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/40 text-center space-y-3">
            <div>
              <span className="text-xs font-bold text-indigo-200 block mb-1">Precisa extrair dados consolidados?</span>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">O sistema monta estimativas de fluxo de caixa e exportações inteligentes do seu dashboard.</p>
            </div>
            <button 
              onClick={() => onNavigate('relatórios')}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Consultar Relatórios Completos
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
