'use client';
import { useState, useRef } from 'react';

export default function StoreForm({ onStore, loading, status, statusType }) {
  const [formData, setFormData] = useState({ username: '', bio: '', dataType: 'Profile' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl('');
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setAvatarUrl(e.target.value);
    setAvatarFile(null);
    setAvatarPreview(e.target.value);
  };

  const getAvatarData = () => new Promise((resolve, reject) => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = (ev) => resolve({ type: 'base64', data: ev.target.result });
      reader.onerror = reject;
      reader.readAsDataURL(avatarFile);
    } else {
      resolve({ type: 'url', data: avatarUrl });
    }
  });

  const handleSubmit = async () => {
    const avatarData = await getAvatarData();
    await onStore(formData, avatarData);
    setFormData({ username: '', bio: '', dataType: 'Profile' });
    setAvatarFile(null);
    setAvatarUrl('');
    setAvatarPreview(null);
  };

  const statusColors = { info: '#888', success: '#5dc94a', error: '#ff4444' };

  return (
    <div>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>Store Data</h2>

        <label style={labelStyle}>Username</label>
        <input placeholder="e.g. KartikMeta" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} />

        <label style={labelStyle}>Avatar</label>
        <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
          {avatarPreview && (
            <div style={{ marginBottom: '10px', textAlign: 'center' }}>
              <img src={avatarPreview} alt="preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #5dc94a' }} onError={() => setAvatarPreview(null)} />
            </div>
          )}
          <button onClick={() => fileRef.current.click()} style={{ ...btnStyle, width: '100%', background: '#1a1a1a', color: '#888', border: '1px dashed #333', marginBottom: '8px', fontSize: '0.8rem' }}>
            {avatarFile ? `✓ ${avatarFile.name}` : '↑ Upload Image'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#222' }} />
            <span style={{ fontSize: '0.7rem', color: '#444' }}>or paste URL</span>
            <div style={{ flex: 1, height: '1px', background: '#222' }} />
          </div>
          <input placeholder="https://..." value={avatarUrl} onChange={handleUrlChange} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>

        <label style={labelStyle}>Bio</label>
        <input placeholder="Tell the metaverse who you are" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={inputStyle} />

        <label style={labelStyle}>Data Type</label>
        <select value={formData.dataType} onChange={e => setFormData({ ...formData, dataType: e.target.value })} style={inputStyle}>
          <option>Profile</option>
          <option>Avatar</option>
          <option>Asset</option>
        </select>

        <button onClick={handleSubmit} disabled={loading} style={{ ...btnStyle, width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Processing...' : 'Encrypt & Store'}
        </button>
      </div>

      {status && (
        <div style={{ background: '#111', border: `1px solid ${statusColors[statusType]}22`, borderRadius: '10px', padding: '12px 16px', marginTop: '12px' }}>
          <p style={{ color: statusColors[statusType], fontSize: '0.8rem', margin: 0, wordBreak: 'break-all' }}>
            {statusType === 'success' ? '✓ ' : statusType === 'error' ? '✗ ' : '○ '}{status}
          </p>
        </div>
      )}
    </div>
  );
}

const cardStyle = { background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' };
const inputStyle = { display: 'block', width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '10px 12px', color: '#fff', marginBottom: '14px', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#555', marginBottom: '6px' };
const btnStyle = { background: '#5dc94a', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' };