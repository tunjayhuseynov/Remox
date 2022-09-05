import {
  ERC20MethodIds,
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
import { AddressReducer } from "utils";
import { SelectAccounts, SelectAllBudgets, SelectCurrencies } from "redux/slices/account/selector";
import { DecimalConverter } from "utils/api";
import { IBudget } from "firebaseConfig";

const SingleTransactionItem = ({
  transaction,
  isMultiple,
  direction,
  status,
  date,
}: {
  date: string;
  transaction: IFormattedTransaction;
  isMultiple?: boolean;
  direction?: TransactionDirection;
  status: string;
}) => {

  const divRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const type2Ref = useRef<HTMLDivElement>(null);
  const accounts = useSelector(SelectAccounts).map((a) =>
    a.address.toLowerCase()
  );
  const { getDetails } = useTasking();
  const tags = useSelector(selectTags);
  const [Transaction, setTransaction] = useState(transaction);
  const [IsMultiple, setIsMultiple] = useState(isMultiple);
  const { GetCoins } = useWalletKit();


  const budgets = useAppSelector(SelectAllBudgets);
  const [selectedBudget, setSelectedPayment] = useState<IBudget | null>(transaction.budget ?? null);

  const isSwap = Transaction.id === ERC20MethodIds.swap;
  const isComment = Transaction.id === ERC20MethodIds.transferWithComment;
  const isAutomation = Transaction.id === ERC20MethodIds.automatedTransfer;
  const isTransfer =
    [
      ERC20MethodIds.transfer,
      ERC20MethodIds.transferFrom,
      ERC20MethodIds.borrow,
      ERC20MethodIds.deposit,
      ERC20MethodIds.withdraw,
      ERC20MethodIds.repay,
    ].indexOf(
      (Transaction as IFormattedTransaction).id
    ) > -1;

  let peer = accounts.includes((Transaction as IFormattedTransaction).rawData.from.toLowerCase()) ?
    (Transaction as IFormattedTransaction).rawData.to : (Transaction as IFormattedTransaction).rawData.from;

  let SwapData;
  let TransferData;
  let MultipleData;
  let Comment;

  if (isComment) {
    Comment = (Transaction as ITransferComment).comment;
  }
  if (isTransfer && !IsMultiple) {
    TransferData = Transaction as ITransfer;
  }
  if (isSwap && !IsMultiple) {
    SwapData = Transaction as ISwap;
  }

  if (IsMultiple) {
    MultipleData = Transaction as IBatchRequest;
    peer = MultipleData.payments[0].to;
  }

  // useEffect(() => {
  //   if (isAutomation) {
  //     (async () => {
  //       const data = Transaction as IAutomationTransfer;
  //       const details = await getDetails(data.taskId);
  //       const reader = InputReader(details[1], {
  //         transaction: (Transaction as IFormattedTransaction).rawData,
  //         tags,
  //         Coins: GetCoins,
  //       });

  //       if (reader && reader.id === ERC20MethodIds.repay) console.log(reader);
  //       const formattedTx = {
  //         rawData: data.rawData,
  //         hash: data.hash,
  //         ...reader,
  //       } as IFormattedTransaction;
  //       if (reader && reader.id === ERC20MethodIds.batchRequest)
  //         setIsMultiple(true);
  //       setTransaction(formattedTx);
  //     })();
  //   }
  // }, [transaction]);

  return (
    <>
      <tr className="pl-5 grid grid-cols-[12.5%,repeat(6,minmax(0,1fr))] py-5 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom">
        <td className="text-left">
          <div className="relative inline">
            <span className="font-semibold">{dateFormat(new Date(+date * 1e3), "mmm dd")}</span>
            <span className="text-xs text-gray-400 absolute translate-y-[120%] left-0">{dateFormat(new Date(+date * 1e3), "HH:MM")}</span>
          </div>
        </td>
        <td className="text-left">Maria Anders</td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
        <td className="text-left">Germany</td>
      </tr>
      {/* <div ref={divRef} className={`grid "grid-cols-[25%,45%,30%] sm:grid-cols-[20%,15%,12%,18%,25%,10%] items-center" min-h-[4.688rem] py-2 `}>
        <div className="flex space-x-3 items-center overflow-hidden">
          <div className={`hidden sm:flex items-center  justify-center`}>
            <div className={`bg-greylish bg-opacity-10 w-[2.813rem] h-[2.813rem] text-lg flex items-center justify-center rounded-full font-bold `}>
              {transaction.method[0]}
            </div>
          </div>
          <div className={`sm:flex flex-col justify-center items-start `}>
            <div className="text-greylish text-base font-semibold dark:text-white">
              {transaction.method}
            </div>
          </div>
        </div>
        {selectedBudget ? (
          <div className="w-1/2  bg-light dark:bg-darkSecond rounded-lg border-2 py-1 px-2">
            {selectedBudget.name.slice(0, 8) + "."}
          </div>
        ) : (
          <Dropdown
            className={
              "w-[70%]  bg-light dark:bg-darkSecond rounded-lg !z-[9999]"
            }
            label="Budget"
            list={budgets}
            selected={selectedBudget ?? undefined}
            setSelect={setSelectedPayment}
          />
        )}
        <div className="flex items-center  gap-1">
          <img
            src={`/icons/${type2Ref.current?.innerText.toLowerCase()}.png`}
            className="rounded-full w-[2.5rem] h-[2.5rem]"
          />
          <div className="">
            <div className="flex flex-col  text-xl">
              {direction !== undefined && (
                <span ref={typeRef}>
                  {TransactionDirection.Swap === direction ? "Swap" : ""}
                  {TransactionDirection.In === direction ? "Receive" : ""}
                  {TransactionDirection.Borrow === direction ? "Borrow" : ""}
                  {TransactionDirection.Withdraw === direction
                    ? "Withdrawn"
                    : ""}
                  {TransactionDirection.Repay === direction ? "Repaid" : ""}
                  {TransactionDirection.Deposit === direction
                    ? "Deposit"
                    : ""}
                  {TransactionDirection.AutomationOut === direction
                    ? "Execute (A)"
                    : ""}
                  {TransactionDirection.AutomationIn === direction
                    ? "Receive (A)"
                    : ""}
                  {TransactionDirection.Out === direction ? "Send" : ""}
                </span>
              )}
              <span className="flex gap-2 items-center text-greylish text-sm">
                {" "}
                <div ref={type2Ref}>
                  {" "}
                  {direction !== undefined && (
                    <>
                      {TransactionDirection.Swap === direction
                        ? "Ubeswap"
                        : ""}
                      {TransactionDirection.In === direction ? "Remox" : ""}
                      {TransactionDirection.Borrow === direction
                        ? "Moola"
                        : ""}
                      {TransactionDirection.Withdraw === direction
                        ? "Withdrawn"
                        : ""}
                      {TransactionDirection.Repay === direction
                        ? "Repaid"
                        : ""}
                      {TransactionDirection.Deposit === direction
                        ? "Deposit"
                        : ""}
                      {TransactionDirection.AutomationOut === direction
                        ? "Execute (A)"
                        : ""}
                      {TransactionDirection.AutomationIn === direction
                        ? "Receive (A)"
                        : ""}
                      {TransactionDirection.Out === direction ? "Remox" : ""}
                    </>
                  )}
                </div>
              </span>
            </div>
          </div>
        </div>

        <div className="text-base">
          <div>
            {!isSwap && TransferData && !IsMultiple && (
              <div
                className={`flex grid-cols-[20%,80%] space-x-4`}
              >
                <div
                  className={`flex flex-col grid-cols-[15%,85%] gap-x-2 text-lg font-medium`}
                >
                  <span>
                    {BN(DecimalConverter(TransferData.amount, TransferData.coin.decimals)).gt(9999)
                      ? "9999+"
                      : BN(DecimalConverter(TransferData.amount, TransferData.coin.decimals)).toFixed(2)}
                  </span>
                  <span className="text-greylish dark:text-white text-xs">
                    $
                    {Math.min(
                      BN(DecimalConverter(TransferData.amount, TransferData.coin.decimals))
                        .times(TransferData.coin.priceUSD)
                        .toNumber(),
                      999999999
                    ).toFixed(2)}
                  </span>
                </div>
                <div
                  className={`flex grid-cols-[10%,90%] gap-x-2 text-xl font-medium`}
                >
                  {TransferData.coin ? (
                    <>
                      <div>
                        <img
                          src={TransferData.coin.logoURI}
                          className="rounded-full w-[1.8rem] h-[1.8rem]"
                        />
                      </div>
                      <div>{TransferData.coin.name ?? "Unknown Coin"}</div>
                    </>
                  ) : (
                    <div>Unknown Coin</div>
                  )}
                </div>
              </div>
            )}
            {!isSwap &&
              MultipleData &&
              MultipleData.payments.map((payment, index) => {
                return (
                  <div
                    key={index}
                    className={`flex grid-cols-[20%,80%] items-center mx-7 space-x-4`}
                  >
                    <div
                      className={`flex grid-cols-[25%,75%] gap-x-2 items-center`}
                    >
                      <div className="w-[0.625rem] h-[0.625rem] rounded-full bg-primary self-center"></div>
                      <span>
                        {DecimalConverter(payment.amount, payment.coinAddress.decimals).toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={`flex grid-cols-[10%,90%] gap-x-2 items-center`}
                    >
                      {payment.coinAddress ? (
                        <>
                          <div>
                            <img
                              src={payment.coinAddress.coinUrl}
                              className="rounded-full w-[1.125rem] h-[1.125rem]"
                            />
                          </div>
                          <div>{payment.coinAddress.name}</div>
                        </>
                      ) : (
                        <div>Unknown Token</div>
                      )}
                    </div>
                  </div>
                );
              })}
            {isSwap && SwapData && (
              <div className="flex flex-col">
                <div
                  className={`flex grid-cols-[20%,80%] mx-7 space-x-4`}
                >
                  <div
                    className={`flex grid-cols-[15%,85%] gap-x-2 `}
                  >
                    <div className="flex flex-col">
                      <span>
                        {DecimalConverter(SwapData.amountIn, SwapData.coinIn.decimals).toFixed(2)}
                      </span>
                      <span className="text-greylish text-sm">$2345</span>
                    </div>
                  </div>
                  <div
                    className={`flex grid-cols-[10%,90%] gap-x-2 `}
                  >
                    {SwapData.coinIn ? (
                      <>
                        <div>
                          <img
                            src={SwapData.coinIn.coinUrl}
                            className="rounded-full w-[1.5rem] h-[1.5rem] "
                          />
                        </div>
                        <div>{SwapData.coinIn.name}</div>
                      </>
                    ) : (
                      <div>Unknown Coin</div>
                    )}
                  </div>
                </div>
                <div className="flex   ml-20 pl-2">
                  <div className="py-1 rounded-lg ">
                    <img
                      src="/icons/swap.png"
                      alt=""
                      className="w-[1.125rem] h-[1.125rem] dark:invert dark:brightness-0"
                    />
                  </div>
                </div>
                <div
                  className={`flex grid-cols-[20%,80%] mx-7 space-x-4`}
                >
                  <div className={` `}>
                    <div className="flex flex-col">
                      <span>
                        {DecimalConverter(SwapData.amountOutMin, SwapData.coinOutMin.decimals).toFixed(2)}
                      </span>
                      <span className="text-greylish text-sm">$2345</span>
                    </div>
                  </div>
                  <div
                    className={`flex grid-cols-[10%,90%] gap-x-2 `}
                  >
                    {SwapData.coinOutMin ? (
                      <>
                        <div>
                          <img
                            src={SwapData.coinOutMin.coinUrl}
                            className="rounded-full w-[1.5rem] h-[1.5rem] "
                          />
                        </div>
                        <div>{SwapData.coinOutMin.name}</div>
                      </>
                    ) : (
                      <div>Unknown Coin</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          {Transaction.tags &&
            Transaction.tags.map((tag, index) => {
              return (
                <div key={tag.id} className="flex space-x-3 items-center">
                  <div
                    className="w-[0.8rem] h-[0.8rem] rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <div className="!ml-1 text-base">{tag.name}</div>
                </div>
              );
            })}
          {
            <div className="flex items-center gap-2 text-primary font-bold cursor-pointer">
              <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">
                +
              </span>{" "}
              Add Label
            </div>
          }
        </div>
        <div className=" flex justify-end cursor-pointer items-start md:pr-0 gap-5">
          <Button className="shadow-none px-8 py-1 !rounded-md">Sign</Button>

          <SingleTxDetails
            Transaction={Transaction}
            TransferData={TransferData}
            isSwap={isSwap}
            isComment={isComment}
            Type={typeRef.current?.innerText}
            Comment={Comment}
            status={status}
            time={dateFormat(new Date(parseInt(date) * 1e3), "mediumDate")}
            address={AddressReducer(peer)}
          />
        </div>
      </div> */}
    </>
  );
};
export default SingleTransactionItem;
//() => router.push(`/dashboard/transactions/details/${Transaction.rawData.hash}`)
