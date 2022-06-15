import { Get_Individual, Get_Individual_Ref } from "crud/individual";
import { auth, Image, IOrganization } from "firebaseConfig";
import useIndividual from "hooks/individual/useIndividual";
import useSign from "hooks/singingProcess/useSign";
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { SyntheticEvent } from "react";
import { UploadImage } from "rpcHooks/useFirebase";
import { ToastRun } from "utils/toast";
import uniqid from 'uniqid'
import { GetTime } from "utils";

export default function useOrganization(address: string, blockchain: BlockchainType) {
    const { RegisterOrganization } = useSign(address, blockchain)
    const { create: createIndividual } = useIndividual(address ?? "0", blockchain);

    const create = async (e: SyntheticEvent<HTMLFormElement>, organizationImageStatus: string, organizationFile: File | null, individualImageStatus: string, individualFile: File | null) => {
        e.preventDefault()

        try {
            const target = e.target as HTMLFormElement
            let organizationSetup: Omit<IOrganization, "id" | "created_date">;
            let organizationImageObject: Image | null = null;
            let individualImageObject: Image | null = null;
            let individual = await Get_Individual(auth.currentUser?.uid!)

            const {
                organizationNFTAddress, organizationName, organizationTokenId,
                individualNFTAddress, individualTokenId, individualName }: { [key: string]: HTMLInputElement } = target;
            if (!address) throw new Error("No address")
            if (!organizationImageStatus) throw new Error(`No Organization Image Selection`);
            if (!organizationName.value) throw new Error("No Organization Name")

            if (organizationImageStatus === "NFT") {
                if (!organizationNFTAddress.value) throw new Error("No Organization NFT Address")
                if (!organizationTokenId.value) throw new Error("No Organization Token Id")
            } else {
                if (!organizationFile) throw new Error("No Organization File Upload")
                const organizationURL = await UploadImage(`${organizationName.value}/nft`, organizationFile)
                organizationImageObject = {
                    blockchain,
                    imageUrl: organizationURL,
                    type: "image",
                    nftUrl: organizationURL,
                    tokenId: null
                }
            }


            if (!individual) {
                if (!individualImageStatus) throw new Error("No Individual Image Selection")
                if (individualImageStatus === "NFT") {
                    if (!individualNFTAddress.value) throw new Error("No Individual NFT Address")
                    if (!individualTokenId.value) throw new Error("No Individual Token Id")
                } else {
                    if (!individualFile) throw new Error("No Individual File Upload")
                    const individualURL = await UploadImage(`${individualName.value}/nft`, individualFile)
                    individualImageObject = {
                        blockchain,
                        imageUrl: individualURL,
                        type: "image",
                        nftUrl: individualURL,
                        tokenId: null
                    }
                }

                individual = await createIndividual({
                    accounts: [
                        {
                            id: uniqid(),
                            address: address!,
                            blockchain,
                            image: null,
                            members: [],
                            name: individualName.value,
                            provider: null,
                            signerType: "single",
                            created_date: GetTime()
                        }
                    ],
                    budget_execrises: [],
                    image: individualImageObject,
                    members: [address!],
                    name: individualName.value,
                    seenTime: GetTime()
                })
            }

            organizationSetup = {
                image: organizationImageObject,
                blockchain,
                accounts: [],
                budget_execrises: [],
                creator: Get_Individual_Ref(individual.id),
                members: [],
                name: organizationName.value
            }

            return await RegisterOrganization(organizationSetup)
        } catch (error) {
            ToastRun(<div>{(error as any).message}</div>)
            console.log(error)
            throw new Error(error as any)
        }
    }

    return { create }
}
