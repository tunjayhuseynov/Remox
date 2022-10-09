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

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address: string;

}
function NewWalletModal() {
    const { register, handleSubmit } = useForm<IFormInput>();

    const id = useAppSelector(SelectID)
    const accountType = useAppSelector(SelectAccountType)
    const account = useAppSelector(SelectRemoxAccount)
    const blockchain = useAppSelector(SelectBlockchain)
    const providerAddress = useAppSelector(SelectProviderAddress)
    const individual = useAppSelector(SelectIndividual)

    const dispatch = useAppDispatch()

    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const providers = blockchain.multisigProviders;

    const { addWallet } = useMultiWallet()
    const [url, setUrl] = useState<string>()
    const [type, setType] = useState<"image" | "nft">()


    const [selectedWalletProvider, setSelectedWalletProvider] = useState(providers.length > 0 ? providers[0] : undefined)


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
        navigate.back();
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

            let myResponse: IAccount = {
                created_date: GetTime(),
                blockchain: blockchain.name,
                address: data.address,
                mail: null,
                createdBy: auth.currentUser.uid,
                id: generate(),
                members: contract.owners.map<IMember>(s => ({
                    address: toChecksumAddress(s),
                    id: nanoid(),
                    name: "",
                    image: null,
                    mail: "",
                })),
                image: image,
                name: data.name,
                provider: selectedWalletProvider.name,
                signerType: "multi"
            }
            let org = Object.assign({}, account)
            if (accountType === "organization") {
                await dispatch(Create_Account_For_Organization({
                    account: myResponse,
                    organization: org as IOrganization
                })).unwrap()
            } else if (accountType === "individual") {
                await dispatch(Create_Account_For_Individual({
                    account: myResponse,
                    individual: org as IIndividual
                })).unwrap()
            }

            await dispatch(launchApp({
                accountType: accountType === "organization" ? "organization" : "individual",
                addresses: [...(account?.accounts as IAccount[]), myResponse],
                blockchain: blockchain,
                id: account?.id ?? "",
                storage: {
                    lastSignedProviderAddress: providerAddress ?? "",
                    signType: accountType === "organization" ? "organization" : "individual",
                    uid: auth.currentUser.uid,
                    individual: individual!,
                    organization: accountType === "organization" ? (account as IOrganization) : null,
                }
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
                <div className="text-2xl font-bold">Add New Wallet</div>
            </div>
            <div className="flex justify-between w-[60%] py-7"><AnimatedTabBar data={data} index={index} /></div>

            {index === 0 && <form onSubmit={handleSubmit(submit)} className="flex flex-col w-[62%] gap-7">
                <div className={`flex justify-center flex-shrink-0 flex-grow-0`}>
                    <EditableAvatar
                        avatarUrl={null}
                        name={"random"}
                        blockchain={blockchain}
                        evm={blockchain.name !== "solana"}
                        userId={`${id ?? ""}/accounts/${nanoid()}`}
                        onChange={imageSelected}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {/* <div className="text-sm">Choose Wallet Provider</div> */}
                    <Dropdown
                        // parentClass={'w-full rounded-lg h-[3.4rem]'}
                        className={'w-full'}
                        selectClass={'py-2'}
                        list={providers}
                        sx={{
                            fontSize: "0.75rem",
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
                                fontSize: "0.75rem"
                            }
                        }}
                        type="text" {...register("name", { required: true })} label="Wallet Name" placeholder="E.g. Remox DAO" className="w-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <TextField
                        inputProps={{
                            style: {
                                fontSize: "0.75rem"
                            }
                        }}
                        type="text" {...register("address", { required: true })} label="Wallet Address" placeholder="E.g. 0xabcd..." className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                    <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { navigate.back() }}>
                        Close
                    </Button>
                    <Button type='submit' className="px-6 py-3 rounded-md" isLoading={loading}>
                        Save
                    </Button>
                </div>
            </form>}
        </div>
    </div>
}

export default NewWalletModal