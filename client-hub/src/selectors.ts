// Pure, framework-free selectors. Kept out of components so they can be unit-tested
// and reused across screens.
import { Client, Task } from './types';

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
