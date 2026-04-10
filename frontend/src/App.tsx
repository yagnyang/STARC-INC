import { useState } from 'react';
import LandingPage from './components/LandingPage';
import DashboardPage from './components/DashboardPage';
import StarField from './components/StarField';
import VRSpaceView from './components/VRSpaceView';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'vr'>('landing');

  return (
    <div className="min-h-screen bg-surface text-white selection:bg-primary/30">
      {view !== 'vr' && <StarField />}

      {view === 'landing' && (
        <LandingPage onLaunch={() => setView('dashboard')} />
      )}

      {view === 'dashboard' && (
        <>
          <button
            onClick={() => setView('vr')}
            className="absolute top-4 right-24 z-50 bg-primary/80 px-4 py-2 rounded text-white"
          >
            Enter VR Mode
          </button>
          <DashboardPage />
        </>
      )}

      {view === 'vr' && (
        <>
          <button
            onClick={() => setView('dashboard')}
            className="absolute top-4 left-4 z-50 bg-surface border border-primary/50 px-4 py-2 rounded text-white"
          >
            Back to Dashboard
          </button>
          <VRSpaceView />
        </>
      )}
    </div>
  );
}
