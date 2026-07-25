import { filterClients, sortByPriority, groupTasks, clientsByStage, computeKpis, revenueByMonth } from '../selectors';
import { Client, Job, Task } from '../types';
import seed from '../data/seed.json';
import { Seed } from '../types';

const mk = (over: Partial<Client>): Client => ({
  id: 'c1', firstName: 'A', lastName: 'B', name: 'Alice Brown', phone: '', email: '',
  street: '', city: 'Tampa', state: 'FL', zip: '', leadSource: '', kind: 'homeowner',
  since: '', lifetimeValue: 0, outstanding: 0, stage: 'Completed', stageOrder: 3,
  jobCount: 1, jobs: [], tags: ['Bosch', 'Dishwasher'], ...over,
});

const clients: Client[] = [
  mk({ id: 'c1', name: 'Alice Brown', city: 'Tampa', stage: 'Completed', outstanding: 0, lifetimeValue: 500 }),
  mk({ id: 'c2', name: 'Bob Smith', city: 'Miami', stage: 'Scheduled', outstanding: 200, lifetimeValue: 200, tags: ['LG', 'Dryer'] }),
  mk({ id: 'c3', name: 'Carol White', city: 'Tampa', stage: 'Completed', outstanding: 900, lifetimeValue: 900 }),
];

describe('filterClients', () => {
  it('returns all when filter is All and query empty', () => {
    expect(filterClients(clients, 'All', '')).toHaveLength(3);
  });
  it('filters by pipeline stage', () => {
    expect(filterClients(clients, 'Scheduled', '').map((c) => c.id)).toEqual(['c2']);
  });
  it('matches query against name', () => {
    expect(filterClients(clients, 'All', 'carol').map((c) => c.id)).toEqual(['c3']);
  });
  it('matches query against city (case-insensitive)', () => {
    expect(filterClients(clients, 'All', 'TAMPA').map((c) => c.id).sort()).toEqual(['c1', 'c3']);
  });
  it('matches query against tags', () => {
    expect(filterClients(clients, 'All', 'dryer').map((c) => c.id)).toEqual(['c2']);
  });
  it('combines stage filter and query', () => {
    expect(filterClients(clients, 'Completed', 'tampa')).toHaveLength(2);
  });
});

describe('sortByPriority', () => {
  it('orders by outstanding first, then lifetime value', () => {
    expect(sortByPriority(clients).map((c) => c.id)).toEqual(['c3', 'c2', 'c1']);
  });
  it('does not mutate the input array', () => {
    const input = [...clients];
    sortByPriority(input);
    expect(input.map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
  });
});

describe('clientsByStage', () => {
  it('returns only clients in the given column', () => {
    expect(clientsByStage(clients, 'Completed').map((c) => c.id)).toEqual(['c1', 'c3']);
  });
  it('returns empty for a stage with no clients', () => {
    expect(clientsByStage(clients, 'New Lead')).toEqual([]);
  });
});

describe('groupTasks', () => {
  const tasks: Task[] = [
    { id: 't1', type: 'review', clientId: 'c1', clientName: 'Alice', title: '', sub: '', due: 'Today' },
    { id: 't2', type: 'balance', clientId: 'c3', clientName: 'Carol', title: '', sub: '', due: 'Overdue' },
    { id: 't3', type: 'balance', clientId: 'c2', clientName: 'Bob', title: '', sub: '', due: 'Overdue' },
  ];
  it('groups by type in fixed order (balance before review)', () => {
    expect(groupTasks(tasks).map((g) => g.type)).toEqual(['balance', 'review']);
  });
  it('drops empty groups', () => {
    expect(groupTasks(tasks).find((g) => g.type === 'schedule')).toBeUndefined();
  });
  it('keeps all items within a group', () => {
    expect(groupTasks(tasks).find((g) => g.type === 'balance')!.items).toHaveLength(2);
  });
  it('returns [] for no tasks', () => {
    expect(groupTasks([])).toEqual([]);
  });
});

describe('computeKpis', () => {
  const job = (over: Partial<Job>): Job => ({
    id: 'j', clientId: 'c', appliance: 'Dishwasher', brand: 'Bosch', description: '',
    status: 'complete unrated', stage: 'Completed', stageOrder: 3, amount: 0, outstanding: 0,
    tech: null, scheduledDate: null, completedDate: null, createdDate: '', rating: null, ...over,
  });
  const clients: Client[] = [
    mk({ id: 'c1', leadSource: 'Tampa LSA', jobs: [job({ amount: 200, outstanding: 0, stage: 'Completed', stageOrder: 3 })] }),
    mk({ id: 'c2', leadSource: 'Tampa LSA', jobs: [job({ amount: 100, outstanding: 100, stage: 'Scheduled', stageOrder: 1 })] }),
    mk({ id: 'c3', leadSource: 'Miami LSA', jobs: [job({ amount: 0, outstanding: 0, stage: 'New Lead', stageOrder: 0 })] }),
  ];
  const kpis = computeKpis(clients, []);
  it('sums revenue and outstanding across all jobs', () => {
    expect(kpis.revenue).toBe(300);
    expect(kpis.outstanding).toBe(100);
  });
  it('counts open jobs (stageOrder 0..2) and completed', () => {
    expect(kpis.openJobs).toBe(2);
    expect(kpis.completed).toBe(1);
  });
  it('averages ticket over priced jobs only', () => {
    expect(kpis.avgTicket).toBe(150); // (200+100)/2, the $0 job excluded
  });
  it('ranks lead sources by count', () => {
    expect(kpis.leadSources[0]).toEqual(['Tampa LSA', 2]);
  });
});

describe('revenueByMonth', () => {
  const job = (completedDate: string | null, amount: number): Job => ({
    id: 'j', clientId: 'c', appliance: '', brand: '', description: '', status: '', stage: '',
    stageOrder: 3, amount, outstanding: 0, tech: null, scheduledDate: null, completedDate,
    createdDate: '', rating: null,
  });
  const clients: Client[] = [
    mk({ id: 'c1', jobs: [job('2026-05-10', 200), job('2026-05-22', 100)] }),
    mk({ id: 'c2', jobs: [job('2026-07-01', 300), job(null, 999), job('2026-07-15', 0)] }),
  ];
  it('sums revenue per month, chronological, with month labels', () => {
    expect(revenueByMonth(clients)).toEqual([
      { label: 'May', value: 300 },
      { label: 'Jul', value: 300 },
    ]);
  });
  it('ignores jobs with no completed date or zero amount', () => {
    const r = revenueByMonth(clients);
    expect(r.reduce((a, m) => a + m.value, 0)).toBe(600);
  });
  it('keeps only the most recent n months', () => {
    const many: Client[] = [mk({ jobs: ['2026-01', '2026-02', '2026-03', '2026-04'].map((m) => job(`${m}-05`, 50)) })];
    expect(revenueByMonth(many, 2).map((m) => m.label)).toEqual(['Mar', 'Apr']);
  });
});

describe('computeKpis parity with generated seed', () => {
  const s = seed as unknown as Seed;
  it('matches the Python generator revenue/outstanding/counts', () => {
    const k = computeKpis(s.clients, s.tasks);
    expect(k.revenue).toBe(s.kpis.revenue);
    expect(k.outstanding).toBe(s.kpis.outstanding);
    expect(k.openJobs).toBe(s.kpis.openJobs);
    expect(k.completed).toBe(s.kpis.completed);
    expect(k.avgTicket).toBe(s.kpis.avgTicket);
    expect(k.clients).toBe(s.kpis.clients);
    expect(k.jobs).toBe(s.kpis.jobs);
  });
});
