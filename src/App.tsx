import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameLayout } from './components/layout/GameLayout';
import { HomePage } from './pages/HomePage';
import { CasePage } from './pages/CasePage';
import { ChaosPage } from './pages/ChaosPage';
import { BuilderListPage } from './pages/BuilderListPage';
import { BuilderPage } from './pages/BuilderPage';
import { DailyDrillPage } from './pages/DailyDrillPage';
import { InterviewPage } from './pages/InterviewPage';
import { NotebookPage } from './pages/NotebookPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route element={<GameLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/case/:caseId" element={<CasePage />} />
            <Route path="/chaos" element={<ChaosPage />} />
            <Route path="/builder" element={<BuilderListPage />} />
            <Route path="/builder/:challengeId" element={<BuilderPage />} />
            <Route path="/daily" element={<DailyDrillPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/notebook" element={<NotebookPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}
