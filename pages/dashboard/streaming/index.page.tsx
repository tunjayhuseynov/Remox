import { Fragment, useState, useMemo } from "react";
import { useAppSelector } from "redux/hooks";
import { IMember } from "types/dashboard/contributors";
import Modal from "components/general/modal";
import Button from "components/button";
import { useWalletKit } from "hooks";
import { Coins } from "types";
import _ from "lodash";
import {
  SelectBalance,
  SelectContributorMembers,
  SelectFiatPreference,
  SelectFiatSymbol,
  SelectNonCanceledRecurringTasks,
  SelectPriceCalculationFn,
  SelectSelectedAccountAndBudget
} from "redux/slices/account/selector";
import TeamItem from "./_components/_teamItem";
import { IAutomationCancel, IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess";
import { DecimalConverter } from "utils/api";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";

const Automations = () => {
  // const teams = useAppSelector(SelectContributorsAutoPayment)


  const { GetCoins } = useWalletKit();
  const calculatePrice = useAppSelector(SelectPriceCalculationFn)
  const tasks = useAppSelector(SelectNonCanceledRecurringTasks)
  const symbol = useAppSelector(SelectFiatSymbol)

  const members = useAppSelector(SelectContributorMembers)
  const balance = useAppSelector(SelectBalance);

  const [addStopModal, setAddStopModal] = useState(false);
  const [selectable, setSelectable] = useState(false);
  const reccuringState = useState<(ITransactionMultisig | IFormattedTransaction)[]>([]);
  const memberState = useState<IMember[]>([]);

  const totalPrice: [{ [name: string]: number }, number] = useMemo(() => {
    let res: { [name: string]: number } = {};
    let total = 0;
    for (const task of tasks) {
      const tx = ('tx' in task ? task.tx : task) as IAutomationTransfer | IAutomationCancel;
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
        <div className="text-2xl font-bold">Recurring</div>
      </div>
      <>
        {tasks.length > 0 &&
          <div className="w-full relative">
            <Button
              className={"absolute right-0 -top-[3.75rem] text-lg  rounded-xl !px-3  py-2"}
              onClick={() => reccuringState[0].length > 0 ? setAddStopModal(true) : setSelectable(!selectable)}
            >
              {reccuringState[0].length > 0 ?
                `Confirm ${reccuringState[0].length} ${reccuringState[0].length > 1 ? "payments" : "payment"}`
                : selectable ? "Cancel Payment" : "Choose Payments"}
            </Button>
          </div>}
        <div className="px-5 pb-10 pt-6  shadow-custom bg-white dark:bg-darkSecond">
          <div className="flex  space-y-3 gap-12">
            <div className="flex flex-col space-y-5 gap-12 lg:gap-4">
              <div className="text-base font-semibold text-gray-500">Total Recurring Payment</div>
              <div className="text-3xl font-bold !mt-0">
                $ {totalPrice[1].toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col space-y-5 !mt-0">
              <div className="text-base font-semibold text-gray-500">Token Allocation</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12">
                {
                  Object.entries(totalPrice[0])
                    .filter((s) => s[1])
                    .map(([currency, amount]) => {
                      return (
                        <div key={currency} className="flex flex-col space-y-2 relative h-fit">
                          <div className="flex space-x-2">
                            <div className="font-bold text-xl">
                              {amount.toFixed(2)}
                            </div>
                            <div className="font-bold text-xl flex gap-1 items-center">
                              <img
                                src={GetCoins[currency as keyof Coins].logoURI}
                                className="w-[1.563rem] h-[1.563rem] rounded-full"
                                alt={GetCoins[currency as keyof Coins].name}
                              />
                              {GetCoins[currency as keyof Coins].name}
                            </div>
                          </div>
                          <div className="text-sm text-greylish opacity-75 text-left">
                            {(calculatePrice({ ...GetCoins[currency as keyof Coins], amount, coin: GetCoins[currency as keyof Coins] }) ?? 1).toFixed(2)} {symbol}
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </div>
        </div>
        <div className="w-full pt-4 pb-6 h-full">
          <table className="w-full">
            <thead>
              <tr className={`pl-5 grid ${selectable ? "grid-cols-[12.5%,repeat(6,minmax(0,1fr))]" : "grid-cols-[12.5%,repeat(5,minmax(0,1fr))]"} text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md`}>
                <th className="py-3 self-center text-left">Name</th>
                <th className="py-3 self-center text-left">Start Date</th>
                <th className="py-3 self-center text-left">End Date</th>
                <th className="py-3 self-center text-left">Amount</th>
                <th className="py-3 self-center text-left">Frequency</th>
                <th className="py-3 self-center text-left">Labels</th>
              </tr>
              {tasks.map((w) => {
                const hash = 'tx' in w ? w.tx.hash : w.hash;
                return <Fragment key={hash}> <TeamItem tx={w} members={members}  /> </Fragment>
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
