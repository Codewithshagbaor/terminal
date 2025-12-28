import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Wager } from '@/types/Wager';

interface AppState {
    wagers: Wager[];
    selectedWagerId: string | null;
    theme: 'dark' | 'light';

    setWagers: (wagers: Wager[]) => void;
    addWager: (wager: Wager) => void;
    updateWager: (id: string, updates: Partial<Wager>) => void;
    setSelectedWagerId: (id: string | null) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            wagers: [],
            selectedWagerId: null,
            theme: 'dark',

            setWagers: (wagers) => set({ wagers }),
            addWager: (wager) => set((state) => ({ wagers: [wager, ...state.wagers] })),
            updateWager: (id, updates) => set((state) => ({
                wagers: state.wagers.map(w => w.id === id ? { ...w, ...updates } : w)
            })),
            setSelectedWagerId: (id) => set({ selectedWagerId: id }),
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => {
                // Check if we're on the client side
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                // Return a dummy storage for SSR
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            partialize: (state) => ({
                theme: state.theme,
            }),
        }
    )
);
