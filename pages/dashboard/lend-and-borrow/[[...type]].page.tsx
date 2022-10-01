import AnimatedTabBar from 'components/animatedTabBar';
import Button from 'components/button';
import { useRouter } from 'next/router';
import { useState } from 'react';
import DynamicLendBorrow from './_components/dynamicLendBorrow';

const Lendborrow = () => {
    const router = useRouter()
    const { type } = router.query as { type: string[] | undefined }
    const [tokenData, setTokenData] = useState('Variable')
    const [apy, setApy] = useState(false)

    const data = [
        {
            to: "/dashboard/lend-and-borrow",
            text: "Lending"
        },
        {
            to: "/dashboard/lend-and-borrow/borrow",
            text: "Borrowing"
        }
    ]
   
    return <div className="flex flex-col pt-8 space-y-3">
    <div className="flex items-center justify-between ">
        <div className="flex items-center justify-center gap-4">
            <div className="text-2xl font-semibold">
                Lend & Borrow
            </div>
            <div className="bg-light dark:bg-dark border border-[#D6D6D6] dark:border-greylish py-1 px-2 flex rounded-md ml-5">
                <div className={`text-primary cursor-pointer ${tokenData === 'Variable' && '!text-white !bg-primary rounded-md'} px-3 py-[3px]`} onClick={() => { setTokenData('Variable') }}>Variable</div>
                <div className={`text-primary cursor-pointer ${tokenData === 'Stable' && '!text-white !bg-primary rounded-md'} px-3 py-[3px]`} onClick={() => { setTokenData('Stable') }}>Stable</div>
            </div>
            <img src="/icons/info_icon.png" className='w-4 h-4 object-cover cursor-pointer' alt="" />
        </div>

        <div className="">
            <label className="toggle">
                {/* <input type="checkbox" onClick={() => { setApy(!apy) }} /> */}
                <span className="slider"></span>
                <span className="labels" data-on="APR" data-off="APY"></span>
            </label>
        </div>
    </div>
    <div className='flex w-full gap-12 justify-between py-3'>
        <div className="flex w-full flex-col gap-4 bg-white dark:bg-darkSecond dark:hover:!bg-[#191919]   shadow-15 rounded-md pt-5 ">
            <div className="flex items-center justify-start text-lg font-semibold px-5">
                Lend
            </div>

            <div className="flex items-center gap-3 px-5 pb-5">
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md ">
                    <span className="text-greylish">Balance: </span> $19.26
                </div>
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md  flex items-center gap-1">
                    <span className="text-greylish">APY: </span> 4.24% <img src="/icons/info_icon.png" className='w-4 h-4 object-cover cursor-pointer' alt="" />
                </div>
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md flex items-center gap-1 ">
                    <span className="text-greylish">Collateral: </span> $19.26 <img src="/icons/info_icon.png" className='w-4 h-4 object-cover cursor-pointer' alt="" />
                </div>
            </div>

            <div className="">
                <div className="grid grid-cols-[25%,22%,53%] py-1 border-b  dark:border-greylish">
                    <div className='text-greylish pl-5'>Assets</div>
                    <div className="text-greylish">Balance</div>
                    <div className="text-greylish">APY</div>
                </div>
                <div className="grid grid-cols-[24%,23%,23%,30%] items-center py-3 px-5 border-b">
                    <div className="flex items-center gap-2 text-lg font-medium">
                        <img src={`/icons/currencies/mcUSD.png`} alt="" className='rounded-full w-9 h-9' />
                        mcUSD
                    </div>
                    <div className="flex  flex-col items-start">
                        <span className="font-medium text-lg">3.00</span>
                        <span className="font-medium text-sm">$2.56</span>
                    </div>
                    <div className="text-lg font-medium">4.67%</div>
                    <div className="flex items-center justify-end gap-2">
                        <Button className='!text-sm py-[.45rem] px-5'>Withdraw</Button>
                        <Button version='second' className="text-sm py-[.45rem] px-5">Lend</Button>
                    </div>
                </div>
                <div className="grid grid-cols-[24%,23%,23%,30%] items-center py-3 px-5">
                    <div className="flex items-center gap-2 text-lg font-medium">
                        <img src={`/icons/currencies/mcUSD.png`} alt="" className='rounded-full w-9 h-9' />
                        mcUSD
                    </div>
                    <div className="flex  flex-col items-start">
                        <span className="font-medium text-lg">3.00</span>
                        <span className="font-medium text-sm">$2.56</span>
                    </div>
                    <div className="text-lg font-medium">4.67%</div>
                    <div className="flex items-center justify-end gap-2">
                        <Button className='!text-sm py-[.45rem] px-5'>Withdraw</Button>
                        <Button version='second' className="text-sm py-[.45rem] px-5">Lend</Button>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex w-full flex-col gap-4 h-full bg-white dark:bg-darkSecond dark:hover:!bg-[#191919]   shadow-15 rounded-md pt-5 ">
            <div className="flex items-center justify-start text-lg font-semibold px-5">
                Borrow
            </div>

            <div className="flex items-center gap-3 px-5 pb-5">
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md ">
                    <span className="text-greylish">Balance: </span> $19.26
                </div>
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md  flex items-center gap-1">
                    <span className="text-greylish">APY: </span> 4.24% <img src="/icons/info_icon.png" className='w-4 h-4 object-cover cursor-pointer' alt="" />
                </div>
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md flex items-center gap-1 ">
                    <span className="text-greylish">Borrow power used: </span> $19.26 <img src="/icons/info_icon.png" className='w-4 h-4 object-cover cursor-pointer' alt="" />
                </div>
            </div>
            <div className="">
                <div className="grid grid-cols-[25%,22%,53%] py-1 border-b  dark:border-greylish">
                    <div className='text-greylish pl-5'>Assets</div>
                    <div className="text-greylish">Debt</div>
                    <div className="text-greylish">APY</div>
                </div>
                <div className="grid grid-cols-[24%,23%,23%,30%] items-center py-3 px-5">
                    <div className="flex items-center gap-2 text-lg font-medium">
                        <img src={`/icons/currencies/mcUSD.png`} alt="" className='rounded-full w-9 h-9' />
                        mcUSD
                    </div>
                    <div className="flex  flex-col items-start">
                        <span className="font-medium text-lg">3.00</span>
                        <span className="font-medium text-sm">$2.56</span>
                    </div>
                    <div className="text-lg font-medium">4.67%</div>
                    <div className="flex items-center justify-end gap-2">
                        <Button className='!text-sm py-[.45rem] px-5'>Repay</Button>
                        <Button version='second' className="text-sm py-[.45rem] px-5">Borrow</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="w-full pt-4 pb-6">
        <div id="header" className="grid grid-cols-[20%,15%,15%,15%,15%,20%] bg-[#F2F2F2] shadow-15 py-2 items-center  dark:bg-[#2F2F2F] rounded-md mb-6     ">
            <div className="font-semibold text-greylish  dark:text-[#aaaaaa] pl-3">Asset Name</div>
            <div className="font-semibold text-greylish  dark:text-[#aaaaaa]  w-16 text-right">LTV</div>
            <div className="font-semibold text-greylish  dark:text-[#aaaaaa] w-28 text-right">Total Supply</div>
            <div className="font-semibold text-greylish  dark:text-[#aaaaaa] w-28 text-right">Supply {!apy ? 'APY' : 'APR'}</div>
            <div className="font-semibold text-greylish  dark:text-[#aaaaaa] w-28 text-right">Total Borrow</div>
            <div className="font-semibold text-greylish dark:text-[#aaaaaa] w-28 text-right">Borrow {!apy ? 'APY' : 'APR'}</div>
        </div>
        <div>

        </div>

    </div>
    {/* <div className="flex  pt-8 w-[30%] justify-between">
        <AnimatedTabBar data={data} index={index} className={'!text-2xl'} />
    </div> */}
    {/* <div className="pt-3 pb-10">
        <DynamicLendBorrow type={!type || type[0].toLowerCase() === "lend" ? "lend" : "borrow"} />
    </div> */}
</div>
}

export default Lendborrow;