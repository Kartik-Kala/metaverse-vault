import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;

export const uploadToIPFS = async (payload) => {
  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    { encryptedData: payload },
    { headers: { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_SECRET } }
  );
  return response.data.IpfsHash;
};

export const fetchFromIPFS = async (cid) => {
  const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
  return response.data.encryptedData;
};

export const fetchUserNFTs = async (address) => {
  const key = process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL?.split('/').pop();
  const response = await axios.get(
    `https://eth-mainnet.g.alchemy.com/nft/v3/${key}/getNFTsForOwner?owner=${address}&withMetadata=true&limit=10`
  );
  return response.data.ownedNfts.map(nft => ({
    name: nft.name || 'Unnamed NFT',
    collection: nft.contract?.name || 'Unknown Collection',
    tokenId: nft.tokenId,
    image: nft.image?.thumbnailUrl || null,
  }));
};