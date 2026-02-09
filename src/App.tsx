import { useState, useCallback, useRef } from 'react';
import RouletteMode from './components/RouletteMode';
import NumberPickMode from './components/NumberPickMode';
import TeamDividerMode from './components/TeamDividerMode';
import { useInterstitialAd } from './hooks/useInterstitialAd';

type Mode = 'roulette' | 'number' | 'team';

const TABS: { key: Mode; label: string; icon: string }[] = [
  { key: 'roulette', label: '룰렛', icon: 'ri-clockwise-2-line' },
  { key: 'number', label: '숫자 뽑기', icon: 'ri-hashtag' },
  { key: 'team', label: '팀 나누기', icon: 'ri-group-line' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('roulette');
  const { showInterstitialAd } = useInterstitialAd();
  const adShownRef = useRef(new Set<string>());

  const makeTryWithAd = useCallback((modeKey: string) => (callback: () => void) => {
    if (!adShownRef.current.has(modeKey)) {
      showInterstitialAd({
        onDismiss: () => {
          adShownRef.current.add(modeKey);
          callback();
        },
      });
    } else {
      callback();
    }
  }, [showInterstitialAd]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div>
          <h1 className="header-title">골라줘</h1>
          <p className="header-subtitle">랜덤 결정 도우미</p>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-item ${mode === tab.key ? 'active' : ''}`}
            onClick={() => setMode(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mode content */}
      <main className="main-content">
        {mode === 'roulette' && <RouletteMode tryWithAd={makeTryWithAd('roulette')} />}
        {mode === 'number' && <NumberPickMode tryWithAd={makeTryWithAd('number')} />}
        {mode === 'team' && <TeamDividerMode tryWithAd={makeTryWithAd('team')} />}
      </main>
    </div>
  );
}
