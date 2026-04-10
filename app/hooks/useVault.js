'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import { encryptData, decryptData } from '../utils/crypto';
import { uploadToIPFS, fetchFromIPFS } from '../utils/ipfs';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

export const useVault = (wallet, setMsg) => {
  const [vaultEntries, setVaultEntries] = useState([]);
  const [decryptedData, setDecryptedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadVaultEntries = async (signer) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const entries = await contract.retrieveData();
      setVaultEntries(entries);
    } catch (err) { console.error(err); }
  };

  const storeData = async (formData, avatarData) => {
    if (!wallet) return alert('Connect wallet first');
    if (!formData.username) return alert('Username is required');
    setLoading(true);
    try {
      setMsg('Step 1/3 — Encrypting your data...', 'info');
      const payload = { ...formData, avatar: avatarData };
      const encrypted = encryptData(payload, wallet.address);

      setMsg('Step 2/3 — Uploading to IPFS...', 'info');
      const cid = await uploadToIPFS(encrypted);

      setMsg('Step 3/3 — Writing to blockchain...', 'info');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.signer);
      const tx = await contract.storeData(cid, formData.dataType);
      await tx.wait();

      setMsg('Stored successfully on Ethereum + IPFS', 'success');
      loadVaultEntries(wallet.signer);
    } catch (err) {
      setMsg('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const retrieveAndDecrypt = async (cid) => {
    try {
      setMsg('Fetching from IPFS...', 'info');
      const encrypted = await fetchFromIPFS(cid);
      const decrypted = decryptData(encrypted, wallet.address);
      setDecryptedData(decrypted);
      setMsg('Decrypted successfully', 'success');
    } catch (err) {
      setMsg('Error: ' + err.message, 'error');
    }
  };

  return { vaultEntries, decryptedData, loading, loadVaultEntries, storeData, retrieveAndDecrypt };
};