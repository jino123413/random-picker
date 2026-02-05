import { useState, useRef, useEffect, useCallback } from 'react';
import { pickNumbers } from '../utils/random';

interface NumberPickModeProps {
  onShowResult: (result: string) => void;
}

const COUNT_OPTIONS = [1, 2, 3, 5, 10];

export default function NumberPickMode({ onShowResult }: NumberPickModeProps) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [picking, setPicking] = useState(false);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const [result, setResult] = useState<number[] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const pick = useCallback(() => {
    if (picking) return;
    const range = max - min + 1;
    if (range < 1 || min > max) return;

    const actualCount = Math.min(count, range);
    setPicking(true);
    setResult(null);

    // Number cycling animation
    let speed = 50;
    let elapsed = 0;
    const totalDuration = 2000;

    const cycle = () => {
      const randoms = Array.from({ length: actualCount }, () =>
        Math.floor(Math.random() * range) + min
      );
      setDisplayNumbers(randoms);
      elapsed += speed;

      if (elapsed < totalDuration) {
        speed = Math.min(speed + 8, 300); // Gradually slow down
        intervalRef.current = setTimeout(cycle, speed) as any;
      } else {
        // Final result
        const finalNumbers = pickNumbers(min, max, actualCount);
        setDisplayNumbers(finalNumbers);
        setResult(finalNumbers);
        setPicking(false);
        onShowResult(finalNumbers.join(', '));
      }
    };

    cycle();
  }, [min, max, count, picking, onShowResult]);

  const range = max - min + 1;
  const isValid = range >= 1 && min <= max;

  return (
    <div className="mode-container">
      {/* Range inputs */}
      <div className="range-section">
        <div className="range-row">
          <div className="range-field">
            <label className="range-label">최소값</label>
            <input
              type="number"
              className="range-input"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
            />
          </div>
          <span className="range-separator">~</span>
          <div className="range-field">
            <label className="range-label">최대값</label>
            <input
              type="number"
              className="range-input"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
            />
          </div>
        </div>
        {isValid && (
          <div className="range-info">총 {range}개의 숫자 중에서 뽑기</div>
        )}
        {!isValid && (
          <div className="range-info range-error">최소값이 최대값보다 작아야 합니다</div>
        )}
      </div>

      {/* Count chips */}
      <div className="count-section">
        <label className="count-label">뽑기 개수</label>
        <div className="count-chips">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              className={`count-chip ${count === n ? 'active' : ''}`}
              onClick={() => setCount(n)}
              disabled={!isValid || n > range}
            >
              {n}개
            </button>
          ))}
        </div>
      </div>

      {/* Display area */}
      <div className="number-display-area">
        {(picking || result) && (
          <div className={`number-balls ${result ? 'fadeIn' : ''}`}>
            {displayNumbers.map((num, i) => (
              <div
                key={i}
                className={`number-ball ${result ? 'settled' : 'cycling'}`}
              >
                {num}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pick button */}
      <button
        className="action-button pick-btn"
        onClick={pick}
        disabled={!isValid || picking}
      >
        {picking ? (
          <>
            <i className="ri-loader-4-line spin-icon" />
            뽑는 중...
          </>
        ) : (
          <>
            <i className="ri-hashtag" />
            뽑기
          </>
        )}
      </button>
    </div>
  );
}
