import Button from 'components/button';
import { useState, useEffect, useMemo } from 'react';
import {  IMember } from 'types/dashboard/contributors';
import { useAppSelector } from 'redux/hooks';
import _ from 'lodash';
import { useWalletKit } from 'hooks';
import  { TotalFiatAmount } from "pages/dashboard/requests/_components/totalAmount"
import Modal from 'components/general/modal';
import { SelectBalance, SelectContributorMembers, SelectFiatPreference, SelectFiatSymbol, SelectSelectedAccountAndBudget } from 'redux/slices/account/selector';
import PayrollItem from './_components/PayrollItem';
import { IPaymentInput } from 'pages/api/payments/send/index.api';
import { AltCoins, Coins } from 'types';
import RunModal from './_components/modalpay/runModal';
import { GetFiatPrice } from 'utils/const';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { FiatMoneyList } from 'firebaseConfig';


export default function DynamicPayroll() {
    const [isAvaible, setIsAviable] = useState<boolean>(false)
    const [runmodal, setRunmodal] = useState<boolean>(false)
    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const contributors = useAppSelector(SelectContributorMembers)
    const [selectedContributors, setSelectedContributors] = useState<IMember[]>([]);
    const defaultFiat = useAppSelector(SelectFiatPreference)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const { GetCoins, SendTransaction } = useWalletKit()


    useEffect(() => {
        if (!isAvaible) {
            setSelectedContributors([])
        }
    }, [isAvaible])

    useAsyncEffect(async() => {
      const totalMonthlyPayment = await TotalMonthlyAmount(contributors, Object.values(GetCoins), defaultFiat)
    }, [])


    const totalAmount =  TotalFiatAmount(contributors, GetCoins, defaultFiat);

    const ExecutePayroll = async () => {
        try {
          let inputs: IPaymentInput[] = [];
          const members = [...selectedContributors];
          for (const member of members){
            const amount = member.amount;
            const address = member.address;
            const coin = Object.values(GetCoins).find((coin) => coin.symbol === member.currency);
    
            if(member.fiat) {
              const fiatPrice = GetFiatPrice(coin!, member.fiat)
    
              inputs.push({
                amount: Number(amount) / (fiatPrice),
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
    
            if(member.secondCurrency && member.secondAmount) {
              const secondAmount = member.secondAmount;
              const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === member.secondCurrency);
    
              if(member.fiatSecond) {
                const fiatPrice = GetFiatPrice(coin2!, member.fiatSecond)
    
                inputs.push({
                  amount: Number(secondAmount) / (fiatPrice),
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

          await SendTransaction(accountAndBudget.account!, inputs, {
            budget: accountAndBudget.budget,
          })
    
          inputs = [];
          
          setSelectedContributors([]);
          setIsAviable(false)
          setRunmodal(false)
        } catch (error) {
          console.log(error);
          throw new Error(error as any);
        }
    }

  
    const totalPrice: [{ [name: string]: number }, number] = useMemo(() => {
      let res: {[name: string]: number} = {};
      let total = 0
      for(const contributor of contributors){
        const coin1 = Object.values(GetCoins).find((coin) => coin.symbol === contributor.currency)
        const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === contributor.secondCurrency)

        const amount = contributor.amount
        total += +amount * (coin1?.priceUSD ?? 0)
        if(res[coin1?.symbol ?? ""]){
          res[coin1?.symbol ?? ""] += +amount
        } else{
          res[coin1?.symbol ?? ""] = +amount
        }
        if(contributor.secondAmount){
          const secondaryAmount = contributor.secondAmount
          total += +secondaryAmount * (coin2?.priceUSD ?? 0)
          if(res[coin2?.symbol ?? ""]){
            res[coin2?.symbol ?? ""] += +secondaryAmount
          } else{
            res[coin2?.symbol ?? ""] = +secondaryAmount
          }
        }
      }


      return [res, total];
    }, [])
    

    return <div className="w-full h-full flex flex-col space-y-4">
        {<Modal onDisable={setRunmodal} openNotify={runmodal}  >    
            <RunModal selectedContributors={selectedContributors} ExecutePayroll={ExecutePayroll} runmodal={runmodal} isAvaible={isAvaible} setSelectedContributors={setSelectedContributors} />
        </Modal>}
        
        <>
            <div className="flex justify-between items-center w-full space-y-3">
                    <div className="text-2xl font-bold">
                        Payroll
                    </div>
                    <div>
                        <Button onClick={() => setIsAviable(!isAvaible)} className={"!py-[.5rem] !font-medium !text-lg !px-0 min-w-[9.1rem]"} >
                            {isAvaible ? "Cancel Payroll" : "Run Payroll"}
                        </Button>
                        {selectedContributors.length > 0 && <Button onClick={() => setRunmodal(true)} className={"!py-[.5rem] ml-2 !font-medium !text-lg !px-0 min-w-[9.1rem]"} >
                            Submit Payroll
                        </Button> }
                    </div>
            </div>
            <div className="pt-4 pb-5 pl-5 max-h-[9.1rem] bg-white shadow-15 dark:bg-darkSecond rounded-md">
                <div className='flex'>
                    <div className='flex flex-col space-y-5 gap-12 lg:gap-4 pr-8 border-r border-greylish dark:border-[#454545] border-opacity-10'>
                        <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Total Monthly Payment</div>
                        <div className='text-3xl font-semibold !mt-1'>
                            {fiatSymbol}{totalAmount.toLocaleString()}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-5 pl-8 !mt-0">
                        <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Token Allocation</div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12 pb-5'>    
                        {Object.entries(totalPrice[0]).map(([currency, amount], index) => {
                            return <div key={index} className="flex flex-col items-start  h-fit">
                                        <div className="font-semibold text-2xl flex gap-2 items-center">
                                            <img src={GetCoins[currency as keyof Coins].logoURI} width="24" height="24" className=" rounded-full" alt="" />
                                        <div className="font-semibold text-xl">{amount.toFixed(2)}</div>
                                        </div>
                                        <div className="font-medium text-sm  text-greylish  text-left pl-10">
                                            ${(amount * GetCoins[currency as keyof Coins].priceUSD).toLocaleString()}
                                        </div>
                            </div>})}
                        </div>
                    </div>
                </div>
            </div>
            <table className="w-full pt-1 pb-4 ">
                <thead>
                    <tr id="header" className={`grid lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-darkSecond rounded-md`} >
                        <th className={`text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ${isAvaible ? "pl-4" : "pl-2" }`}>Contributor</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Start Date</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">End Date</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Salary</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Frequency</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Status</th>
                        <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Compensation Type</th>
                    </tr>
                </thead>
                <tbody>
                    {contributors.map((contributor) => <PayrollItem runmodal={runmodal} isRuning={isAvaible} key={contributor.id} member={contributor} selectedMembers={selectedContributors} setSelectedMembers={setSelectedContributors}  /> )}
                </tbody>
            </table>
        </>
    </div>
}


const TotalMonthlyAmount = async (contributorsList: IMember[], Coins: AltCoins[], Fiat: FiatMoneyList ) => {
  const date = new Date()
  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()

  return contributorsList.reduce((acc, curr) => {
    const coin = Coins.find((c) => c.symbol === curr.currency)
    const fiatPrice = GetFiatPrice(coin ?? Coins[0], Fiat)
    const coin2 = Coins.find((c) => c.symbol === curr.secondCurrency)
    const fiatPrice2 = GetFiatPrice(coin2 ?? Coins[1], Fiat)
    const contributorStartMonth = new Date(curr.paymantDate).getMonth()
    const contributorEndMonth = new Date(curr.paymantEndDate).getMonth()
    const contributorYear = new Date(curr.paymantEndDate).getFullYear()

    if(contributorYear === currentYear) {
      if(curr.execution === "Manual"){
        if(curr.interval === "monthly") {
          if(currentMonth === contributorEndMonth) {
            if(coin) {
              const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount
              if(curr.fiat){
                const tokenFiatPrice = GetFiatPrice(coin!, curr.fiat)
                const tokenAmount = amount / tokenFiatPrice
                acc += (tokenAmount * fiatPrice )
              } else {
                acc += (amount  * fiatPrice)
              }    
            }
    
            if(curr.secondAmount && curr.secondCurrency && coin2 ) {
              const secondCoin = Object.values(Coins).find((c) => c.symbol === curr.secondCurrency)
              const amount = typeof curr.secondAmount === "string" ? parseFloat(curr.secondAmount) : curr.secondAmount
              if (curr.fiatSecond) {
                  const tokenFiatPrice = GetFiatPrice(secondCoin!, curr.fiatSecond)
                  const tokenAmount = amount / tokenFiatPrice
                  acc += (tokenAmount * fiatPrice )
              } else {
                  acc += (amount * fiatPrice)
              }
            }
          } else {
            acc += 0
          }
        } else if(curr.interval === "weekly") {
          const daysDiff = days(curr.paymantDate, curr.paymantEndDate)
          if((contributorEndMonth && contributorStartMonth) === currentMonth){

          }

        }
      }
    } else {
      acc += 0
    }

    return acc 
  }, 0)
}

function daysInMonth (month : number, year: number) {
  return new Date(year, month, 0).getDate();
}

const days = (date_1 : number, date_2: number) =>{
  let difference = new Date(date_1).getTime() - new Date(date_2).getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
}

// Monthly Current Month
// Monthly Next Month 
 