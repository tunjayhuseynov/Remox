import Button from 'components/button';
import { useState, useEffect, useMemo } from 'react';
import { IMember } from 'types/dashboard/contributors';
import { useAppSelector } from 'redux/hooks';
import _ from 'lodash';
import { useWalletKit } from 'hooks';
import Modal from 'components/general/modal';
import { SelectBalance, SelectContributorMembers, SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectIndividual, SelectOrganization, SelectPriceCalculationFn, SelectSelectedAccountAndBudget } from 'redux/slices/account/selector';
import PayrollItem from './_components/PayrollItem';
import { IPaymentInput } from 'pages/api/payments/send/index.api';
import { AltCoins, Coins } from 'types';
import RunModal from './_components/modalpay/runModal';
import { generatePriceCalculation, GetFiatPrice } from 'utils/const';
import { FiatMoneyList } from 'firebaseConfig';
import ChooseBudget from 'components/general/chooseBudget';
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { IAccountORM } from "pages/api/account/index.api";
import datetime from 'date-and-time'
import { NG } from 'utils/jsxstyle'

export default function DynamicPayroll() {
  const [isAvaible, setIsAviable] = useState<boolean>(false)
  const [runmodal, setRunmodal] = useState<boolean>(false)
  const contributors = useAppSelector(SelectContributorMembers)
  const [selectedContributors, setSelectedContributors] = useState<IMember[]>([]);
  const defaultFiat = useAppSelector(SelectFiatPreference)
  const fiatSymbol = useAppSelector(SelectFiatSymbol)
  const { GetCoins, SendTransaction } = useWalletKit()
  const [choosingBudget, setChoosingBudget] = useState<boolean>(false)
  const organizatiion = useAppSelector(SelectOrganization)
  const individual = useAppSelector(SelectIndividual)
  const hp  = useAppSelector(SelectHistoricalPrices)
  const balance = useAppSelector(SelectBalance)

  const pc = organizatiion?.priceCalculation ?? individual?.priceCalculation ?? "current"

  useEffect(() => {
    if (!isAvaible) {
      setSelectedContributors([])
    }
  }, [isAvaible])

  const totalMonthlyPayment = TotalMonthlyAmount(contributors, Object.values(GetCoins), defaultFiat)


  const ExecutePayroll = async (account: IAccountORM | undefined, budget?: IBudgetORM | null, subbudget?: ISubbudgetORM | null) => {
    try {
      let inputs: IPaymentInput[] = [];
      const members = [...selectedContributors];
      for (const member of members) {
        const amount = member.amount;
        const address = member.address;
        const coin = Object.values(GetCoins).find((coin) => coin.symbol === member.currency);

        if (member.fiat) {
          const fiatAmount = generatePriceCalculation(balance[coin!.symbol], hp, pc ,member.fiat)

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
          const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === member.secondCurrency);

          if (member.fiatSecond) {
            const fiatAmount = generatePriceCalculation(balance[coin2!.symbol], hp, pc ,member.fiatSecond)

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
      };

      await SendTransaction(account!, inputs, {
        budget: budget,
        subbudget: subbudget
      })

      inputs = [];

      setSelectedContributors([]);
      setIsAviable(false)
      setRunmodal(false)
      setChoosingBudget(false)
    } catch (error) {
      console.log(error);
      throw new Error(error as any);
    }
  }


  const totalPrice: [{ [name: string]: number }, number] = useMemo(() => {
    let res: { [name: string]: number } = {};
    let total = 0
    for (const contributor of contributors) {
      const coin1 = Object.values(GetCoins).find((coin) => coin.symbol === contributor.currency)
      const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === contributor.secondCurrency)

      const amount = contributor.amount
      total += +amount * (coin1?.priceUSD ?? 0)
      if (res[coin1?.symbol ?? ""]) {
        res[coin1?.symbol ?? ""] += +amount
      } else {
        res[coin1?.symbol ?? ""] = +amount
      }
      if (contributor.secondAmount) {
        const secondaryAmount = contributor.secondAmount
        total += +secondaryAmount * (coin2?.priceUSD ?? 0)
        if (res[coin2?.symbol ?? ""]) {
          res[coin2?.symbol ?? ""] += +secondaryAmount
        } else {
          res[coin2?.symbol ?? ""] = +secondaryAmount
        }
      }
    }


    return [res, total];
  }, [])


  return <>
    {<Modal onDisable={setRunmodal} openNotify={runmodal}  >
      <RunModal selectedContributors={selectedContributors} setChoosingBudget={setChoosingBudget} runmodal={runmodal} isAvaible={isAvaible} setSelectedContributors={setSelectedContributors} />
    </Modal>}
    <div className='space-y-5'>
      <div className="flex justify-between items-center w-full">
        <div className="text-2xl font-semibold tracking-wide">
          Payroll
        </div>
        <div className='flex gap-2'>
          {contributors.length > 0 &&  <Button onClick={() => setIsAviable(!isAvaible)} className={"!py-[.5rem] !font-semibold !text-sm cursor-pointer !px-0 min-w-[9.1rem]"} >
            {isAvaible ? "Cancel Payroll" : "Run Payroll"}
          </Button>}
          {selectedContributors.length > 0 && <Button onClick={() => setRunmodal(true)} className={"!py-[.5rem] !font-semibold !text-sm cursor-pointer !px-0 min-w-[9.1rem]"} >
            Submit Payroll
          </Button>}
        </div>
      </div>
      {contributors.length > 0 && <div className="pt-4 !mt-10 pb-5 pl-5 max-h-[9.1rem] bg-white shadow-15 dark:bg-darkSecond rounded-md">
        <div className='flex'>
          <div className='flex flex-col space-y-5 gap-12 lg:gap-4 pr-8 border-r border-greylish dark:border-[#454545] border-opacity-10'>
            <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Total Monthly Payment</div>
            <div className='text-3xl font-semibold !mt-1'>
              {fiatSymbol}{totalMonthlyPayment.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-col space-y-5 pl-8 !mt-0">
            <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Token Allocation</div>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12 pb-5'>
              {Object.entries(totalPrice[0]).map(([currency, amount], index) => {
                return <div key={index} className="flex flex-col items-start  h-fit">
                  <div className="font-semibold text-2xl grid grid-cols-[1.5rem,1fr] gap-2">
                    <img src={GetCoins[currency as keyof Coins].logoURI} width="24" height="24" className="self-center rounded-full" alt="" />
                    <div className="font-semibold text-xl"><NG number={amount} fontSize={1.25} /></div>
                  </div>
                  <div className="font-medium text-sm text-greylish text-left pl-[2rem]">
                    {fiatSymbol}{(amount * GetCoins[currency as keyof Coins].priceUSD).toLocaleString()}
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>
      </div>}
      <table className="w-full pt-1 pb-4 ">
        <thead>
          <tr id="header" className={`grid lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-darkSecond rounded-md`} >
            <th className={`text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ${isAvaible ? "pl-4" : "pl-2"}`}>Contributor</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Start Date</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">End Date</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Salary</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Frequency</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Status</th>
            <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Compensation Type</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map((contributor) => <PayrollItem runmodal={runmodal} isRuning={isAvaible} key={contributor.id} member={contributor} selectedMembers={selectedContributors} setSelectedMembers={setSelectedContributors} />)}
          {
            contributors.length === 0 && (
              <div className="pl-5 py-10 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom text-center w-full">
                No Data
              </div>
            )
          }
        </tbody>
      </table>

    </div>
    <Modal openNotify={choosingBudget} onDisable={setChoosingBudget}>
      <ChooseBudget submit={ExecutePayroll} />
    </Modal>
  </>
}


const TotalMonthlyAmount = (contributorsList: IMember[], Coins: AltCoins[], Fiat: FiatMoneyList) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return contributorsList.reduce((acc, curr) => {
    const coin = Coins.find((c) => c.symbol === curr.currency)
    console.log(curr)
    if (!coin) return acc;
    const fiatPrice = GetFiatPrice(coin, Fiat) * +curr.amount
    let fiatPrice2 = 0;
    const coin2 = Coins.find((c) => c.symbol === curr.secondCurrency)
    if (coin2 && curr.secondAmount) {
      fiatPrice2 = GetFiatPrice(coin2, Fiat) * +curr.secondAmount
    }
    const contributorStartMonth = new Date(curr.paymantDate)
    const contributorEndMonth = new Date(curr.paymantEndDate)

    // if (now.getTime() > contrpibutorEndMonth.getTime()) return acc;

    const contributorYear = new Date(curr.paymantEndDate).getFullYear()
    const monthDays = daysInMonth(now.getTime(), currentYear)

    if (curr.execution === "Manual") {
      if (curr.interval === "monthly") {
        if (now.getMonth() === contributorEndMonth.getMonth()) {
          acc += fiatPrice + fiatPrice2
        }
      } else {
        const diff = Math.abs(datetime.subtract(contributorStartMonth, contributorEndMonth).toDays());
        let weeks = Math.floor(diff / 7)
        while (weeks) {
          const crr = datetime.addDays(contributorStartMonth, 7 * weeks)
          if (crr.getMonth() === now.getMonth()) {
            acc += fiatPrice + fiatPrice2
          }
          weeks -= 1;
        }
      }
    } else {
      const comDiff = Math.abs(datetime.subtract(contributorStartMonth, contributorEndMonth).toDays());
      const firstPrice = fiatPrice / comDiff
      const secondPrice = fiatPrice2 / comDiff
      if (now.getMonth() === contributorEndMonth.getMonth()) {
        const diff = Math.abs(datetime.subtract(now, contributorEndMonth).toDays())
        acc += (firstPrice * diff) + (secondPrice * diff)
      }
      else {
        const diff = Math.abs(datetime.subtract(now, new Date(now.getFullYear(), now.getMonth() + 1, 0)).toDays())
        acc += (firstPrice * diff) + (secondPrice * diff)
      }
    }

    return acc
  }, 0)
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

const days = (date_1: number, date_2: number) => {
  let difference = new Date(date_1).getTime() - new Date(date_2).getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
}

// Monthly Current Month
// Monthly Next Month 
