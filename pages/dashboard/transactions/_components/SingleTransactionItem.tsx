import {
  ERC20MethodIds,
  IAutomationCancle,
  IAutomationTransfer,
  IBatchRequest,
  IFormattedTransaction,
  InputReader,
  ISwap,
  ITransfer,
  ITransferComment,
} from "hooks/useTransactionProcess";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "components/button";
import useTasking from "rpcHooks/useTasking";
import { selectTags } from "redux/slices/tags";
import { BN } from "utils/ray";
import { useWalletKit } from "hooks";
import SingleTxDetails from "pages/dashboard/transactions/_components/SingleTxDetails";
import dateFormat from "dateformat";
import Dropdown from "components/general/dropdown";
import { TransactionDirection } from "types";
import { useAppSelector } from "redux/hooks";
import { AddressReducer, TransactionDirectionImageNameDeclaration } from "utils";
import { SelectAccounts, SelectAllBudgets, SelectCurrencies } from "redux/slices/account/selector";
import { DecimalConverter } from "utils/api";
import { IAccount, IBudget } from "firebaseConfig";
import { BlockchainType } from "types/blockchains";
import Image from "next/image";

const SingleTransactionItem = ({
  transaction,
  blockchain,
  isMultiple,
  direction,
  status,
  date,
  account
}: {
  date: string;
  blockchain: BlockchainType,
  transaction: IFormattedTransaction;
  isMultiple?: boolean;
  direction?: TransactionDirection;
  status: string;
  account?: IAccount
}) => {

  let transfer = [ERC20MethodIds.transfer, ERC20MethodIds.noInput, ERC20MethodIds.transferFrom, ERC20MethodIds.transferWithComment, ERC20MethodIds.repay, ERC20MethodIds.borrow, ERC20MethodIds.deposit, ERC20MethodIds.withdraw].indexOf(transaction.id) > -1 ? transaction as ITransfer : null;
  const transferBatch = transaction.id === ERC20MethodIds.batchRequest ? transaction as IBatchRequest : null;
  const automation = transaction.id === ERC20MethodIds.automatedTransfer ? transaction as IAutomationTransfer : null;
  const automationBatch = transaction.id === ERC20MethodIds.automatedBatchRequest ? transaction as IBatchRequest : null;
  const automationCanceled = transaction.id === ERC20MethodIds.automatedCanceled ? transaction as IAutomationCancle : null;
  const swap = transaction.id === ERC20MethodIds.swap ? transaction as ISwap : null;

  const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction,);
  console.log(transaction, "transaction");
  return (
    <>
      <tr className="pl-5 grid grid-cols-[12.5%,repeat(6,minmax(0,1fr))] py-5 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom">
        <td className="text-left">
          <div className="relative inline">
            <span className="font-semibold">{dateFormat(new Date(+date * 1e3), "mmm dd")}</span>
            <span className="text-xs text-gray-400 absolute translate-y-[120%] left-0">{dateFormat(new Date(+date * 1e3), "HH:MM")}</span>
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
            <div className="text-sm truncate font-semibold">
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
            CoinDesignGenerator(transfer)
          )}
          {
            transferBatch && (
              <div className="flex flex-col space-y-5">
                {transferBatch.payments.map((transfer) => CoinDesignGenerator(transfer))}
              </div>
            )
          }
          {
            automationBatch && (
              <div className="flex flex-col space-y-5">
                {automationBatch.payments.map((transfer) => CoinDesignGenerator(transfer))}
              </div>
            )
          }
          {
            automationCanceled && (
              <div className="flex flex-col space-y-5">
                {automationCanceled.payments.map((transfer) => CoinDesignGenerator(transfer))}
              </div>
            )
          }
          {automation && (
            CoinDesignGenerator(automation)
          )}
          {swap && (
            <div className="flex flex-col space-y-5">
              {CoinDesignGenerator({ amount: swap.amountIn, coin: swap.coinIn })}
              {CoinDesignGenerator({ amount: swap.amountOutMin, coin: swap.coinOutMin })}
            </div>
          )}
        </td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
      </tr>
    </>
  );
};
export default SingleTransactionItem;


const CoinDesignGenerator = (transfer: Pick<ITransfer, "coin" | "amount">) => {

  return <div className="flex space-x-3">
    <div className="w-[1.5rem] h-[1.5rem]">
      {transfer?.coin?.logoURI ? <img
        src={transfer.coin.logoURI}
        width="100%"
        height="100%"
        className="rounded-full"
      /> : <div className="w-full h-full rounded-full bg-gray-500" />}
    </div>
    <div className="flex flex-col text-left">
      <span className="font-semibold text-left">
        {DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? 0 : DecimalConverter(transfer.amount, transfer.coin.decimals).toLocaleString()}
      </span>
      <span className="text-xs text-gray-200">
        {`$${(DecimalConverter(transfer.amount, transfer.coin.decimals) * transfer.coin.priceUSD).toFixed(0).length > 18 ? 0 : (DecimalConverter(transfer.amount, transfer.coin.decimals) * transfer.coin.priceUSD).toLocaleString()}`}
      </span>
    </div>
  </div>
}