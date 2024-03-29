import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { PublicKey, Connection } from "@solana/web3.js"
import { FirestoreRead, FirestoreReadMultiple, Indicator, UploadImage, useFirestoreSearchField } from "rpcHooks/useFirebase"
import axios from "axios"
import { SolanaEndpoint } from "components/Wallet"
import { individualCollectionName } from "crud/individual"
import { organizationCollectionName } from "crud/organization"
import { ethers } from "ethers"
import { IIndividual, Image, IOrganization, IUser } from "firebaseConfig"
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { BlockchainType } from "types/blockchains"

const isAddressExisting = async <Type extends {}>(collectionName: string, queries: { addressField: string, address: string, indicator?: Indicator }[]) => {
    return await FirestoreReadMultiple<Type>(collectionName, queries.map(s => ({ secondQuery: s.addressField, firstQuery: s.address, condition: (s?.indicator ?? "array-contains") })))
}

const nftOwner = async (nft: string, blockchain: BlockchainType, tokenId?: number) => {
    if (blockchain.name === "celo") {
        if (!tokenId) throw new Error("Token ID is required for Celo NFTs")
        const id = tokenId;
        const nftContract = new ethers.Contract(nft, [
            {
                "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
                "name": "ownerOf",
                "outputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
            }
        ], new CeloProvider("https://forno.celo.org"))

        return (await nftContract.ownerOf(id)) as string
    } else if (blockchain.name === "solana") {
        const connection = new Connection(SolanaEndpoint)
        let mintPubkey = new PublicKey(nft);
        let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);

        return (await Metadata.load(connection, tokenmetaPubkey)).data.updateAuthority;
    }
    throw new Error("No blockchain is selected")
}


export const isOldUser = async (address: string) => await isUserUsingOldVersion(address)


export const isIndividualExisting = async (address: string) => {
    return !!(await FirestoreRead<IIndividual>(individualCollectionName, address))
}

export const isOrganizationExisting = async (name: string, blockchain: string) => {
    return (await isAddressExisting<IOrganization>(organizationCollectionName, [{ addressField: "name", address: name, indicator: "==" }, { addressField: "blockchain", address: blockchain, indicator: "==" }])).length != 0
}

export const isUserUsingOldVersion = async (address: string) => {
    return (await isAddressExisting('users', [{ addressField: 'address', address: address, indicator: "array-contains" }])).length != 0
}

export const isAddressNftOwner = async (address: string, nft: string, blockchain: BlockchainType, tokenId?: number) => {
    (await nftOwner(nft, blockchain, tokenId)).trim().toLowerCase() === address.trim().toLowerCase()
}

export const DownloadAndSetNFTorImageForUser = async (props: { image: Image | null, name: string }) => {
    if (props.image) {
        const { imageUrl, nftUrl, blockchain, type, tokenId } = props.image;
        if (imageUrl && typeof imageUrl !== "string" && type === "image") {
            props.image.imageUrl = await UploadImage(props.name, imageUrl);
        } else if (nftUrl && type === "nft") {
            if (blockchain === "celo") {
                if (!tokenId) throw new Error("Token ID is required for Celo NFTs")
                const id = tokenId;
                const nft = new ethers.Contract(nftUrl, [
                    {
                        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
                        "name": "tokenURI",
                        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
                        "stateMutability": "view",
                        "type": "function"
                    }
                ], new CeloProvider("https://forno.celo.org"))

                let uri = await nft.tokenURI(id)
                if (uri.includes("ipfs://")) {
                    uri = "https://ipfs.io/ipfs/" + uri.split("ipfs://")[1]
                }
                const res = await axios.get<{ image: string }>(uri)
                props.image.imageUrl = res.data.image;
            } else if (blockchain === "solana") {
                const connection = new Connection(SolanaEndpoint)
                let mintPubkey = new PublicKey(nftUrl);
                let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);

                const tokenmeta = await Metadata.load(connection, tokenmetaPubkey);
                const uri = tokenmeta.data.data.uri
                const res = await axios.get<{ image: string }>(uri)
                props.image.imageUrl = res.data.image
            }
        }
    }
}


