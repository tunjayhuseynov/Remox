import { Fragment, useState, useMemo, useEffect } from "react";
import { useAppSelector } from "redux/hooks";
import { useWalletKit } from "hooks";
import { Coins } from "types";
import _ from "lodash";
import {
  SelectBalance,
  SelectContributorMembers,
  SelectNonCanceledRecurringTasks,
  SelectRecurringTasks,
  SelectPriceCalculationFn,
  SelectFiatSymbol,
  SelectFiatPreference,
} from "redux/slices/account/selector";
import TeamItem from "./_components/_teamItem";
import { ERCMethodIds, IAutomationCancel, IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess";
import { DecimalConverter } from "utils/api";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { NG } from "utils/jsxstyle";
import { GetTime } from "utils";
import { GetFiatPrice } from "utils/const";

const Automations = () => {
  // const teams = useAppSelector(SelectContributorsAutoPayment)


  // const { GetCoins } = useWalletKit();
  const calculatePrice = useAppSelector(SelectPriceCalculationFn)
  const tasks = useAppSelector(SelectNonCanceledRecurringTasks)
  const symbol = useAppSelector(SelectFiatSymbol)
  const members = useAppSelector(SelectContributorMembers)
  const balance = useAppSelector(SelectBalance);
  const tsk = useAppSelector(SelectRecurringTasks)
  const fiat = useAppSelector(SelectFiatPreference)
  // console.log(tasks)
  // const [addStopModal, setAddStopModal] = useState(false);
  // const [selectable, setSelectable] = useState(false);
  // const reccuringState = useState<(ITransactionMultisig | IFormattedTransaction)[]>([]);
  // const memberState = useState<IMember[]>([]);

  const totalPrice: [{ [name: string]: number }, number] = useMemo(() => {
    let res: { [name: string]: number } = {};
    let total = 0;
    for (const task of tasks) {
      const tx = ('tx' in task ? task.tx : task) as IAutomationTransfer;
      const amount = DecimalConverter(tx.amount, tx.coin.decimals)
      total += calculatePrice({ ...tx.coin, amount, coin: tx.coin });
      if (res[tx.coin.symbol]) {
        res[tx.coin.symbol] += amount;
      } else {
        res[tx.coin.symbol] = amount;
      }
    }

    return [res, total];
  }, [tasks, balance]);

  return (
    <div className="w-full h-full flex flex-col space-y-3">
      <div className="flex justify-between items-center w-full pb-3">
        <div className="text-2xl font-bold">Streaming</div>
      </div>
      <>
        {/* {tasks.length > 0 && <div className="px-5 pb-10 pt-6  shadow-custom bg-white dark:bg-darkSecond">
          <div className="grid grid-cols-[22.5%,1fr] gap-10">
            <div className="flex flex-col space-y-5 gap-12 lg:gap-4 border-r border-grayHot">
              <div className="text-base font-medium text-gray-500">Total Streaming Payment</div>
              <div className="text-3xl font-semibold !mt-0">
                {symbol}<NG number={totalPrice[1]} fontSize={1.75} />
              </div>
            </div>
            <div className="flex flex-col space-y-5 !mt-0">
              <div className="text-sm font-medium text-gray-500">Token Allocation</div>
              <div className="flex flex-wrap gap-y-4">
                {
                  Object.entries(totalPrice[0])
                    .filter((s) => s[1])
                    .map(([currency, amount]) => {
                      return (
                        <div key={currency} className="flex flex-col space-y-2 relative mr-12">
                          <div className="inline-grid grid-flow-col space-x-2">
                            <div className="font-semibold text-xl inline-grid grid-flow-col gap-x-2">
                              <div className="mt-[3px]">
                                <img
                                  src={GetCoins[currency as keyof Coins].logoURI}
                                  className="w-[1.5625rem] h-[1.5625rem] rounded-full object-cover"
                                  alt={GetCoins[currency as keyof Coins].symbol}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <div className="font-semibold text-xl leading-none mt-[6px]">
                                <NG number={amount} fontSize={1.25} />
                              </div>
                              <div className="text-xs text-greylish opacity-75 text-left">
                                {symbol}<NG number={(GetFiatPrice(GetCoins[currency as keyof Coins], fiat) * amount)} fontSize={0.75} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </div>
        </div>} */}
        <div className="w-full pt-4 pb-6 h-full">
          <table className="w-full">
            <thead>
              <tr className={`pl-5 grid grid-cols-[15%,repeat(6,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal font-semibold bg-gray-100 dark:bg-darkSecond rounded-md`}>
                <th className="py-3 self-center text-left">Name</th>
                <th className="py-3 self-center text-left">Start Date</th>
                <th className="py-3 self-center text-left">End Date</th>
                <th className="py-3 self-center text-left">Amount</th>
                <th className="py-3 self-center text-left">Frequency</th>
                <th className="py-3 self-center text-left">Labels</th>
              </tr>
              {tasks.map((w) => {
                const hash = 'tx' in w ? w.hashOrIndex : w.hash;
                return <Fragment key={hash}> <TeamItem tx={w} members={members} /> </Fragment>
              })}
              {
                tasks.length === 0 && (
                  <div className="pl-5 py-10 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom text-center w-full">
                    No Data
                  </div>
                )
              }
            </thead>
          </table>
        </div>
      </>
    </div>
  );
};

export default Automations;
