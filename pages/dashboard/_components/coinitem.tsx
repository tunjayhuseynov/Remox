import { MouseEventHandler } from "react";
import { SetComma } from "utils";



const CoinItem = ({ title, coin, usd, percent, img, setSelectcoin, selectcoin, onClick }: { title: string, coin: number, usd: number, percent: string, img: string, setSelectcoin: React.Dispatch<React.SetStateAction<string>>, selectcoin: string, onClick: MouseEventHandler }) => {
    return <div className={`py-3 pl-4 pr-4 w-full cursor-pointer`} onClick={onClick}>
        <div className="grid grid-cols-3">
            <div className="flex  items-center">
                <div className="w-[1.563rem] flex items-center justify-center">
                    <img width="15" height="15" src={img} alt="" className="rounded-full" /></div>
                <div className="text-sm">{title}</div>
            </div>
            <div className='text-sm'>{`${SetComma(coin)}`}</div>
            <div className="text-sm text-right">{percent}%</div>
        </div>
    </div>
}

export default CoinItem;