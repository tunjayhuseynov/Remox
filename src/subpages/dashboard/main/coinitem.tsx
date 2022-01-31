

const CoinItem = ({ title, coin, usd, percent, rate, img }: { title: string, coin: string, usd: string, percent: string, rate?: number, img: string }) => {

    return <div className="py-2 pl-2 gap-2 pr-5 flex bg-greylish bg-opacity-5 rounded-xl h-[60px]">
        <div className="w-[25px] flex items-center justify-center">
            <img width="25" height="25" src={img} alt="" className="rounded-xl" />
        </div>
        <div className="flex-grow grid grid-cols-2 gap">
            <div className="flex flex-col justify-between items-start">
                <div className="font-semibold text-black text-sm">{title}</div>
                <div className="text-greylish text-sm font-normal">{`${coin}`}</div> 
                {/* <div className="text-greylish opacity-70 text-xs font-light">{percent}%</div> */}
            </div>
            <div className="flex flex-col justify-center items-end">
                <div className="font-semibold text-black text-base">${usd}</div>
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