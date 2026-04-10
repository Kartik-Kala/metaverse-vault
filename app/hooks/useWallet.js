'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Install MetaMask first');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (err) { console.error(err); }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet({ provider, signer, address });
    return { provider, signer, address };
  };

  return { wallet, setWallet, connectWallet };
};