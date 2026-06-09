import React, { useState } from 'react';
import { Client, Contract, OneOffCharge, OneOffCategory } from '../types';
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  FileText, 
  DollarSign, 
  Calendar,
  X,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ClientManagementProps {
  clients: Client[];
  contracts: Contract[];
  charges: OneOffCharge[];
  onAddClient: (newClient: Omit<Client, 'id' | 'createdAt'>) => void;
  onEditClient: (updatedClient: Client) => void;
  onDeleteClient: (id: string) => void;
  onAddCharge: (newCharge: Omit<OneOffCharge, 'id'>) => void;
  onPayCharge: (id: string) => void;
}

export default function ClientManagement({ 
  clients, 
  contracts, 
  charges, 
  onAddClient, 
  onEditClient, 
  onDeleteClient,
  onAddCharge,
  onPayCharge
}: ClientManagementProps) {
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modals / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDocument, setFormDocument] = useState('');
  const [formStatus, setFormStatus] = useState<'ativo' | 'inativo'>('ativo');

  // Quick One-off charge form for selected client
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeValue, setChargeValue] = useState('');
  const [chargeCategory, setChargeCategory] = useState<OneOffCategory>('material');
  const [chargeDueDate, setChargeDueDate] = useState('');

  // Form errors
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.document.includes(searchTerm) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClientFinancialStats = (clientId: string) => {
    // Active contracts values
    const clientContracts = contracts.filter(c => c.clientId === clientId && c.status === 'ativo');
    const recurringValue = clientContracts.reduce((sum, c) => sum + c.value, 0);

    // One-off charges
    const clientCharges = charges.filter(c => c.clientId === clientId);
    const totalExtra = clientCharges.reduce((sum, c) => sum + c.value, 0);
    const paidExtra = clientCharges.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.value, 0);
    const pendingExtra = clientCharges.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.value, 0);
    const overdueExtra = clientCharges.filter(c => c.status === 'atrasado').reduce((sum, c) => sum + c.value, 0);

    return {
      recurringValue,
      totalExtra,
      paidExtra,
      pendingExtra,
      overdueExtra,
      totalCount: clientCharges.length,
      paidCount: clientCharges.filter(c => c.status === 'pago').length,
    };
  };

  const handleOpenNewClient = () => {
    setFormId('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDocument('');
    setFormStatus('ativo');
    setIsEditing(false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEditClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting client for timeline details
    setFormId(client.id);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormDocument(client.document);
    setFormStatus(client.status);
    setIsEditing(true);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formDocument.trim()) {
      setFormError('Por favor preencha os campos obrigatórios (Nome, E-mail e CPF/CNPJ).');
      return;
    }

    if (isEditing) {
      onEditClient({
        id: formId,
        name: formName,
        email: formEmail,
        phone: formPhone,
        document: formDocument,
        status: formStatus,
        createdAt: clients.find(c => c.id === formId)?.createdAt || new Date().toISOString().split('T')[0]
      });
    } else {
      onAddClient({
        name: formName,
        email: formEmail,
        phone: formPhone,
        document: formDocument,
        status: formStatus
      });
    }

    setIsFormOpen(false);
    // Clear state
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDocument('');
  };

  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!chargeDesc.trim() || !chargeValue || parseFloat(chargeValue) <= 0 || !chargeDueDate) {
      alert('Preencha todos os campos do lançamento corretamente (Valor deve ser maior que R$ 0,00).');
      return;
    }

    onAddCharge({
      clientId: selectedClient.id,
      description: chargeDesc,
      value: parseFloat(chargeValue),
      category: chargeCategory,
      dueDate: chargeDueDate,
      status: 'pendente'
    });

    setIsChargeFormOpen(false);
    setChargeDesc('');
    setChargeValue('');
    setChargeDueDate('');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };  return (
    <div className="space-y-6 animate-fade-in" id="clients-management-section">
      {/* Header with quick filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cadastro e Histórico de Clientes</h1>
          <p className="text-slate-450 text-sm mt-1">
            Controle de dados, receitas recorrentes por mensalidade e histórico contábil unificado.
          </p>
        </div>
        <button 
          onClick={handleOpenNewClient}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          id="btn-add-client-dialog"
        >
          <UserPlus className="w-4 h-4" />
          Novo Registro de Cliente
        </button>
      </div>

      {/* Grid: Left Column (Listing with actions), Right Column (Timeline Detail if selected) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User list - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-4 shadow-xl space-y-4">
            
            {/* Search filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, documento ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200 placeholder-slate-500"
                  id="client-search-input"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-[#1a1b2a] border border-[#2d2f44] rounded-lg text-sm text-slate-300 focus:outline-hidden cursor-pointer"
                  id="client-status-filter"
                >
                  <option value="all">Todas as Situações</option>
                  <option value="ativo">Situação: Ativo</option>
                  <option value="inativo">Situação: Inativo</option>
                </select>
              </div>
            </div>

            {/* Clients Table / Cards List */}
            <div className="divide-y divide-[#1e202e] max-h-[500px] overflow-y-auto pr-1">
              {filteredClients.map((client) => {
                const stats = getClientFinancialStats(client.id);
                const isCurrent = selectedClient?.id === client.id;
                
                return (
                  <div 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg cursor-pointer transition-colors border gap-3 ${
                      isCurrent 
                        ? 'bg-indigo-950/25 border-indigo-900/60 shadow-inner' 
                        : 'hover:bg-[#1a1c2b]/50 border-transparent'
                    }`}
                    id={`client-item-${client.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{client.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          client.status === 'ativo' 
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/30' 
                            : 'bg-slate-900 text-slate-450 border-slate-800/80'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-sans">
                        <span className="font-mono text-[11px] text-slate-450">CPF: {client.document}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" />{client.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1d1f2e]">
                      {/* Total financial metrics summary */}
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Recorrente/Mês</div>
                        <div className="text-sm font-extrabold text-[#f1f5f9] font-mono">{formatBRL(stats.recurringValue)}</div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleOpenEditClient(client, e)}
                          title="Editar Cadastro"
                          className="p-1.5 bg-[#181926] hover:bg-indigo-950/50 text-slate-400 hover:text-indigo-405 border border-[#282a3d]/40 rounded-md transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm(`Tem certeza de que deseja excluir o cliente ${client.name}?`)) {
                              onDeleteClient(client.id);
                              if (selectedClient?.id === client.id) setSelectedClient(null);
                            }
                          }}
                          title="Remover Cadastro"
                          className="p-1.5 bg-[#181926] hover:bg-rose-950/50 text-slate-400 hover:text-rose-405 border border-[#282a3d]/40 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedClient(client)}
                          title="Ver Histórico Completo"
                          className="p-1.5 bg-[#181926] text-slate-400 hover:bg-[#202235] border border-[#282a3d]/40 rounded-md sm:flex hidden cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Nenhum cliente atende aos critérios de pesquisa informados.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Selected Client financial history - 5 Cols */}
        <div className="lg:col-span-5">
          {selectedClient ? (
            <div className="bg-[#12131e] rounded-xl border border-[#212333]/90 p-5 shadow-xl space-y-6" id="client-financial-timeline-view">
              
              {/* Timeline Header */}
              <div className="flex items-start justify-between border-b border-[#212333] pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase font-mono">Ficha Cadastral & Contábil</span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedClient.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {selectedClient.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Individual Contacts details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#1a1b2a] p-3 rounded-lg border border-[#222435]">
                <div>
                  <span className="text-slate-500 block pb-0.5">E-mail:</span>
                  <span className="font-semibold text-slate-350 truncate block">{selectedClient.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block pb-0.5">Telefone:</span>
                  <span className="font-semibold text-slate-350 block">{selectedClient.phone || '(Não informado)'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#23253b]/50">
                  <span className="text-slate-500 block pb-0.5">Data de Filiação:</span>
                  <span className="font-semibold text-slate-400 block font-mono">{selectedClient.createdAt}</span>
                </div>
              </div>

              {/* Account Balances summary */}
              {(() => {
                const stats = getClientFinancialStats(selectedClient.id);
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Métricas Individuais</h4>
                      <button 
                        onClick={() => setIsChargeFormOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        id="btn-register-extra-for-client"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Lançar Extra
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-2.5">
                        <span className="text-[9px] text-indigo-400 font-semibold uppercase block">Recorrente Ativo</span>
                        <span className="text-xs font-extrabold text-white block mt-0.5 font-mono">{formatBRL(stats.recurringValue)}</span>
                      </div>
                      <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-2.5">
                        <span className="text-[9px] text-emerald-400 font-semibold uppercase block">Extras Pagos</span>
                        <span className="text-xs font-extrabold text-emerald-355 block mt-0.5 font-mono">{formatBRL(stats.paidExtra)}</span>
                      </div>
                      <div className="bg-rose-950/30 border border-rose-900/45 rounded-lg p-2.5">
                        <span className="text-[9px] text-rose-450 font-semibold uppercase block">Extras Devidos</span>
                        <span className="text-xs font-extrabold text-rose-400 block mt-0.5 font-mono">{formatBRL(stats.pendingExtra + stats.overdueExtra)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Associated Contracts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide">Plano Recorrente Comercial</h4>
                {contracts.filter(c => c.clientId === selectedClient.id).length > 0 ? (
                  <div className="space-y-2">
                    {contracts.filter(c => c.clientId === selectedClient.id).map(contract => (
                      <div key={contract.id} className="p-3 bg-[#1a1b2a] border border-[#222435] rounded-lg text-xs flex justify-between items-center animate-fade-in">
                        <div>
                          <div className="font-semibold text-slate-200">{contract.planName}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex gap-2">
                            <span className="capitalize">Tipo: {contract.billingCycle}</span>
                            <span>•</span>
                            <span className="font-mono">Início: {contract.startDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-white block font-mono">{formatBRL(contract.value)}</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase mt-1 border ${
                            contract.status === 'ativo' 
                              ? 'bg-indigo-950/50 text-indigo-405 border-indigo-850/40' 
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-[#1a1b2a]/50 rounded-lg border border-[#222435] text-slate-500 text-xs">
                    Nenhum contrato recorrente registrado para este cliente.
                  </div>
                )}
              </div>

              {/* One-off Charges Log (Histórico Financeiro Extras) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide">Lançamentos de Receitas Extras / Avulsas</h4>
                {charges.filter(c => c.clientId === selectedClient.id).length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {charges.filter(c => c.clientId === selectedClient.id).map(charge => (
                      <div key={charge.id} className="p-3 bg-[#1a1b2a] border border-[#222435] rounded-lg hover:border-[#2f3148] transition-all text-xs flex flex-col gap-1.5 animate-fade-in">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-slate-200">{charge.description}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            charge.status === 'pago' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-850/20' :
                            charge.status === 'atrasado' ? 'bg-rose-950/40 text-rose-405 border-rose-850/20' : 'bg-amber-950/40 text-amber-400 border-amber-800/10'
                          }`}>
                            {charge.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-slate-400 mt-1">
                          <span className="text-[10px]">Categoria: <strong className="font-semibold text-slate-300 capitalize">{charge.category}</strong></span>
                          <span className="font-extrabold text-white font-mono">{formatBRL(charge.value)}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 border-t border-[#23253a]/40 pt-1.5">
                          <span className="font-mono">Vecto: {charge.dueDate}</span>
                          {charge.status !== 'pago' ? (
                            <button 
                              onClick={() => onPayCharge(charge.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-900/60 hover:bg-emerald-950/30 px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              Dar Baixa (Pagar)
                            </button>
                          ) : (
                            <span className="text-emerald-450 text-[10px] font-semibold font-mono">Pago em: {charge.paidAt || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-[#1a1b2a]/50 rounded-lg border border-[#222435] text-slate-500 text-xs">
                    Nenhuma cobrança avulsa foi lançada para este cliente.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-[#12131e]/50 rounded-xl border-2 border-dashed border-[#222436] p-8 text-center h-[350px] flex flex-col justify-center items-center">
              <Eye className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="font-semibold text-slate-400 text-sm">Nenhum Cliente Selecionado</h3>
              <p className="text-slate-500 text-xs max-w-sm mt-1 leading-relaxed">
                Clique sobre qualquer registro na tabela ao lado para inspecionar os contratos de recorrência, lançar novas cobranças e fazer a auditoria do histórico financeiro completo.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Client Register / Edit form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131e] rounded-xl shadow-2xl border border-[#2b2d41] max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-[#212333] bg-[#171825]">
              <h3 className="font-bold text-white">{isEditing ? 'Editar Cadastro do Cliente' : 'Novo Cadastro de Cliente'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitClient} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-950/45 border border-rose-900/50 text-rose-350 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Nome Completo do Cliente *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Ana Júlia de Souza"
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg font-medium text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">E-mail de Contato *</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="Ex: ana@exemplo.com"
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">CPF ou CNPJ *</label>
                  <input 
                    type="text" 
                    value={formDocument}
                    onChange={e => setFormDocument(e.target.value)}
                    placeholder="Somente números ou formatado"
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Situação Comercial</label>
                <select 
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs cursor-pointer"
                >
                  <option value="ativo">Ativo (Permitir contratos e lançamentos)</option>
                  <option value="inativo">Inativo (Bloquear novas cobranças recorrentes)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#212333] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-[#1c1d2e] hover:bg-[#25263d] text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-lg font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register raw extra charge */}
      {isChargeFormOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131e] rounded-xl shadow-2xl border border-[#2b2d41] max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-[#212333] bg-[#171825]">
              <div>
                <h3 className="font-bold text-white">Lançar Cobrança Avulsa</h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Cliente: {selectedClient.name}</span>
              </div>
              <button onClick={() => setIsChargeFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCharge} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Descrição do Item *</label>
                <input 
                  type="text" 
                  value={chargeDesc}
                  onChange={e => setChargeDesc(e.target.value)}
                  placeholder="Ex: Prova Substitutiva de Química"
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
                    value={chargeValue}
                    onChange={e => setChargeValue(e.target.value)}
                    placeholder="Ex: 75.00"
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Data de Vencimento *</label>
                  <input 
                    type="date" 
                    value={chargeDueDate}
                    onChange={e => setChargeDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Categoria do Extra</label>
                <select 
                  value={chargeCategory}
                  onChange={e => setChargeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1a1b2a]/80 border border-[#2a2c3f] rounded-lg text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs cursor-pointer"
                >
                  <option value="uniforme">Uniforme Escolar</option>
                  <option value="material">Material Didático / Apostilas</option>
                  <option value="taxa">Taxas Administrativas / Matrícula</option>
                  <option value="prova_substitutiva">Provas Substitutivas</option>
                  <option value="outro">Outros Extras Faturamento</option>
                </select>
              </div>

              <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/50 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                Este valor será faturado de forma isolada e constará na listagem de receitas extras, de modo que <strong>não surtirá efeito sobre as métricas contratuais de receita recorrente (MRR)</strong>.
              </div>

              <div className="pt-4 border-t border-[#212333] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsChargeFormOpen(false)}
                  className="px-4 py-2 bg-[#1c1d2e] hover:bg-[#25263d] text-slate-350 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Lançar Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
