import { MouseEventHandler } from "react";



const CoinItem = ({ title, coin, usd, percent, img, setSelectcoin, selectcoin, onClick }: { title: string, coin: number, usd: number, percent: string, img: string, setSelectcoin: React.Dispatch<React.SetStateAction<string>>, selectcoin: string, onClick: MouseEventHandler }) => {
    return <div className={`py-3 pl-4 pr-4 w-full cursor-pointer`} onClick={onClick}>
        <div className="grid grid-cols-3">
            <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center">
                    <img width="15" height="15" src={img} alt="" className="rounded-full" /></div>
                <div className="text-xs">{title}</div>
            </div>
            <div className='text-xs text-right'>{`${coin.toFixed(1)}`}</div>
            <div className="text-xs text-right">{percent}%</div>
        </div>
    </div>
}

export default CoinItem;