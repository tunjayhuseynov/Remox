import Button from "components/button";
import AnimatedTabBar from 'components/animatedTabBar';
import { useState, useEffect } from "react";
import useMultiWallet from 'hooks/useMultiWallet';
import { useRouter } from 'next/router';
import Dropdown from "components/general/dropdown";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth, IAccount, IIndividual, Image, IMember, IOrganization } from 'firebaseConfig';
import { GetTime } from 'utils';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccountType, SelectBlockchain, SelectID, SelectIndividual, SelectProviderAddress, SelectRemoxAccount } from 'redux/slices/account/selector';
import { Create_Account_For_Individual, Create_Account_For_Organization } from 'redux/slices/account/thunks/account';
import { generate } from 'shortid';
import axios from 'axios';
import { ToastRun } from 'utils/toast';
import useLoading from 'hooks/useLoading';
import EditableAvatar from 'components/general/EditableAvatar';
import { nanoid } from '@reduxjs/toolkit';
import { launchApp } from "redux/slices/account/thunks/launch";
import { TextField } from "@mui/material";
import { toChecksumAddress } from "web3-utils";
import { FirestoreReadMultiple } from "rpcHooks/useFirebase";
import { setPS } from "redux/slices/account/remoxData";
import { NETWORKS } from "components/Wallet";
import { Blockchains } from "types/blockchains";
import { useCelo } from "@celo/react-celo";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address: string;

}
function NewWalletModal() {
    const { walletChainId, networks, updateNetwork, network } = useCelo()
    const { register, handleSubmit } = useForm<IFormInput>();

    // console.log(walletChainId)

    const id = useAppSelector(SelectID)
    const accountType = useAppSelector(SelectAccountType)
    const account = useAppSelector(SelectRemoxAccount)
    const providerAddress = useAppSelector(SelectProviderAddress)
    const individual = useAppSelector(SelectIndividual)

    const dispatch = useAppDispatch()

    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    // const providers = blockchain.multisigProviders;

    const { addWallet } = useMultiWallet()
    const [url, setUrl] = useState<string>()
    const [type, setType] = useState<"image" | "nft">()


    const [selectedNetwork, setSelectedNetwork] = useState(Blockchains[0])
    const [selectedWalletProvider, setSelectedWalletProvider] = useState(selectedNetwork.multisigProviders.length > 0 ? selectedNetwork.multisigProviders[0] : undefined)

    useEffect(() => {
        setSelectedWalletProvider(selectedNetwork.multisigProviders.length > 0 ? selectedNetwork.multisigProviders[0] : undefined)
    }, [selectedNetwork])

    const data = [
        {
            to: "/dashboard/new-wallet",
            text: "Import Wallet"
        },
        {
            to: "/dashboard/new-wallet?index=1&noAnimation=true",
            text: "Connect Wallet"
        }
    ]

    const connectEvent = async () => {
        try {
            await addWallet()
        } catch (error) {
            console.log(error)
            ToastRun(<>{(error as any).message}</>, "error")
        }
        navigate.push("/dashboard");
    }

    useEffect(() => {
        if (index == 1) {
            connectEvent()
        }
    }, [index])

    const imageSelected = async (url: string, type: "nft" | "image") => {
        setUrl(url)
        setType(type)
    }


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!selectedWalletProvider) throw new Error("No provider selected")
            if (!auth.currentUser) throw new Error("No user signed in")
            let blockchain = selectedNetwork;

            let image: Image | null = null;
            if (url || data.nftAddress) {
                image = {
                    blockchain: blockchain.name,
                    imageUrl: url ?? data.nftAddress ?? "",
                    nftUrl: data.nftAddress ?? "",
                    tokenId: data.nftTokenId ?? null,
                    type: type ?? "image"
                };
            }

            const contract = (await axios.get<{ owners: string[] }>("/api/multisig/owners", {
                params: {
                    blockchain: blockchain.name,
                    address: data.address,
                    providerName: selectedWalletProvider.name
                }
            })).data;

            let members: IMember[] = []
            let owners = [...contract.owners]
            for (const owner of owners) {
                const find = await FirestoreReadMultiple<IIndividual>("individuals", [
                    {
                        condition: "array-contains",
                        firstQuery: "members",
                        secondQuery: toChecksumAddress(owner)
                    }
                ])
                if (find.length > 0) {
                    members.push({
                        address: toChecksumAddress(owner),
                        id: nanoid(),
                        name: find[0].name,
                        image: find[0].image,
                        mail: "",
                    })
                } else {
                    members.push({
                        address: toChecksumAddress(owner),
                        id: nanoid(),
                        name: "",
                        image: null,
                        mail: "",
                    })
                }
            }


            let myResponse: IAccount = {
                created_date: GetTime(),
                blockchain: blockchain.name,
                address: data.address,
                mail: null,
                createdBy: auth.currentUser.uid,
                pendingMembersObjects: [],
                id: generate(),
                members: members,
                image: image,
                name: data.name,
                provider: selectedWalletProvider.name,
                signerType: "multi"
            }
            let org = Object.assign({}, account)


            // console.log(walletChainId, blockchain.chainId, network.chainId)
            // if (network.chainId != blockchain.chainId) {
            //     try {
            //         await updateNetwork(networks.find(s => s.chainId === blockchain.chainId)!)
            //     } catch (error) {
            //         ToastRun("Please, Change Network to " + blockchain.displayName, "warning")
            //     }
            //     return
            // }


            if (accountType === "organization") {
                await dispatch(Create_Account_For_Organization({
                    account: myResponse,
                    organization: { ...org } as IOrganization
                })).unwrap()
            } else if (accountType === "individual") {
                await dispatch(Create_Account_For_Individual({
                    account: myResponse,
                    individual: { ...org } as IIndividual
                })).unwrap()
            }


            await dispatch(launchApp({
                accountType: accountType === "organization" ? "organization" : "individual",
                addresses: [...(account?.accounts as IAccount[]), myResponse],
                id: account?.id ?? "",
                storage: {
                    lastSignedProviderAddress: providerAddress ?? "",
                    signType: accountType === "organization" ? "organization" : "individual",
                    uid: auth.currentUser.uid,
                    individual: individual!,
                    organization: accountType === "organization" ? (account as IOrganization) : null,
                },
                isProgressivScreen: true
            })).unwrap()

            ToastRun(<>Account is added successfully</>, "success")
            navigate.back();
        } catch (error) {
            console.error(error)
            ToastRun(<>Please, be sure you are an owner</>, "error")
        }
    }

    const [loading, submit] = useLoading(onSubmit)

    return <div className="w-full mx-auto relative">
        <div className=" w-1/2 mx-auto sm:flex flex-col items-center justify-center ">
            <div className=" text-center w-full pt-4">
                <div className="text-xl font-bold">Add New Wallet</div>
            </div>
            <div className="flex justify-between w-[40%] py-7">
                <AnimatedTabBar data={data} index={index} fontSize={"!text-sm"} />
            </div>

            {index === 0 && <form onSubmit={handleSubmit(submit)} className="flex flex-col w-[62%] gap-7">
                <div className={`flex justify-center flex-shrink-0 flex-grow-0`}>
                    <EditableAvatar
                        avatarUrl={null}
                        name={"random"}
                        blockchain={selectedNetwork}
                        evm={selectedNetwork.name !== "solana"}
                        userId={`${id ?? ""}/accounts/${nanoid()}`}
                        onChange={imageSelected}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {/* <div className="text-sm">Choose Wallet Provider</div> */}
                    <Dropdown
                        // parentClass={'w-full rounded-lg h-[3.4rem]'}
                        className={'w-full bg-white dark:bg-darkSecond'}
                        selectClass={'py-2'}
                        list={Blockchains}
                        sx={{
                            fontSize: "0.875rem",
                            height: "3.33rem",
                        }}
                        label="Choose Network"
                        selected={selectedNetwork}
                        setSelect={setSelectedNetwork}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {/* <div className="text-sm">Choose Wallet Provider</div> */}
                    <Dropdown
                        // parentClass={'w-full rounded-lg h-[3.4rem]'}
                        className={'w-full bg-white dark:bg-darkSecond'}
                        selectClass={'py-2'}
                        list={selectedNetwork.multisigProviders}
                        sx={{
                            fontSize: "0.875rem",
                            height: "3.33rem",
                        }}
                        label="Choose Wallet Provider"
                        selected={selectedWalletProvider}
                        setSelect={setSelectedWalletProvider}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <TextField
                        inputProps={{
                            style: {
                                fontSize: "0.875rem"
                            }
                        }}
                        InputLabelProps={{
                            style: {
                                fontSize: "0.875rem"
                            }
                        }}
                        type="text" {...register("name", { required: true })} label="Wallet Name" className="w-full bg-white dark:bg-darkSecond" />
                </div>
                <div className="flex flex-col gap-1">
                    <TextField
                        inputProps={{
                            style: {
                                fontSize: "0.875rem"
                            }
                        }}
                        InputLabelProps={{
                            style: {
                                fontSize: "0.875rem"
                            }
                        }}
                        type="text" {...register("address", { required: true })} label="Wallet Address" className="w-full bg-white dark:bg-darkSecond" />
                </div>
                <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                    <Button version="second" className="px-4 !py-2 rounded-md !text-sm" onClick={() => { navigate.back() }}>
                        Close
                    </Button>
                    <Button type='submit' className="px-4 !py-2 rounded-md !text-sm" isLoading={loading}>
                        Save
                    </Button>
                </div>
            </form>}
        </div>
    </div>
}

export default NewWalletModal