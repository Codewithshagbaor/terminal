'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { X, Wallet } from 'lucide-react';
import { useHydration } from '@/lib/useClientStore';


interface WalletGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function WalletGuard({
    children,
}: WalletGuardProps) {
    const { isConnected } = useAccount();
    const hydrated = useHydration();
    const router = useRouter();
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);

    const effectiveConnected = hydrated ? isConnected : false;

    useEffect(() => {
        if (!hydrated) return;

        const protectedRoutes = ['/dashboard', '/create', '/join', '/fairness', '/terminal'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        if (isProtectedRoute && !effectiveConnected) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [effectiveConnected, pathname, hydrated]);


    // Render children immediately, no loading screen during hydration

    const handleCancel = () => {
        setShowModal(false);
        router.push('/'); // Redirect to home/wagers page
    };

    return <>
        {children}
        {/* Auth Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1A1A24] rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                    <button
                        onClick={handleCancel}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Connect Your Wallet
                        </h2>

                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            You need to connect your wallet to access this feature
                        </p>

                        <div className="space-y-3">
                            <button
                                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors relative overflow-hidden group"
                            >
                                {!hydrated ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                                    </div>
                                ) : (
                                    'Connect Wallet'
                                )}
                            </button>

                            <button
                                onClick={handleCancel}
                                className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>;
}