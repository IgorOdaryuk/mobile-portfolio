import { filterClients, sortByPriority, groupTasks, clientsByStage } from '../selectors';
import { Client, Task } from '../types';

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
