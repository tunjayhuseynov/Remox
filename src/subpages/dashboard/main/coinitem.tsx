import { MouseEventHandler } from "react";



const CoinItem = ({ title, coin, usd, percent, rate, img, setSelectcoin, selectcoin, onClick }: { title: string, coin: string, usd: string, percent: string, rate?: number, img: string, setSelectcoin: React.Dispatch<React.SetStateAction<string>>, selectcoin: string, onClick: MouseEventHandler }) => {
    return <div className={`py-2 pl-2 gap-2 pr-5 flex  cursor-pointer ${selectcoin === title && "shadow-[3px_3px_10px_3px_#dad8d8] "}  bg-white dark:bg-darkSecond rounded-xl h-[3.75rem]`} onClick={onClick}>
        <div className="w-[1.563rem] flex items-center justify-center">
            <img width="25" height="25" src={img} alt="" className="rounded-xl" />
        </div> 
        <div className="flex-grow grid grid-cols-2 gap">
            <div className="flex flex-col justify-between items-start">
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-greylish text-sm font-normal">{`${coin}`}</div>
                {/* <div className="text-greylish opacity-70 text-xs font-light">{percent}%</div> */}
            </div>
            <div className="flex flex-col justify-center items-end">
                <div className="font-semibold  text-base">${usd}</div>
                {/* <div className="text-greylish opacity-70 text-xs font-light">{`${title} ${coin}`}</div> */}
            </div>
            {/* <div className="flex flex-col justify-between items-end">
                <div className="font-semibold text-gray-500 text-sm">{rate?.toFixed(2)}%</div>
                <div className="text-greylish opacity-70 text-xs font-light">24h</div>
            </div> */}
        </div>
    </div>
}

export default CoinItem;