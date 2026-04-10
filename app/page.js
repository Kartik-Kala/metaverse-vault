'use client';
import { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useVault } from './hooks/useVault';
import Header from './components/Header';
import StoreForm from './components/StoreForm';
import VaultList from './components/VaultList';
import DecryptedCard from './components/DecryptedCard';

export default function Home() {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const setMsg = (msg, type = 'info') => { setStatus(msg); setStatusType(type); };

  const { wallet, setWallet, connectWallet } = useWallet();
  const { vaultEntries, decryptedData, loading, loadVaultEntries, storeData, retrieveAndDecrypt } = useVault(wallet, setMsg);

  const handleConnect = async () => {
    const w = await connectWallet();
    if (w) loadVaultEntries(w.signer);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <Header wallet={wallet} onConnect={handleConnect} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {!wallet ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⬡</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
              Own Your Digital Identity
            </h2>
            <p style={{ color: '#555', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Store your metaverse profile encrypted on IPFS. Verified on Ethereum. Only you hold the key.
            </p>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '48px' }}>
              {['AES-256 Encrypted', 'IPFS Stored', 'Ethereum Verified'].map(f => (
                <div key={f} style={{ fontSize: '0.8rem', color: '#5dc94a' }}>✓ {f}</div>
              ))}
            </div>
            <button onClick={handleConnect} style={{ background: '#5dc94a', color: '#000', border: 'none', borderRadius: '8px', padding: '14px 32px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
              Connect MetaMask to Start
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <StoreForm onStore={storeData} loading={loading} status={status} statusType={statusType} walletAddress={wallet?.address} />
            <div>
              <VaultList entries={vaultEntries} onRetrieve={retrieveAndDecrypt} />
              <DecryptedCard data={decryptedData} />
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #111', padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#333', margin: 0 }}>
  Built on Ethereum Sepolia · IPFS via Pinata · AES-256 Encryption
</p>
<p style={{ fontSize: '0.7rem', color: '#444', margin: '6px 0 0' }}>
  DSE — Blockchain & its Applications · Dyal Singh College, University of Delhi
</p>
<p style={{ fontSize: '0.7rem', color: '#333', margin: '4px 0 0' }}>
  Kartik Kala (22/13078) · Syed Abbas Haider (22/13004) · Mohd Yasir Salmani (22/13062)
</p>
      </div>
    </main>
  );
}