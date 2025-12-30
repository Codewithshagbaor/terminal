const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

interface Metadata {
    [key: string]: any;
}

interface PinataResponse {
    IpfsHash: string;
}

export const uploadMetadataToPinata = async (metadata: Metadata): Promise<string> => {
    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(PINATA_API_KEY && { 'pinata_api_key': PINATA_API_KEY }),
                ...(PINATA_SECRET_KEY && { 'pinata_secret_api_key': PINATA_SECRET_KEY }),
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: `bet-metadata-${Date.now()}`,
                },
            }),
        });

        const result: PinataResponse = await response.json();
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};