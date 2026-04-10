'use client';
export default function DecryptedCard({ data }) {
  if (!data) return null;
  const avatarSrc = data.avatar?.data || data.avatar;

  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px', marginTop: '12px' }}>
      <h3 style={{ fontSize: '0.85rem', color: '#5dc94a', marginBottom: '12px' }}>✓ Decrypted Data</h3>
      {avatarSrc && (
        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
          <img src={avatarSrc} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #5dc94a' }} />
        </div>
      )}
      <p style={{ fontSize: '0.8rem', color: '#fff', margin: '4px 0' }}>👤 {data.username}</p>
      <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0' }}>📝 {data.bio}</p>
      <p style={{ fontSize: '0.75rem', color: '#444', margin: '4px 0' }}>Type: {data.dataType}</p>
    </div>
  );
}