import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameLayout } from './components/layout/GameLayout';
import { HomePage } from './pages/HomePage';
import { CasePage } from './pages/CasePage';
import { ChaosPage } from './pages/ChaosPage';
import { DailyDrillPage } from './pages/DailyDrillPage';
import { NotebookPage } from './pages/NotebookPage';
import { CheatsheetPage } from './pages/CheatsheetPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route element={<GameLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/case/:caseId" element={<CasePage />} />
            <Route path="/chaos" element={<ChaosPage />} />
            <Route path="/daily" element={<DailyDrillPage />} />
            <Route path="/notebook" element={<NotebookPage />} />
            <Route path="/cheatsheet" element={<CheatsheetPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}
