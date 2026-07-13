import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameLayout } from './components/layout/GameLayout';
import { HomePage } from './pages/HomePage';
import { CasePage } from './pages/CasePage';
import { ChaosPage } from './pages/ChaosPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route element={<GameLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/case/:caseId" element={<CasePage />} />
            <Route path="/chaos" element={<ChaosPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}
