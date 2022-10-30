import Button from 'components/button';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useLending, { LendingReserveData } from 'rpcHooks/useLending';
import TokenItem from './_components/token';
import {IoMdInformationCircleOutline} from 'react-icons/io'

const Lendborrow = () => {
    const {getReservesData } = useLending()
    const [reservesData, setReservesData] = useState<LendingReserveData[]>([]);
    const [variable, setVariable] = useState(true)
    const [apy, setApy] = useState(true)

    useAsyncEffect(async () => {
        const reserveDatas = await getReservesData()

        setReservesData(reserveDatas)


    }, [])


   
    return <div className="flex flex-col pt-8 space-y-3">
    <div className="flex items-center justify-between ">
        <div className="flex items-center justify-center gap-4">
            <div className="text-2xl font-semibold">
                Lend & Borrow
            </div>
            <div className="bg-[#FFFFFF] dark:bg-dark border border-[#D6D6D6] dark:border-greylish py-1 px-2 flex rounded-md ml-5 h-9 gap-1">
                <div className={`text-primary font-medium text-sm flex items-center justify-center cursor-pointer w-[50%] px-2 ${variable && '!text-white !bg-primary rounded-md'}`} onClick={() => { setVariable(true) }}>Variable</div>
                <div className={`text-primary font-medium text-sm flex items-center justify-center cursor-pointer w-[50%] px-2 ${!variable && '!text-white !bg-primary rounded-md'}`} onClick={() => { setVariable(false) }}>Stable</div>
            </div>
            <img src='/icons/information.svg' className='cursor-pointer text-[#E7E7E7]' width={15} height={15} />
        </div>

        <div className="">
            <label className="toggle">
                <input type="checkbox" onClick={() => { setApy(!apy) }} />
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
                    <span className="text-greylish">APY: </span> 4.24% <img src='/icons/information.svg' className='cursor-pointer text-[#E7E7E7]' width={15} height={15} />

                </div>
                <div className="px-2 py-1 text-sm font-medium border dark:border-greylish rounded-md flex items-center gap-1 ">
                    <span className="text-greylish">Collateral: </span> $19.26 <img src='/icons/information.svg' className='cursor-pointer text-[#E7E7E7]' width={15} height={15} />
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
    <table className="w-full pt-4 pb-6">
        <thead>
            <tr id="header" className="grid grid-cols-[16.66%,16.66%,16.66%,16.66%,20.66%,12.66%] bg-[#F2F2F2] shadow-15 py-2 items-center dark:bg-darkSecond rounded-md mb-6">
                <th className="font-semibold text-left text-sm text-greylish  dark:text-[#aaaaaa] pl-3">Asset Name</th>
                <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">LTV</th>
                <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">Total Supply</th>
                <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">Supply {!apy ? 'APY' : 'APR'}</th>
                <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">Total Borrow</th>
                <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">Borrow {!apy ? 'APY' : 'APR'}</th>
            </tr>
            {reservesData.map((token,index) =>  <TokenItem key={index} asset={token} isVariable={variable} isAPY={apy} />)}
        </thead>
    </table>
</div>
}

export default Lendborrow;