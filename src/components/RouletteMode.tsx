import { useState, useRef, useCallback } from 'react';
import { pickRandom } from '../utils/random';
import PresetModal from './PresetModal';

interface RouletteModeProps {
  tryWithAd: (callback: () => void) => void;
}

export default function RouletteMode({ tryWithAd }: RouletteModeProps) {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [presetOpen, setPresetOpen] = useState(false);
  const spinRef = useRef(false);

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, trimmed]);
    setInputValue('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const doSpin = useCallback(() => {
    if (items.length < 2 || spinRef.current) return;
    spinRef.current = true;
    setSpinning(true);
    setResult(null);

    const selected = pickRandom(items, 1)[0];
    const selectedIndex = items.indexOf(selected);
    const segmentAngle = 360 / items.length;
    const targetAngle = 360 * (5 + Math.random() * 3) - (selectedIndex * segmentAngle + segmentAngle / 2);
    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(selected);
      spinRef.current = false;
    }, 3500);
  }, [items, rotation]);

  const spin = useCallback(() => {
    if (items.length < 2 || spinRef.current) return;
    if (result !== null) {
      tryWithAd(doSpin);
    } else {
      doSpin();
    }
  }, [items, result, tryWithAd, doSpin]);

  const segmentAngle = items.length > 0 ? 360 / items.length : 360;

  const SEGMENT_COLORS = [
    '#FF4081', '#448AFF', '#66BB6A', '#FFA726',
    '#AB47BC', '#26C6DA', '#EF5350', '#8D6E63',
    '#5C6BC0', '#FFCA28',
  ];

  return (
    <div className="mode-container">
      {/* Input area */}
      <div className="input-section">
        <div className="input-row">
          <input
            type="text"
            className="item-input"
            placeholder="항목을 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
          />
          <button className="add-btn" onClick={addItem} disabled={!inputValue.trim()}>
            추가
          </button>
        </div>
        <button className="preset-btn" onClick={() => setPresetOpen(true)}>
          <i className="ri-folder-open-line" />
          프리셋
        </button>
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="items-list">
          {items.map((item, i) => (
            <div key={i} className="item-chip">
              <span
                className="item-chip-dot"
                style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
              />
              <span>{item}</span>
              <button className="item-remove" onClick={() => removeItem(i)}>
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Roulette wheel */}
      {items.length >= 2 && (
        <div className="roulette-area">
          <div className="roulette-pointer">
            <i className="ri-arrow-down-s-fill" />
          </div>
          <div
            className="roulette-wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                : 'none',
            }}
          >
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              {items.map((item, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const largeArc = segmentAngle > 180 ? 1 : 0;

                const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
                const textX = 100 + 62 * Math.cos(midAngle);
                const textY = 100 + 62 * Math.sin(midAngle);
                const textRotation = (startAngle + endAngle) / 2;

                return (
                  <g key={i}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize={items.length > 8 ? '7' : items.length > 5 ? '8' : '10'}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    >
                      {item.length > 6 ? item.slice(0, 5) + '..' : item}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !spinning && (
        <div className="result-display fadeIn">
          <div className="result-label">결과</div>
          <div className="result-value">{result}</div>
        </div>
      )}

      {/* Spin button */}
      <button
        className="action-button spin-btn"
        onClick={spin}
        disabled={items.length < 2 || spinning}
      >
        {spinning ? (
          <>
            <i className="ri-loader-4-line spin-icon" />
            돌리는 중...
          </>
        ) : (
          <>
            <i className="ri-play-circle-line" />
            {items.length < 2 ? '2개 이상 항목을 추가하세요' : result ? '다시 돌리기' : '돌리기'}
            {result && <span className="ad-badge">AD</span>}
          </>
        )}
      </button>
      {result && !spinning && (
        <p className="ad-notice">광고 시청 후 다시 돌릴 수 있어요</p>
      )}

      <PresetModal
        open={presetOpen}
        currentItems={items}
        onClose={() => setPresetOpen(false)}
        onLoad={setItems}
      />
    </div>
  );
}
