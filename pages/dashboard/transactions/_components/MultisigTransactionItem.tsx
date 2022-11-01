import useMultisig, { ITransactionMultisig } from 'hooks/walletSDK/useMultisig'
import { forwardRef, useState } from 'react'
import { TransactionDirection } from 'types'
import { TransactionDirectionImageNameDeclaration } from "utils";
import { IAccount } from 'firebaseConfig';
import { AiFillRightCircle } from 'react-icons/ai';
import { CoinDesignGenerator } from './CoinsGenerator';
import { ERCMethodIds, GenerateTransaction, IAddOwner, IAutomationCancel, IAutomationTransfer, IBatchRequest, IChangeThreshold, IRemoveOwner, ISwap, ITransfer } from 'hooks/useTransactionProcess';
import { ITag } from 'pages/api/tags/index.api';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectID, SelectProviderAddress, SelectAlldRecurringTasks } from 'redux/slices/account/selector';
import { BlockchainType } from 'types/blockchains';
import { ToastRun } from 'utils/toast';
import { AddTransactionToTag } from 'redux/slices/account/thunks/tags';
import { nanoid } from '@reduxjs/toolkit';
import dateFormat from "dateformat";
import Image from 'next/image';
import Dropdown from 'components/general/dropdown';
import Detail from './Detail';
import useLoading from 'hooks/useLoading';
import { addConfirmation, changeToExecuted, increaseNonce, removeConfirmation, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import Loader from 'components/Loader';
import makeBlockie from 'ethereum-blockies-base64';
import { FiRepeat } from 'react-icons/fi';
import AddLabel from './tx/AddLabel';
import { ClickAwayListener, FormControl, InputAdornment, TextField, Tooltip } from '@mui/material';
import { Add_Tx_To_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { DecimalConverter } from 'utils/api';
import { BiSearch } from 'react-icons/bi';
import useAllowance from 'rpcHooks/useAllowance';
import { useCelo } from '@celo/react-celo';


interface IProps {
    isDetailOpen?: boolean,
    address: string | undefined,
    tx: ITransactionMultisig,
    blockchain: BlockchainType,
    direction: TransactionDirection,
    tags: ITag[],
    txPositionInRemoxData: number,
    account?: IAccount
}
const MultisigTx = forwardRef<HTMLDivElement, IProps>(({ tx, blockchain, direction, tags, txPositionInRemoxData, account, isDetailOpen }, ref) => {
    const transaction = tx.tx;
    const timestamp = tx.timestamp;
    const [isLabelActive, setLabelActive] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<ITag>();
    const [labelLoading, setLabelLoading] = useState(false)
    const [openDetail, setOpenDetail] = useState(isDetailOpen ?? false)
    const [addLabelModal, setAddLabelModal] = useState(false);
    const {allow} = useAllowance()
    const {address} = useCelo()


    const providerAddress = useAppSelector(SelectProviderAddress)
    const id = useAppSelector(SelectID)
    const streamings = useAppSelector(SelectAlldRecurringTasks)



    const dispatch = useAppDispatch();


    const { executeTransaction, confirmTransaction, revokeTransaction } = useMultisig()

    let transfer = [ERCMethodIds.transfer, ERCMethodIds.noInput, ERCMethodIds.transferFrom, ERCMethodIds.transferWithComment, ERCMethodIds.repay, ERCMethodIds.borrow, ERCMethodIds.deposit, ERCMethodIds.withdraw].indexOf(transaction.id ?? "") > -1 ? transaction as ITransfer : null;
    const transferBatch = transaction.id === ERCMethodIds.batchRequest ? transaction as unknown as IBatchRequest : null;
    const automation = transaction.id === ERCMethodIds.automatedTransfer ? transaction as unknown as IAutomationTransfer : null;
    const automationBatch = transaction.id === ERCMethodIds.automatedBatchRequest ? transaction as unknown as IBatchRequest : null;
    const automationCanceled = transaction.id === ERCMethodIds.automatedCanceled ? streamings.find(s => (s as IAutomationTransfer).streamId == (transaction as IAutomationCancel).streamId) as IAutomationTransfer : null;
    const swap = transaction.id === ERCMethodIds.swap ? transaction as unknown as ISwap : null;

    const addOwner = transaction.id === ERCMethodIds.addOwner ? transaction as unknown as IAddOwner : null;
    const removeOwner = transaction.id === ERCMethodIds.removeOwner ? transaction as unknown as IRemoveOwner : null;
    const changeThreshold = transaction.id === ERCMethodIds.changeThreshold ? transaction as unknown as IChangeThreshold : null;
    const changeInternalThreshold = transaction.id === ERCMethodIds.changeInternalThreshold ? transaction as unknown as IChangeThreshold : null;

    const confirmFn = async (rejection?: boolean) => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        let hash = rejection && tx.rejection ? tx.rejection.safeTxHash : tx.hashOrIndex
        await confirmTransaction(tx.contractAddress, hash, tx.provider)
        dispatch(addConfirmation({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: hash,
            provider: tx.provider,
            rejection: !!rejection,
            rejectionHash: null
        }))
    }

    const executeFn = async (rejection?: boolean) => {
        try {
            if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
            if (!account) return ToastRun(<>Cannot get your account</>, "error");
            let hash = rejection && tx.rejection ? tx.rejection.safeTxHash : tx.hashOrIndex
            // if (swap) {
            //     await allow(
            //         account.address,
            //         swap.coinIn,
            //         blockchain.swapProtocols[0].contractAddress,
            //         DecimalConverter(swap.amountIn, swap.coinIn.decimals).toString(),
            //         account.address
            //     );
            // }
            // if (automation) {
            //     await allow(
            //         account.address,
            //         automation.coin,
            //         blockchain.streamingProtocols[0].contractAddress,
            //         DecimalConverter(automation.amount, automation.coin.decimals).toString(),
            //         account.address
            //     )
            // }
            await executeTransaction(account, hash, tx.provider, rejection)
            if (tx.firstNonce) {
                dispatch(increaseNonce({
                    contractAddress: tx.contractAddress,
                    nonce: tx.firstNonce + 1,
                }))
            }
            dispatch(changeToExecuted({
                contractAddress: tx.contractAddress,
                ownerAddress: providerAddress,
                txid: hash,
                provider: tx.provider,
                rejection: !!rejection,
                rejectionHash: null
            }))
            if (tx.budget) {
                if (transfer || automation) {
                    const amount = (transfer?.amount ?? automation!.amount);
                    const token = (transfer?.coin ?? automation!.coin);
                    const ethAmount = DecimalConverter(amount, token.decimals);
                    await dispatch(Add_Tx_To_Budget_Thunk({
                        convertExecuted: true,
                        tx: {
                            amount: ethAmount,
                            contractAddress: tx.contractAddress,
                            contractType: "multi",
                            hashOrIndex: tx.hashOrIndex,
                            isSendingOut: true,
                            protocol: tx.provider,
                            timestamp: tx.timestamp,
                            token: transfer?.coin.symbol ?? automation!.coin.symbol,
                        },
                        budget: tx.budget,
                        isExecuted: true,
                    }))
                } else if (transferBatch || automationBatch) {
                    for (const transfer of (transferBatch?.payments ?? automationBatch!.payments)) {
                        const amount = (transfer?.amount ?? automation!.amount);
                        const token = (transfer?.coin ?? automation!.coin);
                        const ethAmount = DecimalConverter(amount, token.decimals);

                        await dispatch(Add_Tx_To_Budget_Thunk({
                            convertExecuted: true,
                            tx: {
                                amount: ethAmount,
                                contractAddress: tx.contractAddress,
                                contractType: "multi",
                                hashOrIndex: tx.hashOrIndex,
                                isSendingOut: true,
                                protocol: tx.provider,
                                timestamp: tx.timestamp,
                                token: transfer?.coin.symbol ?? automation!.coin.symbol,
                            },
                            budget: tx.budget,
                            isExecuted: true,
                        }))
                    }
                }
            }
        } catch (error) {
            console.log(error)
            ToastRun(<>Cannot execute transaction</>, "error");
        }
    }

    const revokeFn = async (rejection?: boolean) => {
        try {
            if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
            if (!account) return ToastRun(<>Cannot get your account</>, "error");
            let hash = tx.hashOrIndex

            const res = await revokeTransaction(account, hash, tx.provider, hash)
            dispatch(removeConfirmation({
                contractAddress: tx.contractAddress,
                ownerAddress: providerAddress,
                txid: hash,
                provider: tx.provider,
                rejection: !!rejection,
                rejectionHash: typeof res === "string" ? res : null
            }))
        } catch (error) {
            console.log(error)
            ToastRun(<>Cannot revoke transaction</>, "error");
        }
    }

    const [executeFnLoading, ExecuteFn] = useLoading(executeFn)
    const [confirmFnLoading, ConfirmFn] = useLoading(confirmFn)
    const [revokeFnLoading, RevokeFn] = useLoading(revokeFn)



    const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, true, account?.provider ?? undefined);


    const [tagName, setTagName] = useState<string>()
    let uniqTags = tags.filter(s => tx.tags?.findIndex(d => d.id === s.id) === -1)
    if (tagName) {
        uniqTags = uniqTags.filter(s => s.name.toLowerCase().startsWith(tagName?.toLowerCase()))
    }

    const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagName(e.target.value.trim())
    }

    const labelChangeFn = (val: ITag) => async () => {
        try {
            console.log(txPositionInRemoxData)
            if (!id) {
                return ToastRun(<>You do not have any id, please sign in again</>, "error");
            }
            setLabelLoading(true)
            await dispatch(AddTransactionToTag({
                tagId: val.id,
                transaction: {
                    id: nanoid(),
                    address: tx.contractAddress,
                    hash: tx.hashOrIndex,
                    contractType: "multi",
                    provider: account?.provider ?? null
                },
                txIndex: txPositionInRemoxData
            })).unwrap()
            setLabelLoading(false)
            setLabelActive(false)
        } catch (error) {
            ToastRun(<>{(error as any).message}</>, "error");
        }
    }

    const isApprovable = tx.confirmations.length >= tx.contractThresholdAmount
    const isRejected = tx.confirmations.length === 0



    return (
        <>
            <tr className={`pl-5 grid grid-cols-[8.5%,14.5%,16%,repeat(3,minmax(0,1fr)),22%] gap-y-5 py-5 bg-white dark:bg-darkSecond ${tx.rejection ? "mt-5" : "my-5"} rounded-md shadow-custom hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5`}>
                <td className="text-left p-0 flex space-x-2 rounded-md">
                    {(!tx.isExecuted || (tx.rejection && !tx.rejection.isExecuted)) && tx.nonce && <div className="font-medium text-sm w-6 h-6 bg-grey flex justify-center mt-1 rounded-md dark:text-black">{tx.nonce}</div>}
                    <div className="relative inlin leading-none">
                        <span className="font-medium text-sm">{dateFormat(new Date(+tx.timestamp * 1e3), "mmm dd")}</span>
                        <span className="text-xxs text-gray-400 absolute translate-y-[120%] top-[0.5rem] left-0">{dateFormat(new Date(+tx.timestamp * 1e3), "HH:MM")}</span>
                    </div>
                    {/* <div className="bg-light dark:bg-dark w-[150%] h-full mt-5 -ml-5"></div> */}
                </td>
                <td className="text-left p-0">
                    <div className="flex items-center space-x-3">
                        <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl ?? makeBlockie(account?.address ?? account?.name ?? "random")} className="w-[1.875rem] h-[1.875rem] rounded-full" />
                        <div className="text-sm truncate font-medium pr-5">
                            {account?.name ?? "N/A"}
                        </div>
                    </div>
                    {/* <div className="bg-light dark:bg-dark w-[75%] h-full mt-4"></div> */}
                </td>
                <td className="text-left flex">
                    <div className="grid grid-cols-[1.875rem,1fr] gap-x-[4px]">
                        <div className="w-[1.875rem] h-[1.875rem]">
                            <Image
                                src={image}
                                width="100%"
                                height="100%"
                                layout="responsive"
                                quality={100}
                                className="rounded-full"
                            />
                        </div>
                        <div className="grid grid-rows-[18px,12px] text-left">
                            <span className="font-medium text-left text-sm leading-none pt-[2px]">
                                {action}
                            </span>
                            <span className="text-xxs font-medium text-gray-500 dark:text-gray-200 leading-none">
                                {name}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="text-left">
                    {transfer && (
                        <CoinDesignGenerator transfer={transfer} timestamp={timestamp} />
                    )}
                    {
                        transferBatch && (
                            <div className="flex flex-col space-y-5">
                                {transferBatch.payments.map((transfer, i) => <CoinDesignGenerator key={i} transfer={transfer} timestamp={timestamp} />)}
                            </div>
                        )
                    }
                    {
                        automationBatch && (
                            <div className="flex flex-col space-y-5">
                                {automationBatch.payments.map((transfer, i) => <CoinDesignGenerator key={i} transfer={transfer} timestamp={timestamp} />)}
                            </div>
                        )
                    }
                    {
                        automationCanceled && <CoinDesignGenerator transfer={automationCanceled} timestamp={timestamp} />
                    }
                    {automation && (
                        <CoinDesignGenerator transfer={automation} timestamp={timestamp} />
                    )}
                    {swap && (
                        <div className="flex flex-col">
                            <CoinDesignGenerator transfer={{ amount: swap.amountIn, coin: swap.coinIn }} timestamp={timestamp} />
                            <div className="ml-[2px]">
                                <FiRepeat />
                            </div>
                            <div className="mt-1">
                                <CoinDesignGenerator transfer={{ amount: swap.amountOutMin, coin: swap.coinOutMin }} timestamp={timestamp} />
                            </div>
                        </div>
                    )}

                </td>
                <td className="text-left flex flex-col">
                    <div className="flex flex-col relative">
                        {
                            tx.tags?.map(tag => <div key={tag.id} className="flex space-x-2 min-h-[1.875rem]">
                                <div className="w-1 h-[80%]" style={{ backgroundColor: tag.color }}></div>
                                <span className="text-sm font-medium">{tag.name}</span>
                            </div>)
                        }
                        {tx.tags.length === 0 && <div>
                            {labelLoading ? <Loader /> : <span className="text-primary cursor-pointer text-sm font-medium" onClick={() => setLabelActive(!isLabelActive)}>
                                + Add Label
                            </span>}
                        </div>}
                        {isLabelActive && (
                            <ClickAwayListener onClickAway={() => {
                                setLabelActive(false)
                            }}>
                                <div className="absolute z-[9999] -bottom-1 w-full bg-white dark:bg-darkSecond translate-y-full rounded-md border border-gray-500 h-[10.5rem] overflow-y-hidden">
                                    <div className="flex flex-col items-center overflow-y-scroll h-full">
                                        <div className={`flex space-x-2 text-primary py-2  cursor-pointer w-full text-left px-1 h-12`}>
                                            <div className='w-full'>
                                                <FormControl fullWidth>
                                                    <TextField
                                                        placeholder='Search'
                                                        inputProps={{ style: { width: '100%' } }}
                                                        onChange={searching}
                                                        InputProps={{
                                                            style: {
                                                                fontSize: '0.875rem',
                                                                width: '100%',
                                                                height: '30px'
                                                            },
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <BiSearch />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        variant="outlined"
                                                    />
                                                </FormControl>
                                            </div>
                                        </div>
                                        {/* <div onClick={() => { setAddLabelModal(true); setLabelActive(false); }} className="text-xs text-primary py-2 hover:bg-gray-100 rounded-t-md hover:dark:bg-gray-800 cursor-pointer w-full text-left border-b border-greylish pl-2 font-medium">+ New Label</div> */}
                                        {uniqTags.map((e, i) => {
                                            return <div key={e.id} onClick={() => { labelChangeFn(e)(); setLabelActive(false) }} className={`h-10 flex space-x-2 text-primary py-2 hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer w-full text-left pl-2 ${i !== uniqTags.length - 1 ? "border-b border-greylish" : " rounded-b-md"}`}>
                                                <div className="w-1 h-4" style={{ backgroundColor: e.color }}></div>
                                                <span className="text-xs font-medium">{e.name}</span>
                                            </div>
                                        })}
                                    </div>
                                </div>
                            </ClickAwayListener>
                        )}
                    </div>
                </td>
                <td className="text-left w-full">
                    <div>
                        <div className="flex items-center space-x-3 mb-[0.1875rem]">
                            <div className="flex space-x-1 items-center font-semibold">
                                <div className={`w-2 h-2 ${tx.isExecuted ? "bg-green-500" : isRejected ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                <div className='lg:text-sm 2xl:text-base'>{tx.isExecuted ? "Approved" : isRejected ? "Rejected" : "Pending"}</div>
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                                |
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                                {tx.isExecuted ? tx.contractThresholdAmount : tx.confirmations.length} <span className="font-thin">/</span> {tx.contractThresholdAmount}
                            </div>
                        </div>
                        <div className="h-[0.375rem] w-[90%] rounded-lg bg-gray-300 relative" >
                            <div className={`absolute left-0 top-0 h-[0.375rem] ${tx.isExecuted ? "bg-green-500" : tx.confirmations.length === 0 ? "bg-red-600" : "bg-primary"} rounded-lg`} style={{
                                width: tx.isExecuted ? "100%" : Math.min(((tx.confirmations.length / tx.contractThresholdAmount) * 100), 100).toFixed(2) + "%"
                            }} />
                        </div>
                    </div>
                </td>
                <td className="text-left">
                    <div className="flex justify-end space-x-3 pr-5 text-xs items-start h-full">
                        {tx.contractOwners.find(s => s.toLowerCase() === providerAddress?.toLowerCase()) ? (tx.isExecuted || tx.rejection?.isExecuted ? <></> :
                            <>
                                {tx.provider === "GnosisSafe" && !tx.rejection && <div className="w-20 min-h-[1.875rem] py-1 px-1 cursor-pointer border border-red-500 text-red-500 hover:bg-red-300 hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2" onClick={() => RevokeFn(false)}>
                                    <span className="tracking-wider" >
                                        {revokeFnLoading ? <Loader size={14} /> : "Reject"}
                                    </span>
                                </div>}
                                {!tx.confirmations.find(s => s.toLowerCase() === providerAddress?.toLowerCase()) && tx.contractThresholdAmount > tx.confirmations.length ?
                                    <>
                                        <div className="w-20 min-h-[1.875rem] py-1 px-1 cursor-pointer border border-primary text-primary hover:bg-primary hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2 text-sm" onClick={() => ConfirmFn(false)}>
                                            <span className="tracking-wider" >
                                                {confirmFnLoading ? <Loader size={14} /> : "Sign"}
                                            </span>
                                        </div>
                                    </> :
                                    isApprovable ?
                                        tx.firstNonce !== tx.nonce ?
                                            <Tooltip title="Please, finish to execute previous transactions">
                                                <div className="w-20 min-h-[1.875rem] py-1 px-1 text-xs cursor-pointer border border-grey text-grey hover:bg-gray-400 hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2">
                                                    <div className="tracking-wider" >
                                                        {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                                    </div>
                                                </div>
                                            </Tooltip> : <div className="w-20 min-h-[1.875rem] py-1 px-1 text-xs cursor-pointer border border-primary text-primary hover:bg-primary hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2" onClick={() => ExecuteFn(false)}>
                                                <div className="tracking-wider" >
                                                    {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                                </div>
                                            </div> :
                                        <>
                                            {tx.provider === "Celo Terminal" &&
                                                <div className="w-20 min-h-[1.875rem] py-1 px-1 cursor-pointer border border-primary text-primary hover:bg-primary hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2" onClick={() => RevokeFn(false)}>
                                                    <span className="tracking-wider" >
                                                        {revokeFnLoading ? <Loader size={14} /> : "Revoke"}
                                                    </span>
                                                </div>
                                            }
                                        </>
                                }
                            </>
                        )
                            :
                            <div className="py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                <span className="tracking-wider">
                                    You're not an owner
                                </span>
                            </div>
                        }
                        <div className="cursor-pointer w-5 pt-1" onClick={() => setOpenDetail(true)}>
                            <AiFillRightCircle className='text-primary hover:text-secondary' size={24} />
                        </div>
                    </div>
                </td>
            </tr>
            {tx.rejection && (!tx.isExecuted) && <tr className="pl-5 grid grid-cols-[8.5%,14.5%,16%,repeat(3,minmax(0,1fr)),22%] gap-y-5 pb-5 bg-white dark:bg-darkSecond mb-5 rounded-md hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5">
                <>
                    <td className="bg-light dark:bg-dark -ml-6 w-full -mb-6 p-0"></td>
                    <td className="bg-light dark:bg-dark -ml-6 w-full -mb-6 p-0"></td>
                    <td className="border-t dark:border-gray-700 border-gray-100 -mx-6 pl-6 flex items-end">
                        <div className="grid grid-cols-[1.875rem,1fr] gap-x-[4px]">
                            <div className="w-[1.875rem] h-[1.875rem]">
                                <Image
                                    src={image}
                                    width="100%"
                                    height="100%"
                                    layout="responsive"
                                    quality={100}
                                    className="rounded-full"
                                />
                            </div>
                            <div className="grid grid-rows-[18px,12px] text-left">
                                <span className="font-medium pt-[2px] leading-none text-left text-sm text-[#E84142]">
                                    Reject
                                </span>
                                <span className="text-xxs text-gray-500 dark:text-gray-200 leading-none">
                                    {name}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="border-t dark:border-gray-700 border-gray-100"></td>
                    <td className="border-t dark:border-gray-700 border-gray-100"></td>
                    <td className="self-center w-[100%] h-full border-t dark:border-gray-700 border-gray-100 pt-5">
                        <div className="flex items-center space-x-3 mb-[0.1875rem]">
                            <div className="flex space-x-1 items-center font-semibold">
                                <div className={`w-2 h-2 ${tx.rejection.isExecuted ? "bg-green-500" : tx.rejection.isExecuted ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                <div className='lg:text-sm 2xl:text-base'>{tx.rejection.isExecuted ? "Rejected" : "Pending"}</div>
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                                |
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                                {tx.rejection.isExecuted ? tx.contractThresholdAmount : tx.rejection.confirmations.length} <span className="font-thin">/</span> {tx.contractThresholdAmount}
                            </div>
                        </div>
                        <div className="h-[0.375rem] w-[90%] rounded-lg bg-gray-300 relative" >
                            <div className={`absolute left-0 top-0 h-[0.375rem] ${tx.rejection.isExecuted ? "bg-green-500" : tx.rejection.confirmations.length === 0 || tx.rejection.isExecuted ? "bg-red-600" : "bg-primary"} rounded-lg`} style={{
                                width: tx.rejection.isExecuted ? "100%" : Math.min(((tx.rejection.confirmations.length / tx.contractThresholdAmount) * 100), 100).toFixed(2) + "%"
                            }} />
                        </div>
                    </td>
                    <td className="p-0">
                        <div className="flex items-end h-full justify-end pr-5 space-x-3 border-t border-gray-100 dark:border-gray-700 pb-2">
                            {tx.contractOwners.find(s => s.toLowerCase() === providerAddress?.toLowerCase()) &&
                                (!(tx.rejection.isExecuted || tx.isExecuted) &&
                                    !tx.rejection.confirmations.some(s => s.owner.toLowerCase() === providerAddress?.toLowerCase()) && tx.contractThresholdAmount > tx.rejection.confirmations.length ?
                                    <div className="w-20 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2 text-sm" onClick={() => ConfirmFn(true)}>
                                        <div className="tracking-wider" >
                                            {confirmFnLoading ? <Loader size={14} /> : "Sign"}
                                        </div>
                                    </div> :
                                    tx.contractThresholdAmount <= tx.rejection.confirmations.length ?
                                        tx.firstNonce !== tx.nonce ? <Tooltip title="Please, finish to execute previous transactions">
                                            <div className="w-20 min-h-[1.875rem] py-1 px-1 text-xs cursor-pointer border border-grey text-grey hover:bg-gray-400 hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2">
                                                <div className="tracking-wider" >
                                                    {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                                </div>
                                            </div>
                                        </Tooltip> : <div className="w-20 min-h-[1.875rem] py-1 px-1 text-xs cursor-pointer border border-primary text-primary hover:bg-primary hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2" onClick={() => ExecuteFn(true)}>
                                            <div className="tracking-wider" >
                                                {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                            </div>
                                        </div>
                                        :
                                        <></>
                                )
                            }
                            {!tx.contractOwners.find(s => s.toLowerCase() === providerAddress?.toLowerCase()) &&
                                (!(tx.rejection.isExecuted || tx.isExecuted) &&
                                    !tx.rejection.confirmations.some(s => s.owner.toLowerCase() === providerAddress?.toLowerCase()) && tx.contractThresholdAmount > tx.rejection.confirmations.length ?
                                    <Tooltip title="You are not an owner">
                                        <div className="w-20 min-h-[1.875rem] py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2 text-sm">
                                            <div className="tracking-wider" >
                                                {confirmFnLoading ? <Loader size={14} /> : "Sign"}
                                            </div>
                                        </div>
                                    </Tooltip>
                                    :
                                    tx.contractThresholdAmount <= tx.rejection.confirmations.length ?
                                        <Tooltip title="You are not an owner">
                                            <div className="w-20 min-h-[1.875rem] py-1 px-1 text-xs cursor-pointer border border-primary text-primary hover:bg-primary hover:bg-opacity-10 rounded-md flex items-center justify-center space-x-2">
                                                <div className="tracking-wider" >
                                                    {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                                </div>
                                            </div>
                                        </Tooltip>
                                        :
                                        <></>
                                )
                            }
                            <div className="cursor-pointer w-5">

                            </div>
                        </div>
                    </td>
                </>
            </tr>}
            <Detail
                transaction={{
                    ...transaction,
                    rawData: GenerateTransaction({}),
                    isError: false,
                    tags: tags,
                    timestamp: tx.timestamp,
                    budget: tx.budget ?? undefined,
                    address: tx.contractAddress,
                    hash: tx.hashOrIndex,
                    id: tx.tx.id ?? ERCMethodIds.noInput,
                    method: tx.tx.method ?? ERCMethodIds.noInput,
                }}
                direction={direction}
                txIndex={txPositionInRemoxData}
                action={action}
                isExecuted={tx.rejection?.isExecuted === true || tx.isExecuted === true}
                isMultisig={true}
                isRejected={isRejected}
                signers={tx.confirmations}
                tags={tx.tags}
                threshold={tx.contractThresholdAmount}
                timestamp={tx.timestamp}
                account={account}
                openDetail={openDetail}
                setOpenDetail={setOpenDetail}
            />
            {
                addLabelModal && <AddLabel
                    onSubmit={async (tag) => {
                        await labelChangeFn(tag)()
                    }}
                    setAddLabelModal={setAddLabelModal}
                />
            }
        </>
    );
})

export default MultisigTx