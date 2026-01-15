'use client';

import { useRouter } from 'next/navigation';
import { Terminal, PlusCircle, History, Shield, LayoutDashboard, Search, Lock } from 'lucide-react';

interface SidebarProps {
    activeTab: 'dashboard' | 'terminal' | 'create' | 'join' | 'history' | 'wagers' | 'fairness';
    isConnected: boolean;
}

function Sidebar({ activeTab, isConnected }: SidebarProps) {
    const router = useRouter();

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', protected: true },
        { id: 'join', icon: Search, label: 'Join Wager', path: '/join', protected: true },
        { id: 'create', icon: PlusCircle, label: 'New Wager', path: '/create', protected: true },
        { id: 'terminal', icon: Terminal, label: 'Active Terminal', path: '/terminal', protected: true },
        { id: 'history', icon: History, label: 'History', path: '/history', protected: true },
    ];

    // Hide sidebar completely when wallet is not connected
    if (!isConnected) {
        return null;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-20 lg:w-64 bg-white dark:bg-[#09090D] border-r border-slate-200 dark:border-white/5 flex-col shrink-0 h-screen sticky top-0 transition-colors">
                <div className="p-6 flex items-center gap-3">

                    <span className="hidden lg:block font-bold text-lg tracking-tighter italic text-slate-900 dark:text-white">
                        AMONGFRIENDS
                    </span>
                </div>

                <nav className="flex-1 p-3 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={<item.icon className="w-5 h-5" />}
                            label={item.label}
                            active={activeTab === item.id}
                            disabled={item.protected && !isConnected}
                            onClick={() => router.push(item.path)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/5 hidden lg:block space-y-4">
                    {/* Social Media Links */}
                    <div className="flex items-center justify-center gap-2">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a
                            href="https://t.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                        </a>
                    </div>

                    {/* Important Links */}
                    <div className="space-y-2">
                        <a
                            href="/docs"
                            className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
                        >
                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            Documentation
                        </a>
                        <a
                            href="/terms"
                            className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
                        >
                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            Terms of Service
                        </a>
                        <a
                            href="/privacy"
                            className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
                        >
                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#09090D]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-4 z-[100] transition-colors">
                {navItems.map((item) => (
                    <MobileNavItem
                        key={item.id}
                        icon={<item.icon className="w-6 h-6" />}
                        active={activeTab === item.id}
                        disabled={item.protected && !isConnected}
                        onClick={() => router.push(item.path)}
                    />
                ))}
            </nav>
        </>
    );
}

function SidebarItem({
    icon,
    label,
    active,
    disabled,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all btn-tactile border ${active
                ? 'bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 dark:border-white/10 shadow-sm dark:shadow-lg'
                : 'bg-transparent border-slate-100 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-white/10'
                }`}
        >
            {icon}
            <span className="hidden lg:block font-medium">{label}</span>
        </button>
    );
}

function MobileNavItem({
    icon,
    active,
    disabled,
    onClick
}: {
    icon: React.ReactNode;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative p-2 rounded-xl transition-all ${active
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : disabled
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
        >
            {icon}
            {disabled && <Lock className="w-2 h-2 absolute top-0 right-0" />}
        </button>
    );
}

export default Sidebar;