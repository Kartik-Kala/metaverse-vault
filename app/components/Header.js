'use client';
export default function Header({ wallet, onConnect }) {
  return (
    <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          <span style={{ color: '#5dc94a' }}>⬡</span> MetaVault
        </h1>
        <p style={{ fontSize: '0.7rem', color: '#444', margin: '2px 0 0' }}>Decentralized Identity on Ethereum</p>
      </div>
      {!wallet ? (
        <button onClick={onConnect} style={btnStyle}>Connect Wallet</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5dc94a' }} />
          <span style={{ fontSize: '0.8rem', color: '#5dc94a', fontFamily: 'monospace' }}>
  {wallet.ensName || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
</span>
        </div>
      )}
    </div>
  );
}

const btnStyle = { background: '#5dc94a', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' };