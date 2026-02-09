import { useState } from 'react';
import { Preset, getAllTeamGroups, saveTeamGroup, deleteTeamGroup } from '../utils/presets';

interface TeamGroupModalProps {
  open: boolean;
  currentNames: string[];
  onClose: () => void;
  onLoad: (names: string[]) => void;
}

export default function TeamGroupModal({ open, currentNames, onClose, onLoad }: TeamGroupModalProps) {
  const [groups, setGroups] = useState<Preset[]>(getAllTeamGroups);
  const [saveName, setSaveName] = useState('');
  const [tab, setTab] = useState<'load' | 'save'>('load');

  if (!open) return null;

  const handleLoad = (items: string[]) => {
    onLoad(items);
    onClose();
  };

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed || currentNames.length === 0) return;
    saveTeamGroup({ name: trimmed, items: currentNames });
    setGroups(getAllTeamGroups());
    setSaveName('');
    setTab('load');
  };

  const handleDelete = (id: string) => {
    deleteTeamGroup(id);
    setGroups(getAllTeamGroups());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">나의 그룹</h3>
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
            {groups.map((group) => (
              <div key={group.id} className="preset-item">
                <div className="preset-info" onClick={() => handleLoad(group.items)}>
                  <div className="preset-name">
                    {group.isDefault && <span className="preset-badge">기본</span>}
                    <i className="ri-team-line" style={{ marginRight: '4px', fontSize: '14px' }} />
                    {group.name}
                  </div>
                  <div className="preset-count">{group.items.length}명</div>
                </div>
                {!group.isDefault && (
                  <button className="preset-delete" onClick={() => handleDelete(group.id)}>
                    <i className="ri-delete-bin-line" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="preset-save">
            <p className="preset-save-info">
              현재 {currentNames.length}명을 그룹으로 저장합니다.
            </p>
            {currentNames.length === 0 ? (
              <p className="preset-save-empty">저장할 멤버가 없습니다. 먼저 이름을 추가해주세요.</p>
            ) : (
              <>
                <div className="preset-save-items">
                  {currentNames.map((name, i) => (
                    <span key={i} className="preset-save-chip">
                      <i className="ri-user-line" style={{ fontSize: '12px' }} /> {name}
                    </span>
                  ))}
                </div>
                <div className="preset-save-form">
                  <input
                    type="text"
                    className="preset-save-input"
                    placeholder="그룹 이름 (예: 우리 팀)"
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
