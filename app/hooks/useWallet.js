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

    // ENS lookup on mainnet
    let ensName = null;
    try {
      const mainnetProvider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL
      );
      ensName = await mainnetProvider.lookupAddress(address);
    } catch (err) { console.error('ENS lookup failed', err); }

    setWallet({ provider, signer, address, ensName });
    return { provider, signer, address, ensName };
  };

  return { wallet, setWallet, connectWallet };
};