import React, { useState } from 'react';
import { Client, OneOffCharge, OneOffCategory } from '../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Shirt, 
  BookOpen, 
  Percent, 
  FileText,
  BookmarkPlus
} from 'lucide-react';

interface OneOffChargeManagementProps {
  clients: Client[];
  charges: OneOffCharge[];
  onAddCharge: (newCharge: Omit<OneOffCharge, 'id'>) => void;
  onPayCharge: (id: string) => void;
  onDeleteCharge: (id: string) => void;
}

export default function OneOffChargeManagement({ 
  clients, 
  charges, 
  onAddCharge, 
  onPayCharge, 
  onDeleteCharge 
}: OneOffChargeManagementProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | OneOffCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pago' | 'pendente' | 'atrasado'>('all');

  // Modal Register Charge state
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [formClientId, setFormClientId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formCategory, setFormCategory] = useState<OneOffCategory>('material');
  const [formDueDate, setFormDueDate] = useState('');
  const [formError, setFormError] = useState('');

  // Labels and styling classes
  const categoryLabels: Record<OneOffCategory, string> = {
    uniforme: 'Uniforme Escolar',
    material: 'Material / Livros',
    taxa: 'Taxas Administrativas',
    prova_substitutiva: 'Prova Substitutiva',
    outro: 'Outros Extras'
  };

  const categoryBadges: Record<OneOffCategory, string> = {
    uniforme: 'bg-amber-950/40 text-amber-400 border border-amber-930/20 text-[10px] font-semibold',
    material: 'bg-emerald-950/40 text-emerald-400 border border-emerald-930/20 text-[10px] font-semibold',
    taxa: 'bg-blue-950/40 text-blue-400 border border-blue-930/20 text-[10px] font-semibold',
    prova_substitutiva: 'bg-purple-950/40 text-purple-405 border border-purple-930/20 text-[10px] font-semibold',
    outro: 'bg-[#1a1c2d] text-slate-400 border border-slate-800/20 text-[10px] font-semibold'
  };

  // Totals calculations
  const totalExtra = charges.reduce((sum, c) => sum + c.value, 0);
  const paidExtra = charges.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.value, 0);
  const pendingExtra = charges.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.value, 0);
  const overdueExtra = charges.filter(c => c.status === 'atrasado').reduce((sum, c) => sum + c.value, 0);

  // Filter charges list
  const filteredCharges = charges.filter(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    const clientName = client ? client.name.toLowerCase() : '';
    const desc = c.description.toLowerCase();

    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || 
                          desc.includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' ? true : c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenForm = () => {
    if (clients.length === 0) {
      alert('Você precisa ter pelo menos um cliente cadastrado no sistema para emitir uma cobrança avulsa.');
      return;
    }
    setFormClientId(clients[0].id);
    setFormDesc('');
    setFormValue('');
    setFormCategory('material');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsOpenForm(true);
  };

  const handleSubmitCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || !formValue || parseFloat(formValue) <= 0 || !formDueDate || !formClientId) {
      setFormError('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onAddCharge({
      clientId: formClientId,
      description: formDesc,
      value: parseFloat(formValue),
      category: formCategory,
      dueDate: formDueDate,
      status: 'pendente'
    });

    setIsOpenForm(false);
    setFormDesc('');
    setFormValue('');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="oneoff-charges-management">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cobranças e Receitas Avulsas (Extras)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Controle de tarifas adicionais para fardamentos, materiais pedagógicos, avaliações extraordinárias e outros itens acessórios.
          </p>
        </div>
        <button 
          onClick={handleOpenForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          id="btn-add-charge-dialog-main"
        >
          <Plus className="w-4 h-4" />
          Lançar Cobrança Avulsa
        </button>
      </div>

      {/* Accounting Isolations Explanatory Badge */}
      <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-slate-300 text-xs flex gap-2.5 items-start">
        <BookmarkPlus className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-200">Controle Contábil Estrito de Receita Acessória:</span>
          <p className="leading-relaxed mt-0.5 text-slate-400">
            Itens extras lançados aqui compõem a receita operacional secundária mas <strong>não são agregados à Receita Recorrente (MRR)</strong>, 
            garantindo relatórios comerciais cristalinos quanto ao faturamento essencialmente contratual.
          </p>
        </div>
      </div>

      {/* Small quick stats horizontal banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12131e] border border-[#212333]/90 p-4 rounded-xl flex flex-col shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Volume Bruto Lançado</span>
          <span className="text-lg font-extrabold text-white mt-1 font-mono">{formatBRL(totalExtra)}</span>
        </div>
        <div className="bg-[#12131e] border border-[#212333]/90 p-4 rounded-xl flex flex-col shadow-xs border-l-3 border-l-emerald-600">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Valores Liquidados</span>
          <span className="text-lg font-extrabold text-emerald-400 mt-1 font-mono">{formatBRL(paidExtra)}</span>
        </div>
        <div className="bg-[#12131e] border border-[#212333]/90 p-4 rounded-xl flex flex-col shadow-xs border-l-3 border-l-amber-600">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Valores em Aberto</span>
          <span className="text-lg font-extrabold text-amber-400 mt-1 font-mono">{formatBRL(pendingExtra)}</span>
        </div>
        <div className="bg-[#12131e] border border-[#212333]/90 p-4 rounded-xl flex flex-col shadow-xs border-l-3 border-l-rose-600">
          <span className="text-[10px] font-bold text-rose-450 uppercase font-sans">Valores em Atraso</span>
          <span className="text-lg font-extrabold text-rose-455 mt-1 font-mono">{formatBRL(overdueExtra)}</span>
        </div>
      </div>

      {/* Grid List and Advanced Filters */}
      <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 shadow-xl overflow-hidden">
        
        {/* Advanced Filters block */}
        <div className="p-4 border-b border-[#212333] bg-[#1a1b2a]/40 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm focus:outline-hidden text-slate-200 placeholder-slate-500 animate-slide-in"
              id="extra-charges-search"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm text-slate-300 focus:outline-hidden cursor-pointer"
              id="extra-charges-category-filter"
            >
              <option value="all">Todas as Categorias</option>
              <option value="uniforme">Apenas Uniforme Escolar</option>
              <option value="material">Apenas Material / Livros</option>
              <option value="taxa">Apenas Taxas Administrativas</option>
              <option value="prova_substitutiva">Apenas Provas Substitutivas</option>
              <option value="outro">Apenas Outros Extras</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm text-slate-300 focus:outline-hidden cursor-pointer"
              id="extra-charges-status-filter"
            >
              <option value="all">Todas as Situações</option>
              <option value="pago">Apenas Liquidados (Pago)</option>
              <option value="pendente">Apenas Pendentes (A vencer)</option>
              <option value="atrasado">Apenas Atrasados (Inadimplente)</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="extra-charges-table-data">
            <thead className="bg-[#171825] text-slate-450 uppercase font-bold text-[10px] border-b border-[#212333]">
              <tr>
                <th className="p-4">Cliente Responsável</th>
                <th className="p-4">Descrição da Despesa</th>
                <th className="p-4">Categoria do Item</th>
                <th className="p-4 text-right">Valor do Item</th>
                <th className="p-4">Data de Vencimento</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e202e] text-slate-350">
              {filteredCharges.map((charge) => {
                const client = clients.find(cl => cl.id === charge.clientId);
                return (
                  <tr key={charge.id} className="hover:bg-[#1a1c2b]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{client ? client.name : '(N/A)'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{client ? client.email : 'N/A'}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {charge.description}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase border ${categoryBadges[charge.category]}`}>
                        {categoryLabels[charge.category]}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-white font-mono">
                      {formatBRL(charge.value)}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {charge.dueDate}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] text-center uppercase max-w-[80px] border ${
                          charge.status === 'pago' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-850/20' :
                          charge.status === 'atrasado' ? 'bg-rose-955/40 text-rose-450 border-rose-850/20' : 'bg-amber-955/40 text-amber-400 border-amber-850/20'
                        }`}>
                          {charge.status}
                        </span>
                        {charge.paidAt && (
                          <span className="text-[9px] text-slate-500 italic mt-0.5">Pago: {charge.paidAt}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {charge.status !== 'pago' ? (
                          <button 
                            onClick={() => onPayCharge(charge.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#152a23] hover:bg-emerald-950/70 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-800/40 transition-colors cursor-pointer"
                            title="Registrar recebimento de fundos"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Pagar
                          </button>
                        ) : (
                          <span className="text-emerald-500 text-[10px] font-extrabold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Quitado
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            if(confirm('Isso removerá esta cobrança avulsa dos históricos de lançamentos. Prosseguir?')) {
                              onDeleteCharge(charge.id);
                            }
                          }}
                          className="p-1.5 bg-[#181926] hover:bg-rose-950/50 text-slate-400 hover:text-rose-405 border border-[#282a3d]/40 rounded-md transition-all cursor-pointer"
                          title="Remover Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCharges.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    Nenhuma cobrança extra localizada no inventário filtrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: Register raw extra charge */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131e] rounded-xl shadow-2xl border border-[#2b2d41] max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-[#212333] bg-[#171825]">
              <h3 className="font-bold text-white text-sm">Lançar Novo Extra Financeiro</h3>
              <button onClick={() => setIsOpenForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCharge} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-950/45 border border-rose-900/50 text-rose-350 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Selecione o Cliente / Responsável *</label>
                <select 
                  value={formClientId}
                  onChange={e => setFormClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 text-xs cursor-pointer focus:border-indigo-500 focus:outline-hidden"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.document})</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500">Permite escolher clientes ativos ou inativos que possuam pendências.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Descrição Detalhada do Extra *</label>
                <input 
                  type="text" 
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Ex: Kit Completo de Apostilas - 2º Semestre"
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Valor Cobrado (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.1"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="Ex: 270.00"
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Vencimento da Fatura *</label>
                  <input 
                    type="date" 
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-[#bfbfbf] focus:outline-hidden focus:border-indigo-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Especifique a Categoria do Extra</label>
                <select 
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 text-xs cursor-pointer focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="uniforme">Uniforme Escolar</option>
                  <option value="material">Material Didático / Apostilas</option>
                  <option value="taxa">Taxas Administrativas / Matrículas</option>
                  <option value="prova_substitutiva">Provas Substitutivas</option>
                  <option value="outro">Outros Extras Faturamento</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#212333] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2 bg-[#1c1d2e] hover:bg-[#25263d] text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Lançar Cobrança Avulsa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
