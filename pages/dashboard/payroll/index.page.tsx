import Button from 'components/button';
import { useState, useEffect } from 'react';
import {  IMember } from 'types/dashboard/contributors';
import { useAppSelector } from 'redux/hooks';
import _ from 'lodash';
import { useWalletKit } from 'hooks';
import  { TotalUSDAmount } from "pages/dashboard/requests/_components/totalAmount"
import Modal from 'components/general/Modal';
import TokenBalance from 'pages/dashboard/requests/_components/tokenBalance';
import { SelectBalance, SelectContributorMembers, SelectSelectedAccountAndBudget } from 'redux/slices/account/selector';
import PayrollItem from './_components/PayrollItem';
import { IPaymentInput } from 'pages/api/payments/send/index.api';
import TokensAllocation from './_components/tokensAllocation';


export default function DynamicPayroll() {
    const [isAvaible, setIsAviable] = useState<boolean>(false)
    const [runmodal, setRunmodal] = useState<boolean>(false)
    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const contributors = useAppSelector(SelectContributorMembers)
    const [selectedContributors, setSelectedContributors] = useState<IMember[]>([]);
    console.log(selectedContributors)

    useEffect(() => {
        if (!isAvaible) {
            setSelectedContributors([])
        }
    }, [isAvaible])

    const { GetCoins, SendTransaction } = useWalletKit()
    const balance = useAppSelector(SelectBalance)

    const totalAmount =  TotalUSDAmount(contributors, GetCoins);

    const confirmRequest = async () => {
        try {
          let inputs: IPaymentInput[] = [];
          const members = [...selectedContributors];
          for (const member of members){
            const amount = member.amount;
            const currency = member.currency;
            const address = member.address;
            const coin = Object.values(GetCoins).find((coin) => coin.name === currency)!;

            if(member.usdBase){
                if (member.secondaryAmount) {
                    const secondaryAmount = member.secondaryAmount;
                    const secondaryCurrency = member.secondaryCurrency;
                    const coin2 = Object.values(GetCoins).find((coin) => coin.name === secondaryCurrency)!;
                    inputs.push({
                      amount: Number(secondaryAmount) / coin2.priceUSD,
                      coin: coin2.symbol,
                      recipient: address,
                    });
                  }
                  
                  inputs.push({
                    amount: Number(amount) / coin.priceUSD,
                    coin: coin.symbol,
                    recipient: address,
                  });
            } else {
                if (member.secondaryAmount) {
                  const secondaryAmount = member.secondaryAmount;
                  const secondaryCurrency = member.secondaryCurrency;
                  const coin2Symbol = Object.values(GetCoins).find((coin) => coin.name === secondaryCurrency)!.symbol;
                  inputs.push({
                    amount: Number(secondaryAmount),
                    coin: coin2Symbol,
                    recipient: address,
                  });
                }
                
                inputs.push({
                  amount: Number(amount),
                  coin: coin.symbol,
                  recipient: address,
                });

            }
          };
    
          await SendTransaction(accountAndBudget.account!, inputs, {
            budget: accountAndBudget.budget,
          })
    
          inputs = [];
          setRunmodal(false)
        } catch (error) {
          console.log(error);
          throw new Error(error as any);
        }
      };

    return <div className="w-full h-full flex flex-col space-y-4">
        {<Modal onDisable={setRunmodal} openNotify={runmodal}  >

            {selectedContributors.length > 0 ? <div className="px-5 pt-20 w-[95%] h-[80%] mx-auto">
                <div className="text-2xl font-semibold py-2 pb-5 pt-4">Run Payroll</div>
                <div className="w-full  pt-4 pb-6 ">
                    <div id="header" className={`hidden sm:grid grid-cols-[30%,30%,1fr]  lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md`} >
                        <div className={` text-lg font-semibold text-greylish dark:text-[#aaaaaa] pl-4 `}>Contributor</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">Start Date</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa]">End Date</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">Salary</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">Frequency</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">Status</div>
                        <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">Compensation Type</div>
                    </div>
                    <div> 
                        {selectedContributors.map((contributor, index) => <PayrollItem key={contributor.id} runmodal={runmodal} isRuning={isAvaible} member={contributor} setSelectedMembers={setSelectedContributors}  />)}
                    </div>
                </div>
                <div className="flex flex-col space-y-3 pt-10">
                    <div className="text-2xl font-semibold tracking-wide">Review Treasury Impact</div>
                    {/* <TokenBalance coinList={selectedContributors} /> */}
                    {/* <div className="w-full flex flex-col   p-5 ">
                        <div className="grid grid-cols-[20%,80%]  pb-2">
                            <div className="text-lg text-greylish dark:text-opacity-90 font-semibold">Treasury Balance</div>
                            <div className="text-lg text-greylish dark:text-opacity-90 font-semibold">Token Allucation</div>
                        </div>
                        <div className="grid grid-cols-[20%,20%,20%,20%,20%]">
                            <div className="flex flex-col items-start   mb-5">
                                <TotalAmount coinList={memberState[0]} />
                            </div>
                            <>
                                <TokenBalance coinList={memberState[0]} />
                            </>
                        </div>
                    </div> */}
                    <div className="w-full flex flex-col  py-6 px-7 bg-white shadow-15 dark:bg-darkSecond  rounded-md">
                        <div className="grid grid-cols-[13.75%,86.25%] ">
                            {/* <div className={`font-semibold text-lg text-greylish dark:text-white ${memberState[0].length > 0 && 'border-r'}  border-greylish dark:border-[#454545]  border-opacity-10  h-9`}>Total Treasury</div>
                            {memberState[0].length > 0 && <div className="font-semibold text-lg text-greylish dark:text-white pl-5 h-9">Token Allocation</div>} */}
                        </div>
                        <div className="flex gap-5 justify-start items-start w-full relative">
                            {/* {memberState[0].length > 0 && <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>} */}
                            <div className="flex flex-col items-end w-[11.9rem] ">
                                {/* <TotalAmount coinList={memberState[0]} /> */}
                            </div>
                            <>
                                {/* <TokenBalance coinList={memberState[0]} /> */}
                            </>
                        </div>
                    </div>
                </div>
                <Button className={' w-[85%] py-3 mt-10 mb-3 ml-24'} >Confirm and Run Payroll</Button>
            </div> : <div className="text-primary text-2xl font-semibold pt-12  px-2">please choose some of the members.!</div>}
        </Modal>}
        
        <>
            <div className="flex justify-between items-center w-full space-y-3">
                    <div className="text-4xl font-bold">
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
            <div className=" pt-4  pb-5 pl-5 max-h-[9.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md">
                <div className='flex '>
                    <div className='flex flex-col space-y-5 gap-12 lg:gap-4 pr-8 border-r border-greylish dark:border-[#454545] border-opacity-10'>
                        <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Total Monthly Payment</div>
                        <div className='text-3xl font-semibold !mt-1'>
                            ${totalAmount.toLocaleString()}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-5 pl-8 !mt-0">
                        <div className='text-lg text-greylish dark:text-opacity-90 font-semibold'>Token Allocation</div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12 pb-5'>    
                                <TokensAllocation itemsList={contributors} />
                            {/* <div className="flex flex-col items-start  h-fit">
                                <div className="font-semibold text-2xl flex gap-2 items-center">
                                    <img src={`/icons/currencies/celo.png`} width="24" height="24" className=" rounded-full" alt="" />
                                    <div className="font-semibold text-xl">26,000</div>
                                </div>
                                <div>
                                </div>
                                <div className="font-medium text-sm  text-greylish  text-left pl-10">
                                    $26,000
                                </div>
                            </div> */}
                        </div>

                    </div>
                </div>
            </div>
            <table className="w-full pt-1 pb-4 ">
                <thead>
                    <tr id="header" className={`hidden sm:grid grid-cols-[30%,30%,1fr]  lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md`} >
                        <th className={`text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ${isAvaible ? "pl-4" : "pl-2" }`}>Contributor</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Start Date</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">End Date</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Salary</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Frequency</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Status</th>
                        <th className=" text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Compensation Type</th>
                    </tr>
                </thead>
                <tbody>
                    {contributors.map((contributor) => <PayrollItem runmodal={runmodal} isRuning={isAvaible} key={contributor.id} member={contributor} selectedMembers={selectedContributors} setSelectedMembers={setSelectedContributors}  /> )}
                </tbody>
            </table>
        </>
    </div>

}
