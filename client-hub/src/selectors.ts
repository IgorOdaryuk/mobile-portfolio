// Pure, framework-free selectors. Kept out of components so they can be unit-tested
// and reused across screens.
import { Client, Job, Task, Kpis } from './types';

/** Derive dashboard KPIs from the live client list (so adding a client updates them). */
export function computeKpis(clients: Client[], tasks: Task[]): Kpis {
  const jobs: Job[] = clients.flatMap((c) => c.jobs);
  const paid = jobs.filter((j) => j.amount > 0);
  const leadCounts: Record<string, number> = {};
  for (const c of clients) leadCounts[c.leadSource] = (leadCounts[c.leadSource] || 0) + 1;
  return {
    revenue: jobs.reduce((a, j) => a + j.amount, 0),
    outstanding: jobs.reduce((a, j) => a + j.outstanding, 0),
    openJobs: jobs.filter((j) => j.stageOrder >= 0 && j.stageOrder <= 2).length,
    completed: jobs.filter((j) => j.stage === 'Completed').length,
    clients: clients.length,
    jobs: jobs.length,
    avgTicket: paid.length ? Math.round(paid.reduce((a, j) => a + j.amount, 0) / paid.length) : 0,
    leadSources: Object.entries(leadCounts).sort((a, b) => b[1] - a[1]),
    reviewsPending: tasks.filter((t) => t.type === 'review').length,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Completed-job revenue grouped by calendar month, most recent `n` months, chronological. */
export function revenueByMonth(clients: Client[], n = 6): { label: string; value: number }[] {
  const byMonth = new Map<string, number>();
  for (const c of clients) {
    for (const j of c.jobs) {
      if (!j.completedDate || !j.amount) continue;
      const key = j.completedDate.slice(0, 7); // YYYY-MM
      byMonth.set(key, (byMonth.get(key) || 0) + j.amount);
    }
  }
  const keys = [...byMonth.keys()].sort().slice(-n);
  return keys.map((k) => ({ label: MONTHS[parseInt(k.slice(5, 7), 10) - 1], value: byMonth.get(k) || 0 }));
}

export const CLIENT_FILTERS = ['All', 'New Lead', 'Scheduled', 'In Progress', 'Completed', 'Canceled'] as const;
export type ClientFilter = (typeof CLIENT_FILTERS)[number];

/** Filter clients by pipeline stage + a free-text query over name / city / tags. */
export function filterClients(clients: Client[], filter: ClientFilter, query: string): Client[] {
  let list = clients;
  if (filter !== 'All') list = list.filter((c) => c.stage === filter);
  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.tags.join(' ').toLowerCase().includes(q)
    );
  }
  return list;
}

/** Money owed first, then highest lifetime value — the order a dispatcher cares about. */
export function sortByPriority(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => b.outstanding - a.outstanding || b.lifetimeValue - a.lifetimeValue);
}

export const TASK_ORDER: Task['type'][] = ['balance', 'schedule', 'review', 'winback'];

/** Group tasks by type in a fixed display order, dropping empty groups. */
export function groupTasks(tasks: Task[]): { type: Task['type']; items: Task[] }[] {
  return TASK_ORDER.map((type) => ({ type, items: tasks.filter((t) => t.type === type) })).filter(
    (g) => g.items.length > 0
  );
}

/** Clients that belong in a given kanban column. */
export function clientsByStage(clients: Client[], stage: string): Client[] {
  return clients.filter((c) => c.stage === stage);
}
