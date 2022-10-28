import { MouseEventHandler } from "react";
import { NG } from "utils/jsxstyle";



const CoinItem = ({ title, coin, usd, percent, img, setSelectcoin, selectcoin, onClick }: { title: string, coin: number, usd: number, percent: string, img: string, setSelectcoin: React.Dispatch<React.SetStateAction<string>>, selectcoin: string, onClick: MouseEventHandler }) => {
    return <div className={`py-[0.6rem] px-2 w-full cursor-pointer grid grid-cols-3 items-center`} onClick={onClick}>
            <div className="flex items-center justify-start space-x-2">
                <div className="flex items-center ">
                    <img width="15" height="15" src={img} alt="" className="rounded-full" />
                </div>
                <div className="text-xs">{title}</div>
            </div>
            <div className='text-xs !pl-4 text-center'>
                <NG number={coin} fontSize={.75}/>
            </div>
            <div className="text-xs text-right">{percent}%</div>
        </div>
}

export default CoinItem;