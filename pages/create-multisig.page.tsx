
import { SelectBlockchain, SelectDarkMode, SelectStorage } from 'redux/slices/account/remoxData';
import Button from 'components/button';
import { AddressReducer } from "utils";
import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { useWalletKit } from "hooks";
import AnimatedTabBar from 'components/animatedTabBar';
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { ToastRun } from 'utils/toast';
import useMultisig from 'hooks/walletSDK/useMultisig';
import useNextSelector from 'hooks/useNextSelector';
import { DownloadAndSetNFTorImageForUser } from 'hooks/singingProcess/utils';
import { IAccount, Image, IOrganization } from 'firebaseConfig';
import useAsyncEffect from 'hooks/useAsyncEffect';
import EditableAvatar from 'components/general/EditableAvatar';
import { nanoid } from '@reduxjs/toolkit';
import { TextField } from '@mui/material';
import { Blockchains, MultisigProviders } from 'types/blockchains';
import { BiTrash } from 'react-icons/bi';
import useLoading from 'hooks/useLoading';
import { useDispatch } from 'react-redux';
import { Create_Account_For_Organization } from 'redux/slices/account/thunks/account';

interface IFormInput {
    name: string;
    ownerName: string;
    multisigAddress?: string;
    threshold?: number;
}

function CreateMultisig() {

    const { register, handleSubmit } = useForm<IFormInput>();

    const dispatch = useAppDispatch()


    const { Address } = useWalletKit();

    const [address, setProviderAddress] = useState<string>("")
    useAsyncEffect(async () => {
        const val = await Address
        if (val) {
            setProviderAddress(val)
        }
    })

    const { createMultisigAccount, importMultisigAccount } = useMultisig()


    const storage = useAppSelector(SelectStorage)

    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const isCreate = index === 0;


    const dark = useAppSelector(SelectDarkMode)
    const [sign, setSign] = useState<number | undefined>(1)

    const [owners, setOwners] = useState<{ id: string, name: string; address: string; }[]>([])
    const [selectedBlockchain, setSelectedBlockchain] = useState<typeof Blockchains[0]>()



    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!selectedProvider) throw new Error("No provider selected")
            if (!selectedBlockchain) throw new Error("No blockchain selected")

            let image: Image | null = null;
            if (imageURL && imageType) {
                image = {
                    blockchain: selectedBlockchain.name,
                    imageUrl: imageURL,
                    nftUrl: imageURL,
                    tokenId: null,
                    type: imageType,
                }
            }

            let multisig: IAccount;
            if (isCreate) {
                if (owners.length === 0) throw new Error("No owners added")
                if ((data.threshold ?? 0) > owners.length) throw new Error("Threshold is greater than number of owners")
                if (!address) throw new Error("No address")
                const Owners = [...owners, { name: data.ownerName, address }]

                multisig =
                    await createMultisigAccount(
                        Owners,
                        data.name,
                        data.threshold ?? 1,
                        data.threshold ?? 1,
                        image,
                        "organization",
                        selectedProvider.name,
                        selectedBlockchain.name
                    )
            } else {
                if (!data.multisigAddress) throw new Error("No owners added")

                multisig =
                    await importMultisigAccount(
                        data.multisigAddress,
                        data.name,
                        image,
                        "organization",
                        selectedProvider.name,
                        selectedBlockchain.name
                    )
            }

            navigate.push('/dashboard')

        } catch (error) {
            const err = error as any
            console.error(err)
            ToastRun(<div>{err.message}</div>, "error")
        }
    };


    const addOwner = () => {
        setOwners([...owners, { id: nanoid(), name: "", address: "" }])
    }

    const removeOwner = (id: string) => {
        setOwners(owners.filter(s => s.id !== id))
        if (sign && sign > owners.length - 1) {
            setSign(owners.length)
        }
    }

    const changeOwner = (id: string, name: string, address: string) => {
        setOwners(owners.map(s => s.id === id ? { ...s, name, address } : s))
    }


    const pages = [
        {
            to: "/create-multisig",
            text: "Create Multisig"
        },
        {
            to: "/create-multisig?index=1",
            text: "Import Multisig"
        }
    ]

    const [imageURL, setImageURL] = useState<string>();
    const [imageType, setImageType] = useState<"image" | "nft">()

    const onAvatarChange = (url: string, type: "image" | "nft") => {
        setImageURL(url);
        setImageType(type);
    };

    const [selectedProvider, setSelectedProvider] = useState<typeof multisigProviders[0]>()

    const multisigProviders = useMemo(() => {
        if (selectedBlockchain) {
            return Blockchains.find(s => s.name === selectedBlockchain.name)?.multisigProviders ?? []
        }
        return []
    }, [selectedBlockchain])

    const [isLoading, OnSubmit] = useLoading(onSubmit)


    return <div className="h-screen w-full">
        <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={dark ? "/logo_beta.svg" : "/logo_white_beta.svg"} alt="" width="150" height="40" />
            </div>
        </header>
        <form onSubmit={handleSubmit(OnSubmit)} className="py-[10rem] sm:py-0 sm:h-full " >
            <section className="flex flex-col items-center h-full gap-6 pt-36">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-6xl dark:text-white text-center font-semibold">Set Account Details</div>
                    <div className="flex px-10 pt-2 w-full justify-between">
                        <AnimatedTabBar data={pages} index={index} className={'!text-lg'} fontSize={"!text-sm"}/>
                    </div>
                </div>
                <div className="flex flex-col px-3 space-y-6 items-center justify-start min-w-[25%]">
                    <EditableAvatar
                        avatarUrl={null}
                        name={"random"}
                        blockchain={selectedBlockchain}
                        evm={selectedBlockchain?.name !== "solana"}
                        userId={`accounts/${nanoid()}`}
                        onChange={onAvatarChange}
                    />

                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <Dropdown
                            list={Blockchains}
                            selected={selectedBlockchain}
                            setSelect={setSelectedBlockchain}
                            label="Blockchain"
                        />
                    </div>
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <Dropdown
                            inputProps={{ style: { fontSize: '0.875rem' } }}
                            labelSX={{
                                fontSize: '0.875rem',
                                top: 2
                            }}
                            className='bg-light dark:bg-darkSecond'
                            list={multisigProviders.filter(s=> isCreate ? s.name !== "Celo Terminal" : true)}
                            selected={selectedProvider}
                            setSelect={setSelectedProvider}
                            label="Multisig Provider"
                        />
                    </div>
                    {!isCreate && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className={`flex items-center gap-3 w-full rounded-lg`}>
                            <TextField
                                InputLabelProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                label="Multisig Address" {...register("multisigAddress", { required: true })} className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" placeholder='E.g. 0xabcd...' />
                        </div>
                    </div>}
                    <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className={` flex items-center gap-3 w-full rounded-lg`}>
                            <TextField
                                InputLabelProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                label="Name"  {...register("name", { required: true })} placeholder="E.g. Community Treasury" className="bg-white dark:bg-darkSecond h-[3.4rem] rounded-lg w-full px-1" />
                        </div>
                    </div>

                    <div className='flex flex-col space-y-5 w-full'>
                        {isCreate && <div className="text-greylish opacity-35 w-full text-xs">{isCreate ? "Owners" : "You"}</div>}
                        <div className="grid grid-cols-[25%,5%,70%]">
                            <TextField
                                InputLabelProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                {...register("ownerName")} className="cursor-pointer border p-3 rounded-md  outline-none w-full dark:bg-darkSecond" label="Name" />
                            <div></div>
                            <TextField
                                InputLabelProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                disabled className="cursor-pointer border p-3 rounded-md w-full bg-greylish bg-opacity-20  outline-none  dark:bg-darkSecond" value={address !== null ? `${AddressReducer(address)} (You)` : ""} />
                        </div>
                        {isCreate && owners.map((w, i) => {
                            return <div key={w.id} className="relative grid grid-cols-[25%,5%,70%]">
                                <TextField
                                    InputLabelProps={{
                                        style: {
                                            fontSize: "0.875rem"
                                        }
                                    }}
                                    InputProps={{
                                        style: {
                                            fontSize: "0.875rem"
                                        }
                                    }}
                                    type="text" label="Name" className="cursor-pointer rounded-md  dark:bg-darkSecond" value={w.name} onChange={(e) => changeOwner(w.id, e.target.value, w.address)} />
                                <div></div>
                                <TextField
                                    InputLabelProps={{
                                        style: {
                                            fontSize: "0.875rem"
                                        }
                                    }}
                                    InputProps={{
                                        style: {
                                            fontSize: "0.875rem"
                                        }
                                    }}
                                    type="text" label="Address" className="cursor-pointer ml-4 rounded-md  bg-greylish bg-opacity-20  dark:bg-darkSecond" onChange={(e) => changeOwner(w.id, w.name, e.target.value)} value={w.address !== null ? AddressReducer(w.address) : ""} />
                                <div className="absolute right-0 top-1/2 translate-x-[150%] -translate-y-1/2 cursor-pointer" onClick={() => removeOwner(w.id)}>
                                    <BiTrash />
                                </div>
                            </div>
                        })}
                        {isCreate && <div className="flex flex-col items-start mb-4  w-full ">
                            <div className="cursor-pointer text-center text-primary opacity-80 px-3  dark:opacity-100" onClick={() => addOwner()}>+ Add owner</div>
                        </div>}
                    </div>
                    {isCreate && <div className="flex flex-col mb-4 space-y-5 w-full">
                        <span className="text-greylish opacity-35 text-xs">Minimum confirmations required for any transactions</span>
                        <div className="space-x-5 flex justify-start items-center">
                            <TextField
                                InputLabelProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                InputProps={{
                                    style: {
                                        fontSize: "0.875rem"
                                    }
                                }}
                                type="number" {...register("threshold", { required: true, valueAsNumber: true, max: (owners.length + 1) })} className="unvisibleArrow border p-3 mr-4 rounded-md outline-none w-[25%] dark:bg-darkSecond" value={sign} onChange={(e) => { if (!isNaN(+e.target.value) && +e.target.value <= owners.length + 1) { setSign(+e.target.value || undefined) } }} />
                            <p className="text-greylish text-xs">out of {owners.length + 1} owners</p>
                        </div>
                    </div>}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 w-full pb-10">
                        <Button version="second" onClick={() => navigate.push('/create-organization')}>Back</Button>
                        <Button type="submit" isLoading={isLoading}>{isCreate ? "Create" : "Import"}</Button>
                    </div>
                </div>
            </section>
        </form>
    </div>

}


CreateMultisig.disableLayout = true
CreateMultisig.disableGuard = true
export default CreateMultisig