import { useState } from 'react';
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
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { showInterstitialAd } = useInterstitialAd();

  const handleShowResult = (result: string) => {
    setLastResult(result);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    showInterstitialAd({
      onDismiss: () => {
        setLastResult(null);
        setShowResetConfirm(false);
        // Force re-render by toggling mode
        const current = mode;
        setMode('roulette');
        setTimeout(() => setMode(current), 0);
      },
    });
  };

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
            onClick={() => {
              setMode(tab.key);
              setLastResult(null);
            }}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mode content */}
      <main className="main-content">
        {mode === 'roulette' && <RouletteMode onShowResult={handleShowResult} />}
        {mode === 'number' && <NumberPickMode onShowResult={handleShowResult} />}
        {mode === 'team' && <TeamDividerMode onShowResult={handleShowResult} />}
      </main>

      {/* Reset button (AD) */}
      {lastResult && (
        <div className="reset-section">
          <button className="reset-btn" onClick={handleReset}>
            <i className="ri-refresh-line" />
            다시 하기
            <span className="ad-badge">AD</span>
          </button>
          <p className="ad-notice">광고 시청 후 새로운 선택을 시작합니다</p>
        </div>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="ri-refresh-line" />
            </div>
            <h3 className="confirm-title">다시 시작할까요?</h3>
            <p className="confirm-desc">광고 시청 후 새로운 선택을 시작합니다.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowResetConfirm(false)}>
                취소
              </button>
              <button className="confirm-ok" onClick={confirmReset}>
                <span className="ad-badge-dark">AD</span>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
