import { MouseEventHandler } from "react";
import { SetComma } from "utils";



const CoinItem = ({ title, coin, usd, percent, rate, img, setSelectcoin, selectcoin, onClick }: { title: string, coin: string, usd: string, percent: string, rate?: number, img: string, setSelectcoin: React.Dispatch<React.SetStateAction<string>>, selectcoin: string, onClick: MouseEventHandler }) => {
    return <div className={`py-2 pl-2 gap-2 pr-5 flex items-center w-full cursor-pointer rounded-xl ${selectcoin === title && "shadow-[1px_1px_8px_3px_#dad8d8] dark:shadow-[1px_1px_14px_2px_#0000008f] dark:bg-[#292929]"}  bg-white dark:bg-darkSecond `} onClick={onClick}>

        <div className="flex justify-between w-full">
    <div className="flex gap-1 items-center">
    <div className="w-[1.563rem] flex items-center justify-center">
            <img width="25" height="25" src={img} alt="" className="rounded-xl" /></div> 
        <div className="font-semibold text-sm">{title}</div>
    </div>
    <div className=" font-normal">{`${SetComma(parseInt(coin))}`}</div>
    <div className=" font-light">{percent}%</div>
        </div>
    </div>
}

export default CoinItem;