import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Task, Kpis } from './types';
import { computeKpis } from './selectors';
import seed from './data/seed.json';

const STORAGE_KEY = 'clienthub_state_v1';
const STAGES = ['New Lead', 'Scheduled', 'In Progress', 'Completed'];

export type NewClientInput = {
  name: string;
  phone: string;
  city: string;
  state: string;
  appliance: string;
  brand: string;
  leadSource: string;
};

type State = { clients: Client[]; tasks: Task[]; done: Record<string, boolean>; hydrated: boolean };

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'ADD_CLIENT'; client: Client; task: Task }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'ADVANCE_STAGE'; clientId: string };

const base = seed as unknown as { clients: Client[]; tasks: Task[] };
const initial: State = { clients: base.clients, tasks: base.tasks, done: {}, hydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'ADD_CLIENT':
      return { ...state, clients: [action.client, ...state.clients], tasks: [action.task, ...state.tasks] };
    case 'TOGGLE_TASK':
      return { ...state, done: { ...state.done, [action.id]: !state.done[action.id] } };
    case 'ADVANCE_STAGE': {
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== action.clientId) return c;
          const idx = STAGES.indexOf(c.stage);
          if (idx < 0 || idx >= STAGES.length - 1) return c;
          const stage = STAGES[idx + 1];
          return { ...c, stage, stageOrder: idx + 1 };
        }),
      };
    }
    default:
      return state;
  }
}

type StoreValue = {
  clients: Client[];
  tasks: Task[];
  done: Record<string, boolean>;
  kpis: Kpis;
  addClient: (input: NewClientInput) => void;
  toggleTask: (id: string) => void;
  advanceStage: (clientId: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // hydrate from disk once
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (alive && raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
        else if (alive) dispatch({ type: 'HYDRATE', payload: {} });
      })
      .catch(() => alive && dispatch({ type: 'HYDRATE', payload: {} }));
    return () => {
      alive = false;
    };
  }, []);

  // persist after hydration
  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ clients: state.clients, tasks: state.tasks, done: state.done })
    ).catch(() => {});
  }, [state.clients, state.tasks, state.done, state.hydrated]);

  const value = useMemo<StoreValue>(() => {
    const kpis = computeKpis(state.clients, state.tasks);
    return {
      clients: state.clients,
      tasks: state.tasks,
      done: state.done,
      kpis,
      toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', id }),
      advanceStage: (clientId) => dispatch({ type: 'ADVANCE_STAGE', clientId }),
      addClient: (input) => {
        const id = 'c_' + Date.now().toString(36);
        const job = {
          id: `${id}_0`,
          clientId: id,
          appliance: input.appliance,
          brand: input.brand,
          description: `${input.brand} ${input.appliance.toLowerCase()} — new service request`,
          status: 'needs scheduling',
          stage: 'New Lead',
          stageOrder: 0,
          amount: 0,
          outstanding: 0,
          tech: null,
          scheduledDate: null,
          completedDate: null,
          createdDate: new Date().toISOString().slice(0, 10),
          rating: null,
        };
        const client: Client = {
          id,
          firstName: input.name.split(' ')[0] || input.name,
          lastName: input.name.split(' ').slice(1).join(' '),
          name: input.name,
          phone: input.phone,
          email: `${input.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          street: '',
          city: input.city,
          state: input.state,
          zip: '',
          leadSource: input.leadSource,
          kind: 'homeowner',
          since: new Date().toISOString().slice(0, 10),
          lifetimeValue: 0,
          outstanding: 0,
          stage: 'New Lead',
          stageOrder: 0,
          jobCount: 1,
          jobs: [job],
          tags: [input.brand, input.appliance],
        };
        const task: Task = {
          id: `t_sch_${id}`,
          type: 'schedule',
          clientId: id,
          clientName: input.name,
          title: 'Schedule the visit',
          sub: `${input.brand} ${input.appliance}`,
          due: 'ASAP',
        };
        dispatch({ type: 'ADD_CLIENT', client, task });
      },
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
