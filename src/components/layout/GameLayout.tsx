import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { GuidePanel } from '../guide/GuidePanel';
import { useGameState } from '../../hooks/useGameState';

export function GameLayout() {
  const { guideOpen } = useGameState();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-noir-950 bg-dotgrid">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
        {guideOpen && <GuidePanel />}
      </div>
    </div>
  );
}
