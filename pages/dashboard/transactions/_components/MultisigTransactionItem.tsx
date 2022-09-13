import useMultisig, { IMultisigSafeTransaction, ITransactionMultisig } from 'hooks/walletSDK/useMultisig'
import { forwardRef, Fragment, useState } from 'react'
import { AltCoins, Coins, TransactionDirection, TransactionStatus } from 'types'
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration } from "utils";
import { IAccount } from 'firebaseConfig';
import { AiFillRightCircle } from 'react-icons/ai';
import { CoinDesignGenerator } from './CoinsGenerator';
import { ERC20MethodIds, GenerateTransaction, IAddOwner, IAutomationCancel, IAutomationTransfer, IBatchRequest, IChangeThreshold, IRemoveOwner, ISwap, ITransfer } from 'hooks/useTransactionProcess';
import { ITag } from 'pages/api/tags/index.api';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectID, SelectProviderAddress } from 'redux/slices/account/selector';
import { BlockchainType } from 'types/blockchains';
import { ToastRun } from 'utils/toast';
import { AddTransactionToTag } from 'redux/slices/account/thunks/tags';
import { nanoid } from '@reduxjs/toolkit';
import dateFormat from "dateformat";
import Image from 'next/image';
import Dropdown from 'components/general/dropdown';
import Detail from './Detail';
import useLoading from 'hooks/useLoading';
import { ClipLoader } from 'react-spinners';
import { addConfirmation, changeToExecuted } from 'redux/slices/account/remoxData';


interface IProps { address: string | undefined, tx: ITransactionMultisig, blockchain: BlockchainType, direction: TransactionDirection, tags: ITag[], txPositionInRemoxData: number, account?: IAccount }
const MultisigTx = forwardRef<HTMLDivElement, IProps>(({ tx, blockchain, direction, tags, txPositionInRemoxData, account }, ref) => {
    const transaction = tx.tx;
    const [isLabelActive, setLabelActive] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<ITag>();
    const [labelLoading, setLabelLoading] = useState(false)
    const [openDetail, setOpenDetail] = useState(false)

    const providerAddress = useAppSelector(SelectProviderAddress)
    const id = useAppSelector(SelectID)


    const dispatch = useAppDispatch();


    const { executeTransaction, confirmTransaction } = useMultisig()

    const confirmFn = async () => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        await confirmTransaction(tx.contractAddress, tx.hashOrIndex)
        dispatch(addConfirmation({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: tx.hashOrIndex,
        }))
    }

    const executeFn = async () => {
        if (!providerAddress) return ToastRun(<>Cannot get your public key</>, "error");
        await executeTransaction(tx.contractAddress, tx.hashOrIndex)
        dispatch(changeToExecuted({
            contractAddress: tx.contractAddress,
            ownerAddress: providerAddress,
            txid: tx.hashOrIndex,
        }))
    }

    const [executeFnLoading, ExecuteFn] = useLoading(executeFn)
    const [confirmFnLoading, ConfirmFn] = useLoading(confirmFn)


    let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id ?? "") > -1 ? transaction as ITransfer : null;
    const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as unknown as IBatchRequest : null;
    const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as unknown as IAutomationTransfer : null;
    const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as unknown as IBatchRequest : null;
    const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? transaction as unknown as IAutomationCancel : null;
    const swap = transaction.id === ERC20MethodIds.swap ? transaction as unknown as ISwap : null;

    const addOwner = transaction.id === ERC20MethodIds.addOwner ? transaction as unknown as IAddOwner : null;
    const removeOwner = transaction.id === ERC20MethodIds.removeOwner ? transaction as unknown as IRemoveOwner : null;
    const changeThreshold = transaction.id === ERC20MethodIds.changeThreshold ? transaction as unknown as IChangeThreshold : null;
    const changeInternalThreshold = transaction.id === ERC20MethodIds.changeInternalThreshold ? transaction as unknown as IChangeThreshold : null;

    const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction);


    const uniqTags = tags.filter(s => tx.tags?.findIndex(d => d.id === s.id) === -1)

    const labelChangeFn = (val: ITag) => async () => {
        if (!id) {
            return ToastRun(<>You do not have any id, please sign in again</>, "success");
        }
        setLabelLoading(true)
        await dispatch(AddTransactionToTag({
            id,
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
            <tr className="pl-5 grid grid-cols-[12.5%,repeat(6,minmax(0,1fr))] py-5 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom">
                <td className="text-left">
                    <div className="relative inline">
                        <span className="font-semibold">{dateFormat(new Date(+tx.timestamp * 1e3), "mmm dd")}</span>
                        <span className="text-xs text-gray-400 absolute translate-y-[120%] left-0">{dateFormat(new Date(+tx.timestamp * 1e3), "HH:MM")}</span>
                    </div>
                </td>
                <td className="text-left">
                    <div className="flex items-center space-x-3">
                        <div className="h-full aspect-square bg-gray-500 rounded-full border-2 self-center relative p-3">
                            <span className="text-xs absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 font-semibold">
                                {(account?.image?.imageUrl && typeof account.image.imageUrl === "string") || account?.image?.nftUrl ?
                                    <img src={(account?.image?.imageUrl as string) ?? account.image.nftUrl} /> : account?.name.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
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
                            <span className="font-semibold text-left">
                                {action}
                            </span>
                            <span className="text-xs text-gray-200">
                                {name}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="text-left">
                    {transfer && (
                        CoinDesignGenerator({ transfer })
                    )}
                    {
                        transferBatch && (
                            <div className="flex flex-col space-y-5">
                                {transferBatch.payments.map((transfer) => <Fragment>{CoinDesignGenerator({ transfer })}</Fragment>)}
                            </div>
                        )
                    }
                    {
                        automationBatch && (
                            <div className="flex flex-col space-y-5">
                                {automationBatch.payments.map((transfer) => <Fragment>{CoinDesignGenerator({ transfer })}</Fragment>)}
                            </div>
                        )
                    }
                    {
                        automationCanceled && (CoinDesignGenerator({ transfer: automationCanceled }))
                    }
                    {automation && (
                        CoinDesignGenerator({ transfer: automation })
                    )}
                    {swap && (
                        <div className="flex flex-col space-y-5">
                            {CoinDesignGenerator({ transfer: { amount: swap.amountIn, coin: swap.coinIn } })}
                            {CoinDesignGenerator({ transfer: { amount: swap.amountOutMin, coin: swap.coinOutMin } })}
                        </div>
                    )}

                </td>
                <td className="text-left flex flex-col">
                    <div className="flex flex-col">
                        {
                            tx.tags?.map(tag => <div className="flex space-x-5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                <span className="text-xs">{tag.name}</span>
                            </div>)
                        }
                        {uniqTags.length > 0 && (!isLabelActive ? <div>
                            <span className="text-primary cursor-pointer" onClick={() => setLabelActive(true)}>
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
                <td className="text-left w-[66%]">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex space-x-1 items-center font-semibold">
                                <div className={`w-2 h-2 ${tx.isExecuted ? "bg-green-500" : isRejected ? "bg-red-600" : "bg-primary"} rounded-full`} />
                                <div className='lg:text-xs 2xl:text-base'>{tx.isExecuted ? "Approved" : isRejected ? "Rejected" : "Pending"}</div>
                            </div>
                            <div className="text-gray-300 lg:text-xs 2xl:text-base">
                                |
                            </div>
                            <div className="text-gray-300 lg:text-xs 2xl:text-base">
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
                    <div className="flex justify-between pr-5 items-center h-full">
                        <div>
                            {tx.isExecuted ? <></> :
                                !tx.confirmations.some(s => s.toLowerCase() === providerAddress?.toLowerCase()) ?
                                    <div className="w-28 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                        <span className="tracking-wider" onClick={ConfirmFn}>
                                            {confirmFnLoading ? <ClipLoader size={14} /> : "Sign"}
                                        </span>
                                    </div> :
                                    isApprovable ?
                                        <div className="w-28 py-1 px-1 cursor-pointer border border-primary text-primary rounded-md flex items-center justify-center space-x-2">
                                            <span className="tracking-wider" onClick={ExecuteFn}>
                                                {executeFnLoading ? <ClipLoader size={14} /> : "Execute"}
                                            </span>
                                        </div> :
                                        <></>
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
                    tags: tags,
                    timestamp: tx.timestamp,
                    budget: tx.budget ?? undefined,
                    address: tx.contractAddress,
                    hash: tx.hashOrIndex,
                    id: tx.tx.id ?? ERC20MethodIds.noInput,
                    method: tx.tx.method ?? ERC20MethodIds.noInput,
                }}
                direction={direction}
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