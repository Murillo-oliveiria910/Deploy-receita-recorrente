export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  planName: string;
  value: number; // Recurring monthly value (MRR contribution)
  billingCycle: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  status: 'ativo' | 'suspenso' | 'cancelado';
  startDate: string;
}

export type OneOffCategory = 'uniforme' | 'material' | 'taxa' | 'prova_substitutiva' | 'outro';

export interface OneOffCharge {
  id: string;
  clientId: string;
  description: string; // e.g., "Uniforme de Verão", "Material Escolar 1º Bimestre"
  value: number;
  category: OneOffCategory;
  dueDate: string;
  status: 'pago' | 'pendente' | 'atrasado';
  paidAt?: string;
}

export interface DashboardStats {
  mrr: number; // Receita Recorrente Mensal (exclusively sum of active contracts)
  extraRevenue: number; // Total received/pending extra items
  consolidatedRevenue: number; // Total combined billing (MRR + Extras paid/pending logic or completed)
  activeClientsCount: number;
  totalClientsCount: number;
  mrrByCycle: Record<string, number>;
  extraByCategory: Record<OneOffCategory, number>;
}
