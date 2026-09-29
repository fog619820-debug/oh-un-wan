import { create } from 'zustand';

interface RestTimerState {
  endsAt: number | null;
  remainingSeconds: number;
  start: (seconds: number) => void;
  tick: () => void;
  stop: () => void;
}

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  endsAt: null,
  remainingSeconds: 0,
  start: (seconds) => set({
    endsAt: Date.now() + seconds * 1000,
    remainingSeconds: seconds,
  }),
  tick: () => {
    const endsAt = get().endsAt;
    if (endsAt === null) return;
    const remainingSeconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    set({ remainingSeconds, endsAt: remainingSeconds === 0 ? null : endsAt });
  },
  stop: () => set({ endsAt: null, remainingSeconds: 0 }),
}));