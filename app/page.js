'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const CONTRACT_ABI = [
  "function storeData(string memory _cid, string memory _dataType) public",
  "function retrieveData() public view returns (tuple(string cid, uint256 timestamp, string dataType)[])",
  "function getEntryCount() public view returns (uint256)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [vaultEntries, setVaultEntries] = useState([]);
  const [formData, setFormData] = useState({ username: '', avatar: '', bio: '', dataType: 'Profile' });
  const [loading, setLoading] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);

  const setMsg = (msg, type = 'info') => { setStatus(msg); setStatusType(type); };

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Install MetaMask first');
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] });
    } catch (err) { console.error(err); }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet({ provider, signer, address });
    setMsg('Wallet connected successfully', 'success');
    loadVaultEntries(signer);
  };

  const encryptData = (data, key) => CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  const decryptData = (ciphertext, key) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  const uploadToIPFS = async (encryptedPayload) => {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      { encryptedData: encryptedPayload },
      { headers: { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_SECRET } }
    );
    return response.data.IpfsHash;
  };

  const storeData = async () => {
    if (!wallet) return alert('Connect wallet first');
    if (!formData.username) return alert('Username is required');
    setLoading(true);
    try {
      setMsg('Step 1/3 — Encrypting your data...', 'info');
      const encrypted = encryptData(formData, wallet.address);
      setMsg('Step 2/3 — Uploading to IPFS...', 'info');
      const cid = await uploadToIPFS(encrypted);
      setMsg('Step 3/3 — Writing to blockchain...', 'info');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.signer);
      const tx = await contract.storeData(cid, formData.dataType);
      await tx.wait();
      setMsg('Stored successfully on Ethereum + IPFS', 'success');
      setFormData({ username: '', avatar: '', bio: '', dataType: 'Profile' });
      loadVaultEntries(wallet.signer);
    } catch (err) {
      setMsg('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const loadVaultEntries = async (signer) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const entries = await contract.retrieveData();
      setVaultEntries(entries);
    } catch (err) { console.error(err); }
  };

  const retrieveAndDecrypt = async (cid) => {
    try {
      setMsg('Fetching from IPFS...', 'info');
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const decrypted = decryptData(response.data.encryptedData, wallet.address);
      setDecryptedData(decrypted);
      setMsg('Decrypted successfully', 'success');
    } catch (err) {
      setMsg('Error: ' + err.message, 'error');
    }
  };

  const statusColors = { info: '#888', success: '#5dc94a', error: '#ff4444' };

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            <span style={{ color: '#5dc94a' }}>⬡</span> MetaVault
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#444', margin: '2px 0 0' }}>Decentralized Identity on Ethereum</p>
        </div>
        {!wallet ? (
          <button onClick={connectWallet} style={btnStyle}>Connect Wallet</button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5dc94a' }} />
            <span style={{ fontSize: '0.8rem', color: '#5dc94a', fontFamily: 'monospace' }}>
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {!wallet ? (
          // Landing state
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
            <button onClick={connectWallet} style={{ ...btnStyle, padding: '14px 32px', fontSize: '1rem' }}>
              Connect MetaMask to Start
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left — Store */}
            <div>
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>Store Data</h2>
                <label style={labelStyle}>Username</label>
                <input placeholder="e.g. DyalsinghMeta" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} />
                <label style={labelStyle}>Avatar URL</label>
                <input placeholder="https://..." value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} style={inputStyle} />
                <label style={labelStyle}>Bio</label>
                <input placeholder="Tell the metaverse who you are" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={inputStyle} />
                <label style={labelStyle}>Data Type</label>
                <select value={formData.dataType} onChange={e => setFormData({ ...formData, dataType: e.target.value })} style={inputStyle}>
                  <option>Profile</option>
                  <option>Avatar</option>
                  <option>Asset</option>
                </select>
                <button onClick={storeData} disabled={loading} style={{ ...btnStyle, width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
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

            {/* Right — Vault */}
            <div>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Your Vault</h2>
                  <span style={{ background: '#5dc94a22', color: '#5dc94a', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px' }}>
                    {vaultEntries.length} entries
                  </span>
                </div>
                {vaultEntries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#333' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⬡</div>
                    <p style={{ fontSize: '0.8rem' }}>No data stored yet</p>
                  </div>
                ) : (
                  vaultEntries.map((entry, i) => (
                    <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ background: '#5dc94a22', color: '#5dc94a', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>{entry.dataType}</span>
                        <span style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(Number(entry.timestamp) * 1000).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: '#444', wordBreak: 'break-all', margin: '0 0 8px', fontFamily: 'monospace' }}>
                        {entry.cid.slice(0, 24)}...
                      </p>
                      <button onClick={() => retrieveAndDecrypt(entry.cid)} style={{ background: 'transparent', border: '1px solid #222', color: '#888', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.7rem' }}>
                        Retrieve & Decrypt
                      </button>
                    </div>
                  ))
                )}
              </div>

              {decryptedData && (
                <div style={{ ...cardStyle, marginTop: '12px' }}>
                  <h3 style={{ fontSize: '0.85rem', color: '#5dc94a', marginBottom: '12px' }}>✓ Decrypted Data</h3>
                  <pre style={{ fontSize: '0.75rem', color: '#aaa', margin: 0, lineHeight: 1.6 }}>
                    {JSON.stringify(decryptedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #111', padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#333', margin: 0 }}>
          Built on Ethereum Sepolia · IPFS via Pinata · AES-256 Encryption · DSE Blockchain Project
        </p>
      </div>
    </main>
  );
}

const cardStyle = { background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' };
const inputStyle = { display: 'block', width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '10px 12px', color: '#fff', marginBottom: '14px', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#555', marginBottom: '6px' };
const btnStyle = { background: '#5dc94a', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' };