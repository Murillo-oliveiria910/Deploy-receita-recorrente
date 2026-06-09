import React, { useState } from 'react';
import { Client, Contract } from '../types';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  AlertCircle, 
  Calendar, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface ContractManagementProps {
  clients: Client[];
  contracts: Contract[];
  onAddContract: (newContract: Omit<Contract, 'id'>) => void;
  onUpdateContractStatus: (id: string, status: 'ativo' | 'suspenso' | 'cancelado') => void;
  onDeleteContract: (id: string) => void;
}

export default function ContractManagement({ 
  clients, 
  contracts, 
  onAddContract, 
  onUpdateContractStatus,
  onDeleteContract 
}: ContractManagementProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'suspenso' | 'cancelado'>('all');
  
  // Create Modal state
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [formClientId, setFormClientId] = useState('');
  const [formPlanName, setFormPlanName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formCycle, setFormCycle] = useState<'mensal' | 'trimestral' | 'semestral' | 'anual'>('mensal');
  const [formStartDate, setFormStartDate] = useState('');
  const [formError, setFormError] = useState('');

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

  // Filter clients that can accept a contract (typically actives, but we display all that exist)
  const activeClients = clients.filter(c => c.status === 'ativo');

  // Filter contracts
  const filteredContracts = contracts.filter(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    const clientName = client ? client.name.toLowerCase() : '';
    const planName = c.planName.toLowerCase();
    
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || 
                          planName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = () => {
    if (activeClients.length === 0) {
      alert('Para cadastrar um contrato recorrente, você deve possuir pelo menos um cliente "Ativo" cadastrado no sistema.');
      return;
    }
    setFormClientId(activeClients[0].id);
    setFormPlanName('');
    setFormValue('');
    setFormCycle('mensal');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsOpenForm(true);
  };

  const handleSubmitContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlanName.trim() || !formValue || parseFloat(formValue) <= 0 || !formStartDate || !formClientId) {
      setFormError('Por favor preencha todos os campos obrigatórios e garanta um valor positivo.');
      return;
    }

    onAddContract({
      clientId: formClientId,
      planName: formPlanName,
      value: parseFloat(formValue),
      billingCycle: formCycle,
      status: 'ativo',
      startDate: formStartDate
    });

    setIsOpenForm(false);
    setFormPlanName('');
    setFormValue('');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };  return (
    <div className="space-y-6 animate-fade-in" id="contracts-management-view">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Contratos de Recorrência</h1>
          <p className="text-slate-400 text-sm mt-1">
            Controle e precificação de planos recorrentes ativos de clientes. O somatório de contratos "Ativos" define a Receita Recorrente.
          </p>
        </div>
        <button 
          onClick={handleOpenForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          id="btn-add-contract-dialog"
        >
          <Plus className="w-4 h-4" />
          Novo Contrato Recorrente
        </button>
      </div>

      {/* Info Warning banner detailing accounting logic */}
      <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-4 text-slate-300 text-xs flex gap-3 items-start">
        <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-indigo-200">Regra Contábil de Cálculo do MRR (Monthly Recurring Revenue):</span>
          <p className="leading-relaxed text-slate-400">
            Contratos suspensos ou cancelados são sumariamente retirados da fórmula de Receita Recorrente total. 
            Contratos com ciclos trimestrais, semestrais ou anuais são devidamente <b>diluídos mensalmente</b> no painel de controle principal (pro-rata temporis), 
            oferecendo uma visão fidedigna do fluxo de caixa e estabilidade operacional.
          </p>
        </div>
      </div>

      {/* Filter and Table container */}
      <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 shadow-xl overflow-hidden">
        
        {/* Search / Filter Area */}
        <div className="p-4 border-b border-[#212333] bg-[#1a1b2a]/40 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou nome do plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm focus:outline-hidden text-slate-200 placeholder-slate-500"
              id="contract-search-input"
            />
          </div>
          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm text-slate-300 focus:outline-hidden cursor-pointer"
              id="contract-status-filter"
            >
              <option value="all">Todas as Situações</option>
              <option value="ativo">Contratos Ativos</option>
              <option value="suspenso">Contratos Suspensos</option>
              <option value="cancelado">Contratos Cancelados</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="contracts-table-list">
            <thead className="bg-[#171825] text-slate-450 uppercase font-bold text-[10px] border-b border-[#212333]">
              <tr>
                <th className="p-4">Cliente / Contratante</th>
                <th className="p-4">Plano de Serviço</th>
                <th className="p-4 text-right">Valor Nominal</th>
                <th className="p-4">Ciclo de Cobrança</th>
                <th className="p-4 text-right">Impacto MRR</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-center">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e202e] text-slate-350">
              {filteredContracts.map((contract) => {
                const client = clients.find(cl => cl.id === contract.clientId);
                const mrrDiff = calculateMRRContribution(contract.value, contract.billingCycle);
                
                return (
                  <tr key={contract.id} className="hover:bg-[#1a1c2b]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{client ? client.name : '(Sem Cliente)'}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{client ? client.document : 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{contract.planName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Início: {contract.startDate}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-200 font-mono">
                      {formatBRL(contract.value)}
                    </td>
                    <td className="p-4">
                      <span className="capitalize bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded-full font-semibold">
                        {contract.billingCycle}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-indigo-400 font-mono">
                      {contract.status === 'ativo' ? formatBRL(mrrDiff) : formatBRL(0)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                        contract.status === 'ativo' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-850/20' :
                        contract.status === 'suspenso' ? 'bg-amber-950/40 text-amber-400 border-amber-850/20' : 'bg-rose-955/40 text-rose-450 border-rose-850/20'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {contract.status !== 'ativo' && (
                          <button 
                            onClick={() => onUpdateContractStatus(contract.id, 'ativo')}
                            className="px-2.5 py-1 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold rounded transition-colors cursor-pointer"
                            title="Ativar assinatura"
                          >
                            Reativar
                          </button>
                        )}
                        {contract.status === 'ativo' && (
                          <>
                            <button 
                              onClick={() => onUpdateContractStatus(contract.id, 'suspenso')}
                              className="px-2.5 py-1 bg-amber-955/35 hover:bg-amber-955/50 border border-amber-900/40 text-amber-400 text-[10px] font-bold rounded transition-colors cursor-pointer"
                              title="Pausar cobrança"
                            >
                              Suspender
                            </button>
                            <button 
                              onClick={() => onUpdateContractStatus(contract.id, 'cancelado')}
                              className="px-2.5 py-1 bg-rose-955/35 hover:bg-rose-955/50 border border-rose-900/40 text-rose-450 text-[10px] font-bold rounded transition-colors cursor-pointer"
                              title="Rescindir contrato"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            if(confirm('Atenção: Excluir o contrato removerá o registro permanentemente. Deseja continuar?')) {
                              onDeleteContract(contract.id);
                            }
                          }}
                          className="p-1.5 bg-[#181926] hover:bg-rose-950/50 text-slate-400 hover:text-rose-405 border border-[#282a3d]/40 rounded-md transition-all cursor-pointer"
                          title="Remover Contrato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    Nenhum contrato recorrente registrado ou correspondente aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: New Contract Form */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131e] rounded-xl shadow-2xl border border-[#2b2d41] max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-[#212333] bg-[#171825]">
              <h3 className="font-bold text-white text-sm">Vincular Novo Plano de Assinatura (Recorrência)</h3>
              <button onClick={() => setIsOpenForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitContract} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-950/45 border border-rose-900/50 text-rose-350 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Selecione o Cliente / Destinatário *</label>
                <select 
                  value={formClientId}
                  onChange={e => setFormClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 text-xs cursor-pointer"
                >
                  {activeClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.document})</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500">Clientes marcados como inativos não constam nesta lista.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Nome do Plano / Serviço Recorrente *</label>
                <input 
                  type="text" 
                  value={formPlanName}
                  onChange={e => setFormPlanName(e.target.value)}
                  placeholder="Ex: Mensalidade Inglês Kids Básico"
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-550 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Valor Contratual (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="Ex: 450.00"
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-205 focus:outline-hidden focus:border-indigo-500 text-xs font-semibold font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Ciclo de Renovação *</label>
                  <select 
                    value={formCycle}
                    onChange={e => setFormCycle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Data de Vigência / Início *</label>
                <input 
                  type="date" 
                  value={formStartDate}
                  onChange={e => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-400 focus:outline-hidden focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="pt-4 border-t border-[#212333] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2 bg-[#1c1d2e] hover:bg-[#25263d] text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Vincular Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
