import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameLayout } from './components/layout/GameLayout';
import { HomePage } from './pages/HomePage';
import { CasePage } from './pages/CasePage';
import { ChaosPage } from './pages/ChaosPage';
import { DailyDrillPage } from './pages/DailyDrillPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GameLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/case/:caseId" element={<CasePage />} />
          <Route path="/chaos" element={<ChaosPage />} />
          <Route path="/daily" element={<DailyDrillPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
