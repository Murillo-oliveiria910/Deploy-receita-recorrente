import { Client, Contract, OneOffCharge } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Ana Júlia de Souza',
    email: 'ana.julia@email.com',
    phone: '(11) 98765-4321',
    document: '423.854.128-10',
    status: 'ativo',
    createdAt: '2025-01-10'
  },
  {
    id: 'cli-2',
    name: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(21) 97123-5678',
    document: '129.432.876-02',
    status: 'ativo',
    createdAt: '2025-02-15'
  },
  {
    id: 'cli-3',
    name: 'Beatriz Vasconcelos',
    email: 'beatriz.v@email.com',
    phone: '(31) 98877-6655',
    document: '381.902.543-99',
    status: 'ativo',
    createdAt: '2025-03-01'
  },
  {
    id: 'cli-4',
    name: 'Rodrigo Antunes Prado',
    email: 'rodrigo.prado@email.com',
    phone: '(19) 99234-1122',
    document: '293.401.832-45',
    status: 'inativo',
    createdAt: '2024-05-20'
  },
  {
    id: 'cli-5',
    name: 'Mariana Costa Ferreira',
    email: 'mariana.ferreira@email.com',
    phone: '(11) 96102-3948',
    document: '511.233.948-07',
    status: 'ativo',
    createdAt: '2025-05-12'
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'con-1',
    clientId: 'cli-1',
    planName: 'Mensalidade Escolar Ensino Médio',
    value: 1250.00,
    billingCycle: 'mensal',
    status: 'ativo',
    startDate: '2025-01-15'
  },
  {
    id: 'con-2',
    clientId: 'cli-2',
    planName: 'Curso de Inglês Integral',
    value: 450.00,
    billingCycle: 'mensal',
    status: 'ativo',
    startDate: '2025-02-20'
  },
  {
    id: 'con-3',
    clientId: 'cli-3',
    planName: 'Plano Anual Preparatório ENEM',
    value: 850.00,
    billingCycle: 'anual',
    status: 'ativo',
    startDate: '2025-03-05'
  },
  {
    id: 'con-4',
    clientId: 'cli-4',
    planName: 'Curso Preparatório de Artes',
    value: 390.00,
    billingCycle: 'mensal',
    status: 'cancelado',
    startDate: '2024-06-01'
  },
  {
    id: 'con-5',
    clientId: 'cli-5',
    planName: 'Natação e Esportes Premium',
    value: 320.00,
    billingCycle: 'mensal',
    status: 'ativo',
    startDate: '2025-05-15'
  }
];

export const INITIAL_ONEOFF_CHARGES: OneOffCharge[] = [
  {
    id: 'chg-1',
    clientId: 'cli-1',
    description: 'Kit de Uniforme Escolar Completo',
    value: 380.00,
    category: 'uniforme',
    dueDate: '2026-06-15',
    status: 'pendente'
  },
  {
    id: 'chg-2',
    clientId: 'cli-1',
    description: 'Mochila e Material Didático Anual',
    value: 650.00,
    category: 'material',
    dueDate: '2026-01-10',
    status: 'pago',
    paidAt: '2026-01-08'
  },
  {
    id: 'chg-3',
    clientId: 'cli-2',
    description: 'Taxa de Matrícula Computação',
    value: 120.00,
    category: 'taxa',
    dueDate: '2026-02-25',
    status: 'pago',
    paidAt: '2026-02-25'
  },
  {
    id: 'chg-4',
    clientId: 'cli-3',
    description: 'Prova Substitutiva - Matemática Financeira',
    value: 75.00,
    category: 'prova_substitutiva',
    dueDate: '2026-06-05',
    status: 'atrasado'
  },
  {
    id: 'chg-5',
    clientId: 'cli-5',
    description: 'Exame Médico Piscina (Taxa Extra)',
    value: 50.00,
    category: 'taxa',
    dueDate: '2026-05-20',
    status: 'pago',
    paidAt: '2026-05-18'
  },
  {
    id: 'chg-6',
    clientId: 'cli-2',
    description: 'Camiseta de Educação Física Extra',
    value: 85.00,
    category: 'uniforme',
    dueDate: '2026-06-20',
    status: 'pendente'
  },
  {
    id: 'chg-7',
    clientId: 'cli-3',
    description: 'Apostila Extra de Exercícios Avançados',
    value: 110.00,
    category: 'material',
    dueDate: '2026-06-01',
    status: 'pago',
    paidAt: '2026-05-30'
  }
];

// LocalStorage helpers
export const loadStorage = () => {
  try {
    const clients = localStorage.getItem('mrr_admin_clients');
    const contracts = localStorage.getItem('mrr_admin_contracts');
    const charges = localStorage.getItem('mrr_admin_charges');

    return {
      clients: clients ? JSON.parse(clients) : INITIAL_CLIENTS,
      contracts: contracts ? JSON.parse(contracts) : INITIAL_CONTRACTS,
      charges: charges ? JSON.parse(charges) : INITIAL_ONEOFF_CHARGES
    };
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return {
      clients: INITIAL_CLIENTS,
      contracts: INITIAL_CONTRACTS,
      charges: INITIAL_ONEOFF_CHARGES
    };
  }
};

export const saveStorage = (clients: Client[], contracts: Contract[], charges: OneOffCharge[]) => {
  try {
    localStorage.setItem('mrr_admin_clients', JSON.stringify(clients));
    localStorage.setItem('mrr_admin_contracts', JSON.stringify(contracts));
    localStorage.setItem('mrr_admin_charges', JSON.stringify(charges));
  } catch (e) {
    console.error('Erro ao salvar no localStorage', e);
  }
};
