'use client';

import { Header }          from '@/components/layout/Header';
import { Ticker }          from '@/components/layout/Ticker';
import { Footer }          from '@/components/layout/Footer';
import { HomeView }        from '@/components/markets/HomeView';
import { MarketDetailView }from '@/components/markets/MarketDetailView';
import { PortfolioView }   from '@/components/portfolio/PortfolioView';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { ToastContainer }  from '@/components/ui/ToastContainer';
import { ErrorBoundary }   from '@/components/ui/ErrorBoundary';
import { useAppStore }     from '@/stores/useAppStore';

export default function HomePage() {
  const { currentView } = useAppStore();

  return (
    <>
      <Header />
      <Ticker />
      <ErrorBoundary>
        <main className="flex-grow">
          {currentView === 'home'        && <HomeView />}
          {currentView === 'market'      && <MarketDetailView />}
          {currentView === 'portfolio'   && <PortfolioView />}
          {currentView === 'leaderboard' && <LeaderboardView />}
        </main>
      </ErrorBoundary>
      <Footer />
      <ToastContainer />
    </>
  );
}
