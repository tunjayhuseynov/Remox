import Button from "components/button";
import { useState, useEffect, useMemo } from "react";
import { IMember } from "types/dashboard/contributors";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import _ from "lodash";
import { useContributors, useWalletKit } from "hooks";
import Modal from "components/general/modal";
import {
  SelectBalance,
  SelectContributorMembers,
  SelectFiatPreference,
  SelectFiatSymbol,
  SelectHistoricalPrices,
  SelectIndividual,
  SelectOrganization,
  SelectPriceCalculationFn,
  SelectSelectedAccountAndBudget,
} from "redux/slices/account/selector";
import PayrollItem from "./_components/PayrollItem";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import { AltCoins, Coins } from "types";
import RunModal from "./_components/modalpay/runModal";
import { generatePriceCalculation, GetFiatPrice } from "utils/const";
import { FiatMoneyList } from "firebaseConfig";
import ChooseBudget from "components/general/chooseBudget";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { IAccountORM } from "pages/api/account/index.api";
import datetime from "date-and-time";
import { NG } from "utils/jsxstyle";
import { updateMemberCheckDate } from "redux/slices/account/remoxData";
import { ToastRun } from "utils/toast";

export default function DynamicPayroll() {
  const [isAvaible, setIsAviable] = useState<boolean>(false);
  const [runmodal, setRunmodal] = useState<boolean>(false);
  const contributors = useAppSelector(SelectContributorMembers);
  const [selectedContributors, setSelectedContributors] = useState<IMember[]>(
    []
  );
  const defaultFiat = useAppSelector(SelectFiatPreference);
  const fiatSymbol = useAppSelector(SelectFiatSymbol);
  const { GetCoins, SendTransaction } = useWalletKit();
  const [choosingBudget, setChoosingBudget] = useState<boolean>(false);
  const organizatiion = useAppSelector(SelectOrganization);
  const individual = useAppSelector(SelectIndividual);
  const hp = useAppSelector(SelectHistoricalPrices);
  const balance = useAppSelector(SelectBalance);
  const { updateMemberDate } = useContributors();
  const dispatch = useAppDispatch();

  const pc =
    organizatiion?.priceCalculation ??
    individual?.priceCalculation ??
    "current";

  useEffect(() => {
    if (!isAvaible) {
      setSelectedContributors([]);
    }
  }, [isAvaible]);

  const totalMonthlyPayment = TotalMonthlyAmount(
    contributors,
    Object.values(GetCoins),
    defaultFiat
  );

  const ExecutePayroll = async (
    account: IAccountORM | undefined,
    budget?: IBudgetORM | null,
    subbudget?: ISubbudgetORM | null
  ) => {
    try {
      let inputs: IPaymentInput[] = [];
      const members = [...selectedContributors];
      const dateNow = new Date().getTime();
      for (const member of members) {
        const amount = member.amount;
        const address = member.address;
        const coin = Object.values(GetCoins).find(
          (coin) => coin.symbol === member.currency
        );

        if (member.fiat) {
          const fiatAmount = generatePriceCalculation(
            balance[coin!.symbol],
            hp,
            pc,
            member.fiat
          );

          inputs.push({
            amount: fiatAmount,
            coin: coin?.symbol ?? "",
            recipient: address,
          });
        } else {
          inputs.push({
            amount: Number(amount),
            coin: coin?.symbol ?? "",
            recipient: address,
          });
        }

        if (member.secondCurrency && member.secondAmount) {
          const secondAmount = member.secondAmount;
          const coin2 = Object.values(GetCoins).find(
            (coin) => coin.symbol === member.secondCurrency
          );

          if (member.fiatSecond) {
            const fiatAmount = generatePriceCalculation(
              balance[coin2!.symbol],
              hp,
              pc,
              member.fiatSecond
            );

            inputs.push({
              amount: fiatAmount,
              coin: coin2?.symbol ?? "",
              recipient: address,
            });
          } else {
            inputs.push({
              amount: Number(secondAmount),
              coin: coin2?.symbol ?? "",
              recipient: address,
            });
          }
        }
      }

      await SendTransaction(account!, inputs, {
        budget: budget,
        subbudget: subbudget,
      });

      for (const member of members) {
        await updateMemberDate(member.teamId, member.id);
        dispatch(
          updateMemberCheckDate({
            id: member.teamId,
            member: member,
          })
        );
      }

      inputs = [];

      setSelectedContributors([]);
      setIsAviable(false);
      setRunmodal(false);
      setChoosingBudget(false);
    } catch (error) {
      console.log(error);
      ToastRun((error as any).message, "error");
    }
  };

  const totalPrice: [{ [name: string]: number }, number] = useMemo(() => {
    let res: { [name: string]: number } = {};
    let total = 0;
    for (const contributor of contributors) {
      const coin1 = Object.values(GetCoins).find(
        (coin) => coin.symbol === contributor.currency
      );
      const coin2 = Object.values(GetCoins).find(
        (coin) => coin.symbol === contributor.secondCurrency
      );
      if (!coin1) continue;
      let coinFiat = contributor.fiat ? GetFiatPrice(coin1, contributor.fiat) : 1
      const amount = +contributor.amount / (contributor.fiat ? coinFiat : 1);
      total += +amount;
      if (res[coin1.symbol ?? ""]) {
        res[coin1.symbol ?? ""] += +amount;
      } else {
        res[coin1.symbol ?? ""] = +amount;
      }
      if (contributor.secondAmount) {
        if (!coin2) continue;
        let coinFiat = contributor.fiatSecond ? GetFiatPrice(coin2, contributor.fiatSecond) : 1
        const secondaryAmount = +contributor.secondAmount / (contributor.fiatSecond ? coinFiat : 1);
        const amount2 = +secondaryAmount / (contributor.fiatSecond ? coinFiat : 1);
        total += amount2;
        if (res[coin2?.symbol ?? ""]) {
          res[coin2?.symbol ?? ""] += +amount2;
        } else {
          res[coin2?.symbol ?? ""] = +amount2;
        }
      }
    }

    return [res, total];
  }, []);

  return (
    <>
      {
        <Modal onDisable={setRunmodal} openNotify={runmodal}>
          <RunModal
            selectedContributors={selectedContributors}
            setChoosingBudget={setChoosingBudget}
            runmodal={runmodal}
            isAvaible={isAvaible}
            setSelectedContributors={setSelectedContributors}
          />
        </Modal>
      }
      <div className="space-y-5">
        <div className="flex justify-between items-center w-full">
          <div className="text-2xl font-semibold tracking-wide">Payroll</div>
          <div className="flex gap-2">
            {contributors.length > 0 && (
              <Button
                onClick={() => setIsAviable(!isAvaible)}
                className={
                  "!py-[.5rem] !font-semibold !text-sm cursor-pointer !px-0 min-w-[9.1rem]"
                }
              >
                {isAvaible ? "Cancel Payroll" : "Run Payroll"}
              </Button>
            )}
            {selectedContributors.length > 0 && (
              <Button
                onClick={() => setRunmodal(true)}
                className={
                  "!py-[.5rem] !font-semibold !text-sm cursor-pointer !px-0 min-w-[9.1rem]"
                }
              >
                Submit Payroll
              </Button>
            )}
          </div>
        </div>
        {/* {contributors.length > 0 && (
          <div className="pt-4 !mt-10 pb-5 px-3 max-h-[9.1rem] bg-white shadow-15 dark:bg-darkSecond rounded-md">
            <div className="flex">
              <div className="flex flex-col space-y-5 gap-4 pr-8 border-r border-greylish dark:border-[#454545] border-opacity-10">
                <div className="text-base text-greylish dark:text-opacity-90 font-semibold">
                  Total Monthly Payment
                </div>
                <div className="text-3xl font-semibold !mt-1">
                  {fiatSymbol}
                  <NG number={totalMonthlyPayment} fontSize={1.75} />
                </div>
              </div>
              <div className="flex flex-col space-y-5 pl-8 !mt-0">
                <div className="text-base text-greylish dark:text-opacity-90 font-semibold">
                  Token Allocation
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12 pb-5">
                  {Object.entries(totalPrice[0]).map(
                    ([currency, amount], index) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-start  h-fit"
                        >
                          <div className="font-semibold text-2xl grid grid-cols-[1.5rem,1fr] gap-2">
                            <img
                              src={GetCoins[currency as keyof Coins].logoURI}
                              width="24"
                              height="24"
                              className="self-center rounded-full"
                              alt=""
                            />
                            <div className="font-semibold text-xl">
                              <NG number={amount} fontSize={1.25} />
                            </div>
                          </div>
                          <div className="font-medium text-sm text-greylish text-left pl-[2rem]">
                            {fiatSymbol}
                            <NG number={amount * GetFiatPrice(GetCoins[currency as keyof Coins], defaultFiat)} />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )} */}
        <table className="w-full pt-1 pb-4 ">
          <thead>
            {/* grid-cols-[18%,11%,11%,13%,13%,12%,9%,13%] */}
            <tr
              id="header"
              className={`grid  grid-cols-[18.5%,9.5%,9.5%,15.5%,12.5%,12.5%,9.5%,12.5%] bg-[#F2F2F2] shadow-15 py-2 dark:bg-darkSecond rounded-md`}
            >
              <th
                className={`text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] pl-4`}
              >
                Contributor
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">
                Start Date
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                End Date
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Progress
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">
                Amount
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">
                Frequency
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">
                Status
              </th>
              <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">
                Comp. Type
              </th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((contributor) => (
              <PayrollItem
                runmodal={runmodal}
                isRuning={isAvaible}
                key={contributor.id}
                member={contributor}
                selectedMembers={selectedContributors}
                setSelectedMembers={setSelectedContributors}
              />
            ))}
          </tbody>
        </table>

        {contributors.length === 0 && (
          <div className="pl-5 py-10 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom text-center w-full">
            No Data
          </div>
        )}
      </div>
      <Modal openNotify={choosingBudget} onDisable={setChoosingBudget}>
        <ChooseBudget submit={ExecutePayroll} />
      </Modal>
    </>
  );
}

const TotalMonthlyAmount = (
  contributorsList: IMember[],
  Coins: AltCoins[],
  Fiat: FiatMoneyList
) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return contributorsList.reduce((acc, curr) => {
    const coin = Coins.find((c) => c.symbol === curr.currency);
    if (!coin) return acc;
    const fiatPrice = GetFiatPrice(coin, Fiat) * +curr.amount;
    let fiatPrice2 = 0;
    const coin2 = Coins.find((c) => c.symbol === curr.secondCurrency);
    if (coin2 && curr.secondAmount) {
      fiatPrice2 = GetFiatPrice(coin2, Fiat) * +curr.secondAmount;
    }
    const contributorStartMonth = new Date(curr.paymantDate * 1e3);

    if (curr.execution === "Manual") {
      if (curr.interval === "monthly") {
        if (curr.paymantEndDate) {
          const contributorEndMonth = new Date(curr.paymantEndDate * 1e3);
          const diff = Math.floor(
            Math.abs(
              datetime
                .subtract(contributorStartMonth, contributorEndMonth)
                .toDays()
            )
          );
          if (now.getMonth() === contributorEndMonth.getMonth()) {
            acc += fiatPrice + fiatPrice2;
          } else if (diff > 28) {
            const monthPassed = currentMonth - contributorStartMonth.getMonth();

            const diffInMounth = MonthDiff(
              contributorStartMonth,
              contributorEndMonth
            );
            if (monthPassed < diffInMounth) {
              acc += fiatPrice + fiatPrice2;
            }
            console.log("Month Passed: " + diffInMounth);
          }
        } else {
          acc += fiatPrice + fiatPrice2;
        }
      } else {
        if (curr.paymantEndDate) {
          const contributorEndMonth = new Date(curr.paymantEndDate * 1e3);
          const diff = Math.abs(
            datetime
              .subtract(contributorStartMonth, contributorEndMonth)
              .toDays()
          );
          let weeks = Math.floor(diff / 7);
          while (weeks) {
            const crr = datetime.addDays(contributorStartMonth, 7 * weeks);
            if (crr.getMonth() === now.getMonth()) {
              acc += fiatPrice + fiatPrice2;
            }
            weeks -= 1;
          }
        } else {
          if (now >= contributorStartMonth) {
            if (
              now.getFullYear() > contributorStartMonth.getFullYear() &&
              now.getMonth() > contributorStartMonth.getMonth()
            ) {
              let weeks = weeksCount(currentYear, currentMonth);
              while (weeks) {
                const crr = datetime.addDays(contributorStartMonth, 7 * weeks);
                if (crr.getMonth() === now.getMonth()) {
                  acc += fiatPrice + fiatPrice2;
                }
                weeks -= 1;
              }
            } else if (
              now.getFullYear() === contributorStartMonth.getFullYear() &&
              now.getMonth() === contributorStartMonth.getMonth()
            ) {
              const days = daysInMonth(
                contributorStartMonth.getMonth(),
                contributorStartMonth.getFullYear()
              );
              let remainsWeek = Math.floor(
                (days - contributorStartMonth.getDate()) / 7
              );
              while (remainsWeek) {
                const crr = datetime.addDays(
                  contributorStartMonth,
                  7 * remainsWeek
                );
                if (crr.getMonth() === now.getMonth()) {
                  acc += fiatPrice + fiatPrice2;
                }
                remainsWeek -= 1;
              }
            }
          }
        }
      }
    } else {
      const contributorEndMonth = new Date(curr.paymantEndDate! * 1e3);
      const comDiff = Math.abs(
        datetime.subtract(contributorStartMonth, contributorEndMonth).toDays()
      );
      const firstPrice = fiatPrice / comDiff;
      const secondPrice = fiatPrice2 / comDiff;
      if (now.getMonth() === contributorEndMonth.getMonth()) {
        const diff = Math.abs(
          datetime.subtract(now, contributorEndMonth).toDays()
        );
        acc += firstPrice * diff + secondPrice * diff;
      } else {
        const diff = Math.abs(
          datetime
            .subtract(now, new Date(now.getFullYear(), now.getMonth() + 1, 0))
            .toDays()
        );
        acc += firstPrice * diff + secondPrice * diff;
      }
    }

    return acc;
  }, 0);
};

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export const DayDifference = (date_1: number, date_2: number) => {
  let difference = new Date(date_2).getTime() - new Date(date_1).getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
};

export function MonthDiff(d1: Date, d2: Date) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export const weeksCount = (year: number, month_number: number) => {
  const firstOfMonth = new Date(year, month_number - 1, 1);
  let day = firstOfMonth.getDay() || 6;
  day = day === 1 ? 0 : day;
  if (day) {
    day--;
  }
  let diff = 7 - day;
  const lastOfMonth = new Date(year, month_number, 0);
  const lastDate = lastOfMonth.getDate();
  if (lastOfMonth.getDay() === 1) {
    diff--;
  }
  const result = Math.ceil((lastDate - diff) / 7);
  return result + 1;
};

// Monthly Current Month
// Monthly Next Month
