import { BlockchainType } from "types/blockchains";
import Web3 from "web3";
import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaEndpoint } from "components/Wallet";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";


export const NFTFetcher = async (blockchain: BlockchainType, contractAddress: string, tokenId?: string) => {
    if (blockchain.name === "celo" || blockchain.name.includes("evm")) {
        if (!tokenId) throw new Error("Token ID is required for Celo NFTs")
        const id = tokenId;
        const web3 = new Web3(blockchain.rpcUrl)
        const nft = new web3.eth.Contract([
            {
                "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
                "name": "tokenURI",
                "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
                "stateMutability": "view",
                "type": "function"
            }
        ], contractAddress)

        let uri = await nft.methods.tokenURI(id).call()
        if (uri.includes("ipfs://")) uri = "https://ipfs.io/ipfs/" + uri.split("ipfs://")[1]
        const res = await axios.get<{ image: string }>(uri)
        return res.data.image.startsWith("ipfs://") ? "https://ipfs.io/ipfs/" + res.data.image.split("ipfs://")[1] : res.data.image;
    } else if (blockchain.name === "solana") {
        const connection = new Connection(SolanaEndpoint)
        let mintPubkey = new PublicKey(contractAddress);
        let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);

        const tokenmeta = await Metadata.load(connection, tokenmetaPubkey);
        const uri = tokenmeta.data.data.uri
        const res = await axios.get<{ image: string }>(uri)
        return res.data.image
    }
}