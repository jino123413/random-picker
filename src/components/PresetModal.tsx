import { useState } from 'react';
import { Preset, getAllPresets, saveCustomPreset, deleteCustomPreset } from '../utils/presets';

interface PresetModalProps {
  open: boolean;
  currentItems: string[];
  onClose: () => void;
  onLoad: (items: string[]) => void;
}

export default function PresetModal({ open, currentItems, onClose, onLoad }: PresetModalProps) {
  const [presets, setPresets] = useState<Preset[]>(getAllPresets);
  const [saveName, setSaveName] = useState('');
  const [tab, setTab] = useState<'load' | 'save'>('load');

  if (!open) return null;

  const handleLoad = (items: string[]) => {
    onLoad(items);
    onClose();
  };

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed || currentItems.length === 0) return;
    saveCustomPreset({ name: trimmed, items: currentItems });
    setPresets(getAllPresets());
    setSaveName('');
    setTab('load');
  };

  const handleDelete = (id: string) => {
    deleteCustomPreset(id);
    setPresets(getAllPresets());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">프리셋</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'load' ? 'active' : ''}`}
            onClick={() => setTab('load')}
          >
            불러오기
          </button>
          <button
            className={`modal-tab ${tab === 'save' ? 'active' : ''}`}
            onClick={() => setTab('save')}
          >
            저장하기
          </button>
        </div>

        {tab === 'load' ? (
          <div className="preset-list">
            {presets.map((preset) => (
              <div key={preset.id} className="preset-item">
                <div className="preset-info" onClick={() => handleLoad(preset.items)}>
                  <div className="preset-name">
                    {preset.isDefault && <span className="preset-badge">기본</span>}
                    {preset.name}
                  </div>
                  <div className="preset-count">{preset.items.length}개 항목</div>
                </div>
                {!preset.isDefault && (
                  <button className="preset-delete" onClick={() => handleDelete(preset.id)}>
                    <i className="ri-delete-bin-line" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="preset-save">
            <p className="preset-save-info">
              현재 {currentItems.length}개 항목을 프리셋으로 저장합니다.
            </p>
            {currentItems.length === 0 ? (
              <p className="preset-save-empty">저장할 항목이 없습니다. 먼저 항목을 추가해주세요.</p>
            ) : (
              <>
                <div className="preset-save-items">
                  {currentItems.map((item, i) => (
                    <span key={i} className="preset-save-chip">{item}</span>
                  ))}
                </div>
                <div className="preset-save-form">
                  <input
                    type="text"
                    className="preset-save-input"
                    placeholder="프리셋 이름"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    maxLength={20}
                  />
                  <button
                    className="preset-save-btn"
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                  >
                    저장
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
