import {
  ERC20MethodIds,
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
import { SelectCurrencies, SelectID } from "redux/slices/account/selector";
import { IAccount, IBudget } from "firebaseConfig";
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

const SingleTransactionItem = ({
  transaction,
  blockchain,
  direction,
  date,
  tags,
  account,
  txPositionInRemoxData,
}: {
  date: string;
  blockchain: BlockchainType,
  transaction: IFormattedTransaction;
  isMultiple?: boolean;
  direction: TransactionDirection;
  status: string;
  account?: IAccount,
  tags: ITag[],
  txPositionInRemoxData: number
}) => {
  const [isLabelActive, setLabelActive] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<ITag>();
  const [labelLoading, setLabelLoading] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)

  const coins = useAppSelector(SelectCurrencies)

  const timestamp = transaction.timestamp;

  let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id) > -1 ? transaction as ITransfer : null;
  const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as IBatchRequest : null;
  const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as IAutomationTransfer : null;
  const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as IBatchRequest : null;
  const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? transaction as IAutomationCancel : null;
  const swap = transaction.id === ERC20MethodIds.swap ? transaction as ISwap : null;

  const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, false);

  const dispatch = useAppDispatch()
  const id = useAppSelector(SelectID)

  const uniqTags = tags.filter(s => transaction.tags?.findIndex(d => d.id === s.id) === -1)

  const labelChangeFn = (val: ITag) => async () => {
    if (!id) {
      return ToastRun(<>You do not have any id, please sign in again</>, "success");
    }
    setLabelLoading(true)
    await dispatch(AddTransactionToTag({
      tagId: val.id,
      transaction: {
        id: nanoid(),
        address: transaction.address,
        hash: transaction.hash,
        contractType: "single",
        provider: account?.provider ?? null
      },
      txIndex: txPositionInRemoxData
    })).unwrap()

    setLabelLoading(false)
    setLabelActive(false)
  }

  return (
    <>
      <tr className="pl-5 grid grid-cols-[8.5%,20%,18%,repeat(4,minmax(0,1fr))] py-5 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom">
        <td className="text-left">
          <div className="relative inline">
            <span className="font-semibold">{dateFormat(new Date(+date * 1e3), "mmm dd")}</span>
            <span className="text-xs text-gray-400 absolute translate-y-[120%] left-0">{dateFormat(new Date(+date * 1e3), "HH:MM")}</span>
          </div>
        </td>
        <td className="text-left">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full border-2 self-center relative ${!account?.image ? "p-3" : ""}`}>
              <img src={(account?.image?.imageUrl as string) ?? account?.image?.nftUrl ?? makeBlockie(account?.address ?? account?.name ?? "random")} className="absolute left-0 top-0 w-10 h-10 rounded-full" />
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
              <span className="font-semibold text-left text-sm">
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
              <img src="/icons/swap.png" className="w-5 h-5" />
              <CoinDesignGenerator transfer={{ amount: swap.amountOutMin, coin: swap.coinOutMin }} timestamp={timestamp} />
            </div>
          )}
        </td>
        <td className="text-left flex flex-col">
          <div className="flex flex-col">
            {
              transaction.tags?.map(tag => <div key={tag.id} className="flex space-x-5">
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
        <td className="text-left w-[85%]">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex space-x-1 items-center font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className=" lg:text-xs 2xl:text-base">Approved</div>
              </div>
              <div className="text-gray-300 lg:text-xs 2xl:text-base">
                |
              </div>
              <div className="text-gray-300 lg:text-xs 2xl:text-base">
                1 <span className="font-thin">/</span> 1
              </div>
            </div>
            <div className="h-3 w-full rounded-lg bg-gray-300 relative" >
              <div className="absolute left-0 top-0 h-3 bg-green-500 rounded-lg" style={{
                width: 100 + "%"
              }} />
            </div>
          </div>
        </td>
        <td className="text-left">
          <div className="flex justify-between pr-5 items-center h-full">
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
        budget={transaction.budget ?? undefined}
        account={account}
        openDetail={openDetail}
        setOpenDetail={setOpenDetail}
        gasFee={{
          amount: (+transaction.rawData.gasPrice * +transaction.rawData.gasUsed),
          currency: Object.values(coins).find(coin => coin.symbol.toLowerCase() === (transaction?.rawData?.tokenSymbol?.toLowerCase() ?? transaction?.rawData?.feeCurrency?.toLowerCase()))
        }} />
    </>
  );
};
export default SingleTransactionItem;


