export type Job = {
  id: string;
  clientId: string;
  appliance: string;
  brand: string;
  description: string;
  status: string;
  stage: string;
  stageOrder: number;
  amount: number;
  outstanding: number;
  tech: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  createdDate: string;
  rating: number | null;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  leadSource: string;
  kind: string;
  since: string;
  lifetimeValue: number;
  outstanding: number;
  stage: string;
  stageOrder: number;
  jobCount: number;
  jobs: Job[];
  tags: string[];
};

export type Task = {
  id: string;
  type: 'balance' | 'review' | 'schedule' | 'winback';
  clientId: string;
  clientName: string;
  title: string;
  sub: string;
  amount?: number;
  due: string;
};

export type Kpis = {
  revenue: number;
  outstanding: number;
  openJobs: number;
  completed: number;
  clients: number;
  jobs: number;
  avgTicket: number;
  leadSources: [string, number][];
  reviewsPending: number;
};

export type Seed = {
  clients: Client[];
  jobs: Job[];
  tasks: Task[];
  kpis: Kpis;
};
