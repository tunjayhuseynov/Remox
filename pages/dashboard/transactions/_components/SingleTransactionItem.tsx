import {
  ERCMethodIds,
  IAutomationCancel,
  IAutomationTransfer,
  IBatchRequest,
  IFormattedTransaction,
  ISwap,
  ITransfer,
} from "hooks/useTransactionProcess";
import { Fragment, useState } from "react";
import dateFormat from "dateformat";
import Dropdown from "components/general/dropdown";
import { TransactionDirection } from "types";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { TransactionDirectionImageNameDeclaration } from "utils";
import { SelectAlldRecurringTasks, SelectCurrencies, SelectID, SelectNonCanceledRecurringTasks, SelectPayTransactions } from "redux/slices/account/selector";
import { IAccount, IBudget, IRemoxPayTransactions } from "firebaseConfig";
import { BlockchainType } from "types/blockchains";
import Image from "next/image";
import { ITag } from "pages/api/tags/index.api";
import { AddTransactionToTag } from "redux/slices/account/thunks/tags";
import { nanoid } from "@reduxjs/toolkit";
import { ToastRun } from "utils/toast";
import { AiFillRightCircle } from "react-icons/ai";
import { CoinDesignGenerator } from "./CoinsGenerator";
import Detail from "./Detail";
import makeBlockie from "ethereum-blockies-base64";
import { FiRepeat } from "react-icons/fi";
import { ClickAwayListener, FormControl, InputAdornment, TextField } from "@mui/material";
import Loader from "components/Loader";
import Modal from "components/general/modal";
import Button from "components/button";
import useLoading from "hooks/useLoading";
import AddLabel from "./tx/AddLabel";
import { BiSearch } from "react-icons/bi";

const SingleTransactionItem = ({
  transaction,
  blockchain,
  direction,
  date,
  tags,
  account,
  txPositionInRemoxData,
  isDetailOpen
}: {
  date: string;
  blockchain: BlockchainType,
  transaction: IFormattedTransaction;
  isMultiple?: boolean;
  direction: TransactionDirection;
  status: string;
  account?: IAccount,
  tags: ITag[],
  txPositionInRemoxData: number,
  isDetailOpen?: boolean
}) => {
  const [isLabelActive, setLabelActive] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<ITag>();
  const [addLabelModal, setAddLabelModal] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false)
  const [openDetail, setOpenDetail] = useState(isDetailOpen ?? false)

  const coins = useAppSelector(SelectCurrencies)
  const streamings = useAppSelector(SelectAlldRecurringTasks)

  const timestamp = transaction.timestamp;

  let transfer = [ERCMethodIds.transfer, ERCMethodIds.noInput, ERCMethodIds.transferFrom, ERCMethodIds.transferWithComment, ERCMethodIds.repay, ERCMethodIds.borrow, ERCMethodIds.deposit, ERCMethodIds.withdraw].indexOf(transaction.id) > -1 ? transaction as ITransfer : null;
  const transferBatch = transaction.id === ERCMethodIds.batchRequest ? transaction as IBatchRequest : null;
  const automation = transaction.id === ERCMethodIds.automatedTransfer ? transaction as IAutomationTransfer : null;
  const automationBatch = transaction.id === ERCMethodIds.automatedBatchRequest ? transaction as IBatchRequest : null;
  const automationCanceled = transaction.id === ERCMethodIds.automatedCanceled ? streamings.find(s => (s as IAutomationTransfer).streamId == (transaction as IAutomationCancel).streamId) as IAutomationTransfer : null;
  const swap = transaction.id === ERCMethodIds.swap ? transaction as ISwap : null;

  const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, false);


  const txs = useAppSelector(SelectPayTransactions) as IRemoxPayTransactions[]
  const payTx = txs.find(s => s.contract?.toLowerCase() === transaction.address?.toLowerCase() && s.hashOrIndex?.toLowerCase() === transaction.hash?.toLowerCase())


  const dispatch = useAppDispatch()
  const id = useAppSelector(SelectID)
  const [tagName, setTagName] = useState<string>()
  let uniqTags = tags.filter(s => transaction.tags?.findIndex(d => d.id === s.id) === -1)
  if (tagName) {
    uniqTags = uniqTags.filter(s => s.name.toLowerCase().startsWith(tagName?.toLowerCase()))
  }

  const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value.trim())
  }

  const labelChangeFn = (val: ITag) => async () => {
    try {
      if (!id) {
        return ToastRun(<>You do not have any id, please sign in again</>, "error");
      }
      setLabelLoading(true)
      await dispatch(AddTransactionToTag({
        tagId: val.id,
        transaction: {
          id: nanoid(),
          blockchain: account?.blockchain ?? "",
          address: transaction.address,
          hash: transaction.hash,
          contractType: "single",
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


  return (
    <>
      <tr className="pl-5 grid grid-cols-[8.5%,14.5%,16%,repeat(3,minmax(0,1fr)),22%] py-[1.469rem] bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5">
        <td className="text-left pt-1">
          <div className="relative inline">
            <span className="font-medium text-sm">{dateFormat(new Date(+date * 1e3), "mmm dd")}</span>
            <span className="text-xxs text-gray-400 absolute translate-y-[120%] top-1 left-0">{dateFormat(new Date(+date * 1e3), "HH:MM")}</span>
          </div>
        </td>
        <td className="text-left">
          <div className="flex items-center space-x-3">
            <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl ?? makeBlockie(account?.address ?? account?.name ?? "random")} className="w-[1.875rem] h-[1.875rem] aspect-square rounded-full" />
            <div className="text-sm truncate font-medium pr-5">
              {account?.name ?? "N/A"}
            </div>
          </div>
        </td>
        <td className="text-left">
          <div className="grid grid-cols-[1.875rem,1fr] gap-x-[4px]">
            <div className="w-[1.875rem] h-[1.875rem]">
              <Image
                src={image}
                width="100%"
                height="100%"
                layout="responsive"
                quality={100}
                className="rounded-full object-cover"
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
              transaction.tags?.map(tag => <div key={tag.id} className="flex space-x-2">
                <div className="w-1 h-5" style={{ backgroundColor: tag.color }}></div>
                <span className="text-sm font-medium">{tag.name}</span>
              </div>)
            }
            {transaction.tags.length === 0 && <div>
              {labelLoading ? <Loader /> : <span className="text-primary cursor-pointer text-sm font-medium" onClick={() => setLabelActive(!isLabelActive)}>
                + Add Label
              </span>}
            </div>}
            {isLabelActive && (
              <ClickAwayListener onClickAway={() => {
                setLabelActive(false)
              }}>
                <div className="absolute z-[9999] -bottom-1 w-full bg-white dark:bg-darkSecond translate-y-full rounded-md border border-gray-500 h-[10.5rem] overflow-y-hidden">
                  <div className="flex flex-col items-center  overflow-y-scroll h-full">
                    <div className={`flex space-x-2 text-primary py-2 cursor-pointer w-full text-left px-1 h-12`}>
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
        <td className="text-left">
          {transaction.isError &&
            <span className="border border-primary bg-primary bg-opacity-10 text-primary px-3 py-1 font-medium text-xs">
              Failed
            </span>
          }
          {/* <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex space-x-1 items-center font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="lg:text-sm 2xl:text-base">Approved</div>
              </div>
              <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                |
              </div>
              <div className="text-gray-500 dark:text-gray-300 lg:text-sm 2xl:text-base">
                1 <span className="font-thin">/</span> 1
              </div>
            </div>
            <div className="h-2 w-[90%] rounded-lg bg-gray-300 relative" >
              <div className="absolute left-0 top-0 h-2 bg-green-500 rounded-lg" style={{
                width: 100 + "%"
              }} />
            </div>
          </div> */}
        </td>
        <td className="text-left">
          <div className="flex justify-between pr-5 pt-2 h-full">
            <div></div>
            <div className="cursor-pointer" onClick={() => setOpenDetail(true)}>
              <AiFillRightCircle color="#FF7348" size={24} />
            </div>
          </div>
        </td>
      </tr>
      <Detail
        transaction={transaction}
        action={action}
        txIndex={txPositionInRemoxData}
        isExecuted={true}
        isMultisig={false}
        isRejected={false}
        signers={[account?.address ?? ""]}
        tags={transaction.tags}
        threshold={1}
        direction={direction}
        timestamp={+date}
        account={account}
        openDetail={openDetail}
        setOpenDetail={setOpenDetail}
        gasFee={{
          amount: (+transaction.rawData.gasPrice * +transaction.rawData.gasUsed),
          currency: Object.values(coins).find(coin => coin.address.toLowerCase() === blockchain.nativeToken.toLowerCase())
        }} />
      {addLabelModal && <AddLabel onSubmit={async (tag) => {
        await labelChangeFn(tag)()
      }} setAddLabelModal={setAddLabelModal} />}
    </>
  );
};
export default SingleTransactionItem;


