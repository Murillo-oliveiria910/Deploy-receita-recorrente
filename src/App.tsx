import React, { useState, useEffect } from 'react';
import { Client, Contract, OneOffCharge } from './types';
import { loadStorage, saveStorage } from './initialData';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import ContractManagement from './components/ContractManagement';
import OneOffChargeManagement from './components/OneOffChargeManagement';
import Reports from './components/Reports';

// Icons
import { 
  Building2, 
  BarChart3, 
  Users2, 
  ScrollText, 
  HandCoins, 
  PieChart, 
  LogOut,
  User,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Business States
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<OneOffCharge[]>([]);

  // Initialize and load persistent data
  useEffect(() => {
    const data = loadStorage();
    setClients(data.clients);
    setContracts(data.contracts);
    setCharges(data.charges);
  }, []);

  // Save changes to storage whenever states change
  useEffect(() => {
    if (clients.length > 0) {
      saveStorage(clients, contracts, charges);
    }
  }, [clients, contracts, charges]);

  // Client Actions
  const handleAddClient = (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    const freshClient: Client = {
      ...newClient,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [freshClient, ...prev]);
  };

  const handleEditClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Optionally clean up or orphan their items. We will keep contracts for auditing but set them inativos.
    setContracts(prev => prev.map(c => c.clientId === id ? { ...c, status: 'cancelado' } : c));
  };

  // Contract Actions
  const handleAddContract = (newContract: Omit<Contract, 'id'>) => {
    const freshContract: Contract = {
      ...newContract,
      id: `con-${Date.now()}`
    };
    setContracts(prev => [freshContract, ...prev]);
  };

  const handleUpdateContractStatus = (id: string, status: 'ativo' | 'suspenso' | 'cancelado') => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDeleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  // One-off Extras Actions
  const handleAddCharge = (newCharge: Omit<OneOffCharge, 'id'>) => {
    const freshCharge: OneOffCharge = {
      ...newCharge,
      id: `chg-${Date.now()}`
    };
    setCharges(prev => [freshCharge, ...prev]);
  };

  const handlePayCharge = (id: string) => {
    setCharges(prev => prev.map(chg => {
      if (chg.id === id) {
        return {
          ...chg,
          status: 'pago',
          paidAt: new Date().toISOString().split('T')[0]
        };
      }
      return chg;
    }));
  };

  const handleDeleteCharge = (id: string) => {
    setCharges(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] flex flex-col font-sans antialiased" id="app-root-frame">
      
      {/* Top primary dashboard header bar */}
      <header className="bg-[#0c0d14] text-white border-b border-[#1c1e2b] backdrop-blur-md sticky top-0 z-30" id="global-navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <Building2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">Faturam</span>
                <span className="text-[10px] text-indigo-400/80 font-semibold tracking-wider -mt-1 block uppercase font-mono">Gestor Financeiro</span>
              </div>
            </div>

            {/* Quick Context information about active user email */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 bg-[#121422] px-3 py-1.5 rounded-lg border border-[#22253b]">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-medium truncate max-w-[180px]">renatomendesmiranda29@gmail.com</span>
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                SISTEMA OPERACIONAL
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Floating or structural visual panel inside main canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-[#0c0d14] rounded-xl border border-[#1b1c28] p-1.5 shadow-xl flex items-center overflow-x-auto gap-1" id="tab-navigation-bar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-[#151724]'
            }`}
            id="tab-btn-dashboard"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard Geral
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
              activeTab === 'clientes' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-[#151724]'
            }`}
            id="tab-btn-clientes"
          >
            <Users2 className="w-4 h-4" />
            Controle de Clientes
          </button>

          <button
            onClick={() => setActiveTab('contratos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
              activeTab === 'contratos' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-[#151724]'
            }`}
            id="tab-btn-contratos"
          >
            <ScrollText className="w-4 h-4" />
            Planos & Contratos Recorrentes (MRR)
          </button>

          <button
            onClick={() => setActiveTab('cobranças')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
              activeTab === 'cobranças' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-[#151724]'
            }`}
            id="tab-btn-cobranças"
          >
            <HandCoins className="w-4 h-4" />
            Lançamentos Extras (Avulsos)
          </button>

          <button
            onClick={() => setActiveTab('relatórios')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 ${
              activeTab === 'relatórios' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-[#151724]'
            }`}
            id="tab-btn-relatorios"
          >
            <PieChart className="w-4 h-4" />
            Relatórios e Auditoria
          </button>
        </div>

        {/* Tab contents switcher */}
        <div className="min-h-[500px]" id="rendered-content-stage">
          {activeTab === 'dashboard' && (
            <Dashboard 
              clients={clients} 
              contracts={contracts} 
              charges={charges} 
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientManagement 
              clients={clients} 
              contracts={contracts} 
              charges={charges} 
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onAddCharge={handleAddCharge}
              onPayCharge={handlePayCharge}
            />
          )}

          {activeTab === 'contratos' && (
            <ContractManagement 
              clients={clients} 
              contracts={contracts} 
              onAddContract={handleAddContract}
              onUpdateContractStatus={handleUpdateContractStatus}
              onDeleteContract={handleDeleteContract}
            />
          )}

          {activeTab === 'cobranças' && (
            <OneOffChargeManagement 
              clients={clients} 
              charges={charges} 
              onAddCharge={handleAddCharge}
              onPayCharge={handlePayCharge}
              onDeleteCharge={handleDeleteCharge}
            />
          )}

          {activeTab === 'relatórios' && (
            <Reports 
              clients={clients} 
              contracts={contracts} 
              charges={charges}
            />
          )}
        </div>

      </main>

      {/* Footer information */}
      <footer className="bg-[#0b0c12] border-t border-[#1a1c29] py-8 mt-12 text-slate-500 text-xs text-center font-sans" id="global-application-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            Faturam S.A. — Gestor Comercial e Administrativo de Faturamentos de Empresa
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Desenvolvido sob rígidas normas contábeis de segregação de receita recorrente contratual (MRR) de faturamentos avulsos acessórios.<br />
            Armazenamento em cache ativo e persistido com segurança no navegador.
          </p>
        </div>
      </footer>

    </div>
  );
}
