'use client';
export default function VaultList({ entries, onRetrieve }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Your Vault</h2>
        <span style={{ background: '#5dc94a22', color: '#5dc94a', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px' }}>
          {entries.length} entries
        </span>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#333' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⬡</div>
          <p style={{ fontSize: '0.8rem' }}>No data stored yet</p>
        </div>
      ) : (
        entries.map((entry, i) => (
          <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ background: '#5dc94a22', color: '#5dc94a', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>{entry.dataType}</span>
              <span style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(Number(entry.timestamp) * 1000).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: '#444', wordBreak: 'break-all', margin: '0 0 8px', fontFamily: 'monospace' }}>
              {entry.cid.slice(0, 24)}...
            </p>
            <button onClick={() => onRetrieve(entry.cid)} style={{ background: 'transparent', border: '1px solid #222', color: '#888', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.7rem' }}>
              Retrieve & Decrypt
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = { background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' };