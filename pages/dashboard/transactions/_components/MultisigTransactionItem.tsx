import useMultisig, { ITransactionMultisig } from 'hooks/walletSDK/useMultisig'
import { forwardRef, useState } from 'react'
import { TransactionDirection } from 'types'
import { TransactionDirectionImageNameDeclaration } from "utils";
import { IAccount } from 'firebaseConfig';
import { AiFillRightCircle } from 'react-icons/ai';
import { CoinDesignGenerator } from './CoinsGenerator';
import { ERC20MethodIds, GenerateTransaction, IAddOwner, IAutomationCancel, IAutomationTransfer, IBatchRequest, IChangeThreshold, IRemoveOwner, ISwap, ITransfer } from 'hooks/useTransactionProcess';
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
import { addConfirmation, changeToExecuted, removeConfirmation, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import Loader from 'components/Loader';
import makeBlockie from 'ethereum-blockies-base64';
import { FiRepeat } from 'react-icons/fi';


interface IProps { isDetailOpen?: boolean, address: string | undefined, tx: ITransactionMultisig, blockchain: BlockchainType, direction: TransactionDirection, tags: ITag[], txPositionInRemoxData: number, account?: IAccount }
const MultisigTx = forwardRef<HTMLDivElement, IProps>(({ tx, blockchain, direction, tags, txPositionInRemoxData, account, isDetailOpen }, ref) => {
    const transaction = tx.tx;
    const timestamp = tx.timestamp;
    const [isLabelActive, setLabelActive] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<ITag>();
    const [labelLoading, setLabelLoading] = useState(false)
    const [openDetail, setOpenDetail] = useState(isDetailOpen ?? false)

    const providerAddress = useAppSelector(SelectProviderAddress)
    const id = useAppSelector(SelectID)
    const streamings = useAppSelector(SelectAlldRecurringTasks)



    const dispatch = useAppDispatch();


    const { executeTransaction, confirmTransaction, revokeTransaction } = useMultisig()

    const confirmFn = async () => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        await confirmTransaction(tx.contractAddress, tx.hashOrIndex, tx.provider)
        dispatch(addConfirmation({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: tx.hashOrIndex,
            provider: tx.provider
        }))
    }

    const executeFn = async () => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        await executeTransaction(tx.contractAddress, tx.hashOrIndex, tx.provider)
        dispatch(changeToExecuted({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: tx.hashOrIndex,
            provider: tx.provider
        }))
    }

    const revokeFn = async () => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        await revokeTransaction(tx.contractAddress, tx.hashOrIndex, tx.provider)
        dispatch(removeConfirmation({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: tx.hashOrIndex,
            provider: tx.provider
        }))
    }

    const [executeFnLoading, ExecuteFn] = useLoading(executeFn)
    const [confirmFnLoading, ConfirmFn] = useLoading(confirmFn)
    const [revokeFnLoading, RevokeFn] = useLoading(revokeFn)


    let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id ?? "") > -1 ? transaction as ITransfer : null;
    const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as unknown as IBatchRequest : null;
    const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as unknown as IAutomationTransfer : null;
    const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as unknown as IBatchRequest : null;
    const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? streamings.find(s => (s as IAutomationTransfer).streamId == (transaction as IAutomationCancel).streamId) as IAutomationTransfer : null;
    const swap = transaction.id === ERC20MethodIds.swap ? transaction as unknown as ISwap : null;

    const addOwner = transaction.id === ERC20MethodIds.addOwner ? transaction as unknown as IAddOwner : null;
    const removeOwner = transaction.id === ERC20MethodIds.removeOwner ? transaction as unknown as IRemoveOwner : null;
    const changeThreshold = transaction.id === ERC20MethodIds.changeThreshold ? transaction as unknown as IChangeThreshold : null;
    const changeInternalThreshold = transaction.id === ERC20MethodIds.changeInternalThreshold ? transaction as unknown as IChangeThreshold : null;

    const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, true, account?.provider ?? undefined);


    const uniqTags = tags.filter(s => tx.tags?.findIndex(d => d.id === s.id) === -1)

    const labelChangeFn = (val: ITag) => async () => {
        if (!id) {
            return ToastRun(<>You do not have any id, please sign in again</>, "success");
        }
        setLabelLoading(true)
        await dispatch(AddTransactionToTag({
            tagId: val.id,
            transaction: {
                id: nanoid(),
                address: tx.contractAddress,
                hash: tx.hashOrIndex,
                contractType: "multi",
                provider: account?.provider ?? null,
            },
            txIndex: txPositionInRemoxData
        })).unwrap()

        setLabelLoading(false)
        setLabelActive(false)
    }

    const isApprovable = tx.confirmations.length >= tx.contractThresholdAmount
    const isRejected = tx.confirmations.length === 0



    return (
        <>
            <tr className="pl-5 grid grid-cols-[8.5%,20%,18%,repeat(4,minmax(0,1fr))] py-5 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom">
                <td className="text-left">
                    <div className="relative inline">
                        <span className="font-medium text-sm">{dateFormat(new Date(+tx.timestamp * 1e3), "mmm dd")}</span>
                        <span className="text-xxs text-gray-400 absolute translate-y-[120%] left-0">{dateFormat(new Date(+tx.timestamp * 1e3), "HH:MM")}</span>
                    </div>
                </td>
                <td className="text-left">
                    <div className="flex items-center space-x-3">
                        <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl ?? makeBlockie(account?.address ?? account?.name ?? "random")} className="w-7 h-7 rounded-full" />
                        <div className="text-sm truncate font-semibold pr-5">
                            {account?.name ?? "N/A"}
                        </div>
                    </div>
                </td>
                <td className="text-left">
                    <div className="flex space-x-3">
                        <div className="w-[2.5rem] h-[2.5rem]">
                            <Image
                                src={image}
                                width="100%"
                                height="100%"
                                layout="responsive"
                                quality={100}
                                className="rounded-full"
                            />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold text-left text-sm">
                                {action}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-200">
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
                        <div className="flex flex-col space-y-5">
                            <CoinDesignGenerator transfer={{ amount: swap.amountIn, coin: swap.coinIn }} timestamp={timestamp} />
                            <FiRepeat />
                            <CoinDesignGenerator transfer={{ amount: swap.amountOutMin, coin: swap.coinOutMin }} timestamp={timestamp} />
                        </div>
                    )}

                </td>
                <td className="text-left flex flex-col">
                    <div className="flex flex-col">
                        {
                            tx.tags?.map(tag => <div className="flex space-x-5" key={tag.id}>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                <span className="text-xs">{tag.name}</span>
                            </div>)
                        }
                        {uniqTags.length > 0 && (!isLabelActive ? <div>
                            <span className="text-primary cursor-pointer text-sm" onClick={() => setLabelActive(true)}>
                                + Add Label
                            </span>
                        </div> :
                            <div className="w-1/2 h-5">
                                <Dropdown
                                    runFn={labelChangeFn}
                                    loading={labelLoading}
                                    selected={selectedLabel}
                                    setSelect={setSelectedLabel}
                                    list={uniqTags}
                                />
                            </div>)
                        }
                    </div>
                </td>
                <td className="text-left w-[95%]">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="flex space-x-1 items-center font-semibold">
                                <div className={`w-2 h-2 ${tx.isExecuted ? "bg-green-500" : isRejected ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                <div className='lg:text-xs 2xl:text-base'>{tx.isExecuted ? "Approved" : isRejected ? "Rejected" : "Pending"}</div>
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-xs 2xl:text-base">
                                |
                            </div>
                            <div className="text-gray-500 dark:text-gray-300 lg:text-xs 2xl:text-base">
                                {tx.isExecuted ? tx.contractThresholdAmount : tx.confirmations.length} <span className="font-thin">/</span> {tx.contractThresholdAmount}
                            </div>
                        </div>
                        <div className="h-3 w-full rounded-lg bg-gray-300 relative" >
                            <div className={`absolute left-0 top-0 h-3 ${tx.isExecuted ? "bg-green-500" : tx.confirmations.length === 0 ? "bg-red-600" : "bg-primary"} rounded-lg`} style={{
                                width: tx.isExecuted ? "100%" : Math.min(((tx.confirmations.length / tx.contractThresholdAmount) * 100), 100).toFixed(2) + "%"
                            }} />
                        </div>
                    </div>
                </td>
                <td className="text-left">
                    <div className="flex justify-end space-x-3 pr-5 items-center h-full text-xs">
                        <div>
                            {tx.contractOwners.find(s => s.toLowerCase() === providerAddress?.toLowerCase()) ? (tx.isExecuted ? <></> :
                                !tx.confirmations.some(s => s.toLowerCase() === providerAddress?.toLowerCase()) ?
                                    <div className="w-20 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2" onClick={ConfirmFn}>
                                        <span className="tracking-wider" >
                                            {confirmFnLoading ? <Loader size={14} /> : "Sign"}
                                        </span>
                                    </div> :
                                    isApprovable ?
                                        <div className="w-20 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2" onClick={ExecuteFn}>
                                            <span className="tracking-wider" >
                                                {executeFnLoading ? <Loader size={14} /> : "Execute"}
                                            </span>
                                        </div> :
                                        <div className="w-20 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2" onClick={RevokeFn}>
                                            <span className="tracking-wider" >
                                                {executeFnLoading ? <Loader size={14} /> : "Revoke"}
                                            </span>
                                        </div>)
                                :
                                <div className="w-20 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                    <span className="tracking-wider">
                                        You're not an owner
                                    </span>
                                </div>
                            }
                        </div>
                        <div className="cursor-pointer" onClick={() => setOpenDetail(true)}>
                            <AiFillRightCircle color="#FF7348" size={24} />
                        </div>
                    </div>
                </td>
            </tr>
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
                    id: tx.tx.id ?? ERC20MethodIds.noInput,
                    method: tx.tx.method ?? ERC20MethodIds.noInput,
                }}
                direction={direction}
                txIndex={txPositionInRemoxData}
                action={action}
                isExecuted={tx.isExecuted}
                isMultisig={true}
                isRejected={isRejected}
                signers={tx.confirmations}
                tags={tx.tags}
                threshold={tx.contractThresholdAmount}
                timestamp={tx.timestamp}
                budget={tx.budget ?? undefined}
                account={account}
                openDetail={openDetail}
                setOpenDetail={setOpenDetail}
            />
        </>
    );
})

export default MultisigTx