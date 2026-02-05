import { useState, useCallback } from 'react';
import { divideTeams } from '../utils/random';

interface TeamDividerModeProps {
  onShowResult: (result: string) => void;
}

const TEAM_COUNTS = [2, 3, 4];
const TEAM_COLORS = ['#FF4081', '#448AFF', '#66BB6A', '#FFA726'];

export default function TeamDividerMode({ onShowResult }: TeamDividerModeProps) {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [dividing, setDividing] = useState(false);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [showTeams, setShowTeams] = useState<boolean[]>([]);

  const addNames = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Support comma-separated input
    const newNames = trimmed
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    setNames((prev) => [...prev, ...newNames]);
    setInputValue('');
  };

  const removeName = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNames();
    }
  };

  const divide = useCallback(() => {
    if (names.length < teamCount || dividing) return;
    setDividing(true);
    setTeams(null);
    setShowTeams([]);

    setTimeout(() => {
      const result = divideTeams(names, teamCount);
      setTeams(result);

      // Sequential reveal animation
      result.forEach((_, i) => {
        setTimeout(() => {
          setShowTeams((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 300);
      });

      setTimeout(() => {
        setDividing(false);
        const summary = result
          .map((team, i) => `${i + 1}팀: ${team.join(', ')}`)
          .join(' | ');
        onShowResult(summary);
      }, result.length * 300 + 200);
    }, 800);
  }, [names, teamCount, dividing, onShowResult]);

  return (
    <div className="mode-container">
      {/* Input area */}
      <div className="input-section">
        <div className="input-row">
          <input
            type="text"
            className="item-input"
            placeholder="이름 입력 (쉼표로 여러 명)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          <button className="add-btn" onClick={addNames} disabled={!inputValue.trim()}>
            추가
          </button>
        </div>
      </div>

      {/* Names list */}
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

      {/* Team count selector */}
      <div className="count-section">
        <label className="count-label">팀 수</label>
        <div className="count-chips">
          {TEAM_COUNTS.map((n) => (
            <button
              key={n}
              className={`count-chip ${teamCount === n ? 'active' : ''}`}
              onClick={() => setTeamCount(n)}
            >
              {n}팀
            </button>
          ))}
        </div>
      </div>

      {/* Team results */}
      {teams && (
        <div className="team-results">
          {teams.map((team, i) => (
            <div
              key={i}
              className={`team-card ${showTeams[i] ? 'show' : ''}`}
              style={{ '--team-color': TEAM_COLORS[i] } as React.CSSProperties}
            >
              <div className="team-header">
                <span className="team-number" style={{ background: TEAM_COLORS[i] }}>
                  {i + 1}팀
                </span>
                <span className="team-member-count">{team.length}명</span>
              </div>
              <div className="team-members">
                {team.map((member, j) => (
                  <span key={j} className="team-member">{member}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divide button */}
      <button
        className="action-button divide-btn"
        onClick={divide}
        disabled={names.length < teamCount || dividing}
      >
        {dividing ? (
          <>
            <i className="ri-loader-4-line spin-icon" />
            나누는 중...
          </>
        ) : (
          <>
            <i className="ri-group-line" />
            {names.length < teamCount
              ? `최소 ${teamCount}명이 필요합니다`
              : '나누기'}
          </>
        )}
      </button>
    </div>
  );
}
