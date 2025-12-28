'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from './store';

export function useHydration() {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    return hydrated;
}