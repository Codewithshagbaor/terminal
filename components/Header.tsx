'use client';

import { useRouter } from 'next/navigation';
import { Bell, Globe, Sun, Moon, Wallet } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface HeaderProps {
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
    activeTab?: string;
}

function Header({ theme, onToggleTheme, activeTab }: HeaderProps) {
    const router = useRouter();
    const { chain } = useAccount();

    const handleNavigation = (tab: string) => {
        const routes: Record<string, string> = {
            dashboard: '/dashboard',
            wagers: '/',
            fairness: '/fairness',
        };
        router.push(routes[tab] || '/');
    };

    return (
        <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-[#0D0D12]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="flex items-center gap-4 md:gap-12 flex-1">
                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                    <button
                        onClick={() => handleNavigation('dashboard')}
                        className={`${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-500' : 'hover:text-emerald-600 dark:hover:text-emerald-400'} transition-colors relative py-2`}
                    >
                        Home
                        {activeTab === 'dashboard' && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                    </button>
                    <button
                        onClick={() => handleNavigation('wagers')}
                        className={`${activeTab === 'wagers' ? 'text-emerald-600 dark:text-emerald-500' : 'hover:text-emerald-600 dark:hover:text-emerald-400'} transition-colors relative py-2`}
                    >
                        Wagers
                        {activeTab === 'wagers' && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                    </button>
                    <button
                        onClick={() => handleNavigation('fairness')}
                        className={`${activeTab === 'fairness' ? 'text-emerald-600 dark:text-emerald-500' : 'hover:text-emerald-600 dark:hover:text-emerald-400'} transition-colors relative py-2`}
                    >
                        Fairness
                        {activeTab === 'fairness' && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Network Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg transition-all">
                    <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase">
                        {chain?.name || 'Localnet'}
                    </span>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                {/* Wallet Connection */}
                <div className="rainbow-connect-wrapper scale-90 md:scale-100 origin-right">
                    <ConnectButton
                        showBalance={{ smallScreen: false, largeScreen: true }}
                        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
                        chainStatus="icon"
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;