'use client';

import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers"
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { WalletGuard } from '@/components/Protector';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/terminal')) return 'terminal';
    if (pathname === '/' || pathname === '/wagers') return 'wagers';
    if (pathname === '/create') return 'create';
    if (pathname === '/join') return 'join';
    if (pathname === '/fairness') return 'fairness';
    return 'wagers';
  };

  const activeTab = getActiveTab();

  return (
    <WalletGuard>
      <Toaster position="top-right" />

      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#0D0D12] text-slate-900 dark:text-slate-200 transition-colors duration-300">
        <Sidebar activeTab={activeTab} isConnected={isConnected} />

        <main className="flex-1 flex flex-col relative min-w-0 pb-20 md:pb-0">
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            activeTab={activeTab}
          />

          <div className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </WalletGuard>
  );
}