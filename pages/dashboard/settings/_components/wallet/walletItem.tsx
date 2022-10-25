import { Accordion, AccordionDetails, AccordionSummary, Avatar, AvatarGroup, TextField, Tooltip } from '@mui/material';
import Button from 'components/button';
import EditableAvatar from 'components/general/EditableAvatar';
import EditableTextInput from 'components/general/EditableTextInput';
import Modal from 'components/general/modal';
import makeBlockie from 'ethereum-blockies-base64';
import useLoading from 'hooks/useLoading';
import useMultisig from 'hooks/walletSDK/useMultisig';
import { IAccountORM } from 'pages/api/account/index.api';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IoPersonAddSharp, IoTrashOutline } from 'react-icons/io5';
import { MdKeyboardArrowRight, MdPublishedWithChanges } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccountType, SelectBlockchain, SelectCurrencies, SelectFiatPreference, SelectFiatSymbol, SelectID, SelectIndividual, SelectOrganization, SelectPriceCalculationFn } from 'redux/slices/account/selector';
import { Remove_Account_From_Individual, Remove_Account_From_Organization, Update_Account_Image, Update_Account_Name } from 'redux/slices/account/thunks/account';
import { Blockchains } from 'types/blockchains';
import { AddressReducer } from 'utils';
import { NG } from 'utils/jsxstyle';
import { ToastRun } from 'utils/toast';
import OwnerItem from './OwnerItem';


function WalletItem({ item }: { item: IAccountORM }) {
    const { handleSubmit: handleAddOwnerSubmit, register: registerAddOwner } = useForm()
    const { handleSubmit: handleThresholdSubmit, register: registerThreshold } = useForm()

    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const [deleteModal, setDeleteModal] = useState(false)
    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [changeThresholdModal, setChangeThresholdModal] = useState(false)

    const [addOwnerImageURL, setAddOwnerImageURL] = useState<string>()
    const [addOwnerImageType, setAddOwnerImageType] = useState<'image' | 'nft'>('image')

    const dispatch = useAppDispatch()
    const coins = useAppSelector(SelectCurrencies)
    const blockchain = useAppSelector(SelectBlockchain)
    const accountType = useAppSelector(SelectAccountType)
    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const id = useAppSelector(SelectID)
    const preference = useAppSelector(SelectFiatPreference)
    const calculatePrice = useAppSelector(SelectPriceCalculationFn)
    const symbol = useAppSelector(SelectFiatSymbol)



    const totalValue = useMemo(() => {
        return item.coins.reduce((a, b) => {
            return a + calculatePrice(b)
        }, 0)
    }, [item, coins, preference])

    const { addOwner, changeSigns } = useMultisig()

    const updateAccountName = async (val: string) => {
        await dispatch(Update_Account_Name({
            account: {
                id: item.id,
                address: item.address,
                blockchain: item.blockchain,
                name: val,
                created_date: item.created_date,
                pendingMembersObjects: item.pendingMembersObjects,
                createdBy: item.createdBy,
                image: item.image,
                mail: item.mail,
                members: item.members,
                provider: item.provider,
                signerType: item.signerType,
            },
            name: val
        })).unwrap()
    }

    const updateImage = async (url: string, type: "image" | "nft") => {
        console.log(url)
        await dispatch(Update_Account_Image({
            account: {
                address: item.address,
                blockchain: item.blockchain,
                name: item.name,
                created_date: item.created_date,
                pendingMembersObjects: item.pendingMembersObjects,
                image: item.image,
                createdBy: item.createdBy,
                id: item.id,
                mail: item.mail,
                members: item.members,
                provider: item.provider,
                signerType: item.signerType,
            },
            image: {
                blockchain: blockchain.name,
                imageUrl: url,
                nftUrl: url,
                tokenId: null,
                type
            }
        }))
    }

    const deleteWallet = async () => {
        try {
            if (!id) return ToastRun(<>Cannot find your session</>, "error")
            if (accountType === "individual") {
                if (!individual) return ToastRun(<>Cannot find your session</>, "error")
                await dispatch(Remove_Account_From_Individual({
                    account: item,
                    individual: individual,
                    userId: id
                }))
            } else {
                if (!organization) return ToastRun(<>Cannot find your session</>, "error")
                await dispatch(Remove_Account_From_Organization({
                    account: item,
                    organization: organization,
                    userId: id
                }))
            }
        } catch (error) {
            ToastRun(<>Error deleting wallet</>, "error")
            console.log(error)
        }
    }


    const addNewOwner = async (data: { name: string, address: string, mail?: string }) => {
        try {
            if (!item.provider) return ToastRun(<>Cannot find the account's multisig provider</>, "error")
            await addOwner(item, data.address, data.name, addOwnerImageURL ? {
                blockchain: item.blockchain,
                imageUrl: addOwnerImageURL,
                nftUrl: addOwnerImageURL,
                tokenId: null,
                type: addOwnerImageType
            } : null, data.mail, item.provider)
            ToastRun(<>Transaction is created</>, "success")
            setAddOwnerModal(false)
        } catch (error) {
            ToastRun(<>Be sure there is no another owner addition transaction</>, "error")
        }
    }

    const changeThreshold = async (data: { threshold: number }) => {
        if (!item.provider) return ToastRun(<>Cannot find the account's multisig provider</>, "error")
        await changeSigns(item, data.threshold, data.threshold, true, false, item.provider)
        ToastRun(<>Transaction is created</>, "success")
        setChangeThresholdModal(false)
    }

    const [addOwnerLoading, AddOwner] = useLoading(addNewOwner)
    const [changeThresholdLoading, ChangeThreshold] = useLoading(changeThreshold)
    const [deleteLoading, DeleteWallet] = useLoading(deleteWallet)
    const [isAccordionOpend, setAccordionOpend] = useState(false)

    const handleChange =
        () => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setAccordionOpend(!!newExpanded);
        };

    return <>
        <div onClick={(event) => {
            if (item.multidata) {
                setAccordionOpend(!isAccordionOpend)
            }
        }} className="cursor-pointer">
            <Accordion expanded={isAccordionOpend} onChange={handleChange()} className="border-0 !shadow-none" TransitionProps={{
                className: "dark:!bg-dark !bg-light",
            }}>
                <div className={`bg-white dark:bg-darkSecond rounded-md shadow-custom p-5 pr-9 grid grid-cols-[2.5%,25%,20%,25%,7.5%,1fr]`} >
                    <div className='flex items-center'>
                        {item.multidata && <MdKeyboardArrowRight color='#C4C4C4' className='font-semibold cursor-pointer' size={25} style={{
                            transform: isAccordionOpend ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: "all 0.1s ease-in-out"
                        }} />}
                    </div>
                    <div className="flex items-center justify-start gap-2" onClick={event => event.stopPropagation()}>
                        <EditableAvatar
                            avatarUrl={(typeof item.image?.imageUrl === "string" ? item.image?.imageUrl : null) ?? item.image?.nftUrl ?? null}
                            name={item.name}
                            blockchain={Object.values(Blockchains).find(b => b.name === item.blockchain)!}
                            evm={item.blockchain !== "solana"}
                            userId={item.address}
                            onChange={updateImage}
                            size={3}
                        />
                        <div className="flex flex-col">
                            <div className="">
                                <EditableTextInput defaultValue={item.name} onSubmit={updateAccountName} placeholder="Name" />
                            </div>
                            <span className="text-greylish dark:text-white text-xs mx-2">{AddressReducer(item.address)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="text-base font-medium">
                            {fiatSymbol}
                            <NG number={totalValue} decimalSize={80} />
                        </div>
                    </div>
                    <div className={`flex items-center justify-center`}>
                        <span className={`${!item.multidata && "hidden"} text-sm`}>{item.multidata?.threshold.sign} out of {item.multidata?.owners.length} owners</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="flex pl-3">
                            <AvatarGroup max={3}>
                                {item.members.map((member) => <Avatar key={member.id} alt={member.name} src={individual?.accounts?.[0].id === member.address ? individual.image?.imageUrl ?? makeBlockie(individual?.name || "random") : member.image?.imageUrl ?? member.image?.nftUrl ?? makeBlockie(member?.name || "random")} />)}
                            </AvatarGroup>
                        </div>
                    </div>
                    <div className="flex space-x-3 justify-end items-center" onClick={event => event.stopPropagation()}>
                        {item.signerType === "multi" && <>
                            <div className="cursor-pointer" onClick={() => setAddOwnerModal(true)}>
                                <Tooltip title={"Add a new owner"}>
                                    <IoPersonAddSharp size={20} />
                                </Tooltip>
                            </div>
                            <div className="cursor-pointer" onClick={() => setChangeThresholdModal(true)}>
                                <Tooltip title={"Change threshold"}>
                                    <MdPublishedWithChanges size={20} />
                                </Tooltip>
                            </div>
                        </>}
                        <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                            <IoTrashOutline size={20} className="hover:text-red-500" />
                        </div>
                    </div>
                </div>
                {item.multidata && <AccordionDetails className='!ml-[9%] bg-white dark:bg-darkSecond shadow-custom mt-1 rounded-sm' onClick={event => event.stopPropagation()}>
                    {item.members.map((s, i) => <div key={s.id} className={`${i !== item.members.length - 1 && "border-b dark:border-gray-500 py-3"}`}>
                        <OwnerItem item={s} account={item} />
                    </div>)}
                </AccordionDetails>}
            </Accordion>
        </div>
        {deleteModal &&
            <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <div className="flex flex-col space-y-8 items-center">
                    <div className="text-2xl text-primary">Are You Sure?</div>
                    <div className="flex items-center justify-center text-xl">
                        You Are About Delete This Wallet
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setDeleteModal(false) }}>No</Button>
                        <Button className="w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={DeleteWallet} isLoading={deleteLoading}>Yes</Button>
                    </div>
                </div>
            </Modal>}
        {addOwnerModal &&
            <Modal onDisable={setAddOwnerModal} animatedModal={false} disableX={true} className={'!pt-6 !w-[30%]'}>
                <form onSubmit={handleAddOwnerSubmit(AddOwner)} className="flex flex-col gap-7">
                    <div className={`flex justify-center flex-shrink-0 flex-grow-0`}>
                        <EditableAvatar
                            avatarUrl={null}
                            name={"random"}
                            blockchain={blockchain}
                            evm={blockchain.name !== "solana"}
                            userId={`${id ?? ""}/accounts/${item.id}`}
                            onChange={(url, type) => { setAddOwnerImageURL(url); setAddOwnerImageType(type) }}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <TextField label="Owner Name" type="text" {...registerAddOwner("name", { required: true })} placeholder="E.g: Jessy" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <TextField label="Owner Address" type="text" {...registerAddOwner("address", { required: true })} placeholder="0x0000000000000000000000000000000000000000" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <TextField label="Owner Email" type="email" {...registerAddOwner("mail", { required: false })} placeholder="remox@remox.io" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                        <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { setAddOwnerModal(false) }}>
                            Close
                        </Button>
                        <Button type='submit' className="px-6 py-3 rounded-md" isLoading={addOwnerLoading}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>}
        {changeThresholdModal &&
            <Modal onDisable={setChangeThresholdModal} animatedModal={false} disableX={true} className={'!pt-6 !w-[30%]'}>
                <form onSubmit={handleThresholdSubmit(ChangeThreshold)} className="flex flex-col gap-7">
                    <div className="flex flex-col gap-1">
                        <TextField defaultValue={item.multidata?.threshold.sign} label="Threshold" type="number" {...registerThreshold("threshold", { required: true, valueAsNumber: true })} placeholder="E.g: 5" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                        <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { setChangeThresholdModal(false) }}>
                            Close
                        </Button>
                        <Button type='submit' className="px-6 py-3 rounded-md" isLoading={changeThresholdLoading}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>}
    </>
}

export default WalletItem