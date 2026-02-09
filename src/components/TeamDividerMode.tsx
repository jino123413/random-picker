import { useState, useCallback, useRef } from 'react';
import { divideTeams, shuffleArray } from '../utils/random';
import TeamGroupModal from './TeamGroupModal';

interface TeamDividerModeProps {
  tryWithAd: (callback: () => void) => void;
}

const TEAM_COLORS = [
  '#FF4081', '#448AFF', '#66BB6A', '#FFA726', '#AB47BC',
  '#26C6DA', '#EF5350', '#8D6E63', '#5C6BC0', '#78909C',
];
const TEAM_EMOJIS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪', '🔶', '🔷'];
const TEAM_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

type InputMode = 'names' | 'quick';
type Screen = 'input' | 'result';

interface FlipCard {
  name: string;
  teamIndex: number;
  flipped: boolean;
}

interface TeamOrder {
  teamIndex: number;
  order: number;
}

// History storage
const HISTORY_KEY = 'gollajwo-history';
const MAX_HISTORY = 20;

interface SavedDivision {
  id: string;
  date: string;
  timestamp: number;
  teamCount: number;
  totalMembers: number;
  teams: { name: string; members: string[] }[];
  order?: number[];
}

function saveToHistory(division: Omit<SavedDivision, 'id' | 'timestamp'>) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: SavedDivision[] = raw ? JSON.parse(raw) : [];
    const entry: SavedDivision = {
      ...division,
      id: Date.now().toString(36),
      timestamp: Date.now(),
    };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject();
    } catch (e) { reject(e); }
    document.body.removeChild(ta);
  });
}

function formatDate(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function TeamDividerMode({ tryWithAd }: TeamDividerModeProps) {
  const [screen, setScreen] = useState<Screen>('input');
  const [inputMode, setInputMode] = useState<InputMode>('names');
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [dividing, setDividing] = useState(false);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [flipCards, setFlipCards] = useState<FlipCard[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [quickCount, setQuickCount] = useState(8);

  // Post-division state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [teamOrder, setTeamOrder] = useState<TeamOrder[] | null>(null);
  const [orderAnimating, setOrderAnimating] = useState(false);
  const [showTeamCountPicker, setShowTeamCountPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const flipTimers = useRef<number[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const addNames = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newNames = trimmed.split(',').map(n => n.trim()).filter(n => n.length > 0);
    setNames(prev => [...prev, ...newNames]);
    setInputValue('');
  };

  const removeName = (index: number) => {
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addNames(); }
  };

  const getEffectiveNames = (): string[] => {
    if (inputMode === 'quick') return Array.from({ length: quickCount }, (_, i) => `${i + 1}번`);
    return names;
  };

  const clearTimers = () => {
    flipTimers.current.forEach(clearTimeout);
    flipTimers.current = [];
  };

  const getTeamData = (result: string[][]) => {
    return result.map((team, i) => ({
      name: `${TEAM_LABELS[i]}팀`,
      members: team,
    }));
  };

  const divide = useCallback((count?: number) => {
    const effectiveNames = getEffectiveNames();
    const tc = count ?? teamCount;
    if (effectiveNames.length < tc || dividing) return;

    clearTimers();
    setDividing(true);
    setTeams(null);
    setFlipCards([]);
    setAllRevealed(false);
    setTeamOrder(null);
    setShowTeamCountPicker(false);
    setSaved(false);
    setScreen('result');

    setTimeout(() => {
      const result = divideTeams(effectiveNames, tc);
      setTeams(result);
      if (count) setTeamCount(tc);

      const cards: FlipCard[] = [];
      result.forEach((team, teamIdx) => {
        team.forEach(name => cards.push({ name, teamIndex: teamIdx, flipped: false }));
      });
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setFlipCards(shuffled);

      shuffled.forEach((_, i) => {
        const t = window.setTimeout(() => {
          setFlipCards(prev => {
            const next = [...prev];
            next[i] = { ...next[i], flipped: true };
            return next;
          });
        }, 400 + i * 200);
        flipTimers.current.push(t);
      });

      const total = 400 + shuffled.length * 200 + 300;
      const rt = window.setTimeout(() => {
        setAllRevealed(true);
        setDividing(false);
      }, total);
      flipTimers.current.push(rt);
    }, 800);
  }, [names, quickCount, inputMode, teamCount, dividing]);

  // ── Post-division handlers ──

  const handleCopyResult = useCallback(() => {
    if (!teams) return;
    const data = getTeamData(teams);
    let text = `[골라줘] 팀 나누기 결과\n${formatDate()}\n`;
    data.forEach((team, i) => {
      const emoji = TEAM_EMOJIS[i % TEAM_EMOJIS.length];
      const orderSuffix = teamOrder
        ? ` — ${teamOrder.find(o => o.teamIndex === i)!.order + 1}번째`
        : '';
      text += `\n${emoji} ${team.name} (${team.members.length}명)${orderSuffix}\n${team.members.join(', ')}`;
    });
    copyToClipboard(text).then(() => showToast('결과가 복사되었어요!')).catch(() => showToast('복사에 실패했습니다'));
  }, [teams, teamOrder]);

  const handleOrderPick = useCallback(() => {
    if (!teams || orderAnimating) return;
    setOrderAnimating(true);
    setTeamOrder(null);

    // Brief animation then reveal
    setTimeout(() => {
      const indices = teams.map((_, i) => i);
      const shuffled = shuffleArray(indices);
      const order: TeamOrder[] = shuffled.map((teamIdx, ord) => ({ teamIndex: teamIdx, order: ord }));
      setTeamOrder(order);
      setOrderAnimating(false);
    }, 1200);
  }, [teams, orderAnimating]);

  const handleReshuffle = useCallback(() => {
    tryWithAd(() => divide());
  }, [divide, tryWithAd]);

  const handleTeamCountChange = useCallback((newCount: number) => {
    setShowTeamCountPicker(false);
    divide(newCount);
  }, [divide]);

  const handleSaveResult = useCallback(() => {
    if (!teams) return;
    const data = getTeamData(teams);
    saveToHistory({
      date: new Date().toISOString().split('T')[0],
      teamCount: teams.length,
      totalMembers: teams.reduce((s, t) => s + t.length, 0),
      teams: data,
      order: teamOrder ? teamOrder.sort((a, b) => a.order - b.order).map(o => o.teamIndex) : undefined,
    });
    setSaved(true);
    showToast('결과가 저장되었어요!');
  }, [teams, teamOrder]);

  const goBackToInput = () => {
    clearTimers();
    setScreen('input');
    setTeams(null);
    setFlipCards([]);
    setAllRevealed(false);
    setTeamOrder(null);
    setDividing(false);
    setSaved(false);
  };

  const effectiveCount = inputMode === 'quick' ? quickCount : names.length;
  const canDivide = effectiveCount >= teamCount && !dividing;
  const maxTeams = Math.min(10, Math.floor(effectiveCount / 2) || 2);

  // ── RESULT SCREEN ──
  if (screen === 'result') {
    return (
      <div className="mode-container">
        {/* Card flip phase */}
        {flipCards.length > 0 && !allRevealed && (
          <>
            <div className="result-header">
              <h2 className="result-title">
                {dividing ? '나누는 중...' : '팀 배정 중...'}
              </h2>
            </div>
            <div className="team-reveal-grid">
              {flipCards.map((card, i) => (
                <div key={i} className={`flip-container ${card.flipped ? 'flipped' : ''}`}>
                  <div className="flip-card">
                    <div className="flip-front">
                      <i className="ri-question-mark" />
                    </div>
                    <div className="flip-back" style={{ background: TEAM_COLORS[card.teamIndex] }}>
                      <span className="flip-team">{TEAM_LABELS[card.teamIndex]}팀</span>
                      <span className="flip-name">{card.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* All revealed — Result + Actions */}
        {allRevealed && teams && (
          <>
            <div className="result-header">
              <button className="back-btn" onClick={goBackToInput}>
                <i className="ri-arrow-left-line" />
              </button>
              <h2 className="result-title">나누기 결과</h2>
              <span className="result-date">{formatDate()}</span>
            </div>

            {/* Team summary cards */}
            <div className="team-results">
              {teams.map((team, i) => {
                const orderInfo = teamOrder?.find(o => o.teamIndex === i);
                return (
                  <div key={i} className="team-card show">
                    <div className="team-header">
                      <span className="team-number" style={{ background: TEAM_COLORS[i] }}>
                        {TEAM_EMOJIS[i]} {TEAM_LABELS[i]}팀
                      </span>
                      <span className="team-member-count">
                        {team.length}명
                        {orderInfo != null && (
                          <span className="team-order-badge">{orderInfo.order + 1}번째</span>
                        )}
                      </span>
                    </div>
                    <div className="team-members">
                      {team.map((member, j) => (
                        <span key={j} className="team-member">{member}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Primary Action: Copy ── */}
            <button className="action-button copy-result-btn" onClick={handleCopyResult}>
              <i className="ri-file-copy-line" />
              결과 복사하기
            </button>

            {/* ── Secondary Actions ── */}
            <div className="post-actions">
              <button className="post-action-btn" onClick={handleReshuffle}>
                <i className="ri-refresh-line" />
                다시 섞기
                <span className="ad-badge-dark">AD</span>
              </button>
              <button className="post-action-btn" onClick={() => setShowTeamCountPicker(true)}>
                <i className="ri-group-line" />
                팀 수 변경
              </button>
            </div>
            <p className="ad-notice">광고 시청 후 다시 섞을 수 있어요</p>

            {/* Team count inline picker */}
            {showTeamCountPicker && (
              <div className="team-count-picker">
                <p className="picker-label">몇 팀으로 나눌까요?</p>
                <div className="picker-options">
                  {Array.from({ length: maxTeams - 1 }, (_, i) => i + 2).map(n => (
                    <button
                      key={n}
                      className={`picker-chip ${n === teamCount ? 'active' : ''}`}
                      onClick={() => handleTeamCountChange(n)}
                    >
                      {n}팀
                    </button>
                  ))}
                </div>
                <button className="picker-cancel" onClick={() => setShowTeamCountPicker(false)}>
                  취소
                </button>
              </div>
            )}

            {/* ── Order Picker ── */}
            <button
              className="post-action-full-btn"
              onClick={handleOrderPick}
              disabled={orderAnimating}
            >
              <div className="post-action-full-left">
                <i className="ri-sort-number-asc" />
                <div>
                  <span className="post-action-full-title">
                    {orderAnimating ? '순서 정하는 중...' : '순서 정하기'}
                  </span>
                  <span className="post-action-full-desc">어떤 팀이 먼저? 랜덤으로 정해요</span>
                </div>
              </div>
              {teamOrder && !orderAnimating && (
                <span className="order-result-mini">
                  {teamOrder.sort((a, b) => a.order - b.order).map(o => `${TEAM_LABELS[o.teamIndex]}`).join('→')}
                </span>
              )}
            </button>

            {/* ── Save Result (AD) ── */}
            {!saved ? (
              <button className="post-action-full-btn save-btn" onClick={handleSaveResult}>
                <div className="post-action-full-left">
                  <i className="ri-save-line" />
                  <div>
                    <span className="post-action-full-title">이 결과 저장하기</span>
                    <span className="post-action-full-desc">기록에 저장합니다</span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="save-done">
                <i className="ri-checkbox-circle-fill" />
                저장 완료
              </div>
            )}
          </>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="toast-overlay">
            <div className="toast">{toastMsg}</div>
          </div>
        )}
      </div>
    );
  }

  // ── INPUT SCREEN ──
  return (
    <div className="mode-container">
      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle-btn ${inputMode === 'names' ? 'active' : ''}`}
          onClick={() => setInputMode('names')}
        >
          <i className="ri-edit-line" />
          이름 입력
        </button>
        <button
          className={`mode-toggle-btn ${inputMode === 'quick' ? 'active' : ''}`}
          onClick={() => setInputMode('quick')}
        >
          <i className="ri-speed-line" />
          빠른 인원
        </button>
      </div>

      {inputMode === 'names' ? (
        <>
          <div className="input-section">
            <div className="input-row">
              <button className="group-btn" onClick={() => setGroupModalOpen(true)}>
                <i className="ri-folder-user-line" />
              </button>
              <input
                type="text"
                className="item-input"
                placeholder="이름 입력 (쉼표로 여러 명)"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={50}
              />
              <button className="add-btn" onClick={addNames} disabled={!inputValue.trim()}>
                추가
              </button>
            </div>
          </div>
          {names.length > 0 && (
            <div className="items-list">
              {names.map((name, i) => (
                <div key={i} className="item-chip">
                  <i className="ri-user-line" style={{ fontSize: '14px', color: '#6B7684' }} />
                  <span>{name}</span>
                  <button className="item-remove" onClick={() => removeName(i)}>
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
              <div className="names-count">{names.length}명</div>
            </div>
          )}
        </>
      ) : (
        <div className="quick-count-section">
          <label className="count-label">총 인원 수</label>
          <div className="quick-count-control">
            <button className="quick-count-btn" onClick={() => setQuickCount(p => Math.max(2, p - 1))} disabled={quickCount <= 2}>
              <i className="ri-subtract-line" />
            </button>
            <span className="quick-count-value">{quickCount}명</span>
            <button className="quick-count-btn" onClick={() => setQuickCount(p => Math.min(50, p + 1))} disabled={quickCount >= 50}>
              <i className="ri-add-line" />
            </button>
          </div>
        </div>
      )}

      {/* Team count */}
      <div className="count-section">
        <label className="count-label">팀 수</label>
        <div className="quick-count-control">
          <button className="quick-count-btn" onClick={() => setTeamCount(p => Math.max(2, p - 1))} disabled={teamCount <= 2}>
            <i className="ri-subtract-line" />
          </button>
          <span className="quick-count-value">{teamCount}팀</span>
          <button className="quick-count-btn" onClick={() => setTeamCount(p => Math.min(10, p + 1))} disabled={teamCount >= 10}>
            <i className="ri-add-line" />
          </button>
        </div>
      </div>

      {/* Divide button */}
      <button className="action-button divide-btn" onClick={() => divide()} disabled={!canDivide}>
        {dividing ? (
          <><i className="ri-loader-4-line spin-icon" /> 나누는 중...</>
        ) : (
          <><i className="ri-group-line" /> {effectiveCount < teamCount ? `최소 ${teamCount}명이 필요합니다` : '나누기'}</>
        )}
      </button>

      <TeamGroupModal
        open={groupModalOpen}
        currentNames={names}
        onClose={() => setGroupModalOpen(false)}
        onLoad={items => setNames(items)}
      />
    </div>
  );
}
