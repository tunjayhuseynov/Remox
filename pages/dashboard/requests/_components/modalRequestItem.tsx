import { IRequest, RequestStatus } from 'rpcHooks/useRequest';
import {  useEffect, useRef, useState } from 'react';
import { AddressReducer, SetComma } from 'utils';
import { useWalletKit } from 'hooks';
import Avatar from 'components/avatar';
import dateFormat from 'dateformat';

const ModalRequestItem = ({ request }: { request: IRequest }) => {
    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLTableRowElement>(null)
    const { GetCoins } = useWalletKit()

    const coin1 = Object.values(GetCoins).find((coin) => coin.name === request.currency);
    const coin2 = Object.values(GetCoins).find((coin) => coin.name === request.secondaryCurrency);

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
            setDetect(false)
        }
    }, [])


    return <tr ref={divRef} className={`w-full py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all   grid ${detect ? 'grid-cols-[25%,45%,30%] sm:grid-cols-[25%,20%,20%,20%,15%]' : 'grid-cols-[27%,48%,25%]'}  `}>
        <td className="flex space-x-3 overflow-hidden pl-2">
            <div className={`hidden sm:flex ${detect ? "items-center" : "items-start"} justify-center`}>
                <div className={` ${request.status !== RequestStatus.rejected ? "" : "bg-red-300 text-black"}  ${detect ? "w-[2.813rem] h-[2.813rem] text-lg" : "w-[1.563rem] h-[1.563rem] text-xs"} flex items-center justify-center rounded-full font-bold `}>
                    {request.image ? <img src={`/icons/profilePhoto/${request.image}`} alt="" className="  w-12 h-12 border items-center justify-center rounded-full" /> : <Avatar name={request.name} surname={request.surname} />}
                </div>
            </div>
            <div className={`sm:flex flex-col ${detect ? "justify-center" : "justify-start"} items-start `}>
                <div className="text-lg font-medium">
                    {<span> {request.name ? `${request.name} ${request.surname}` : "Unknown"} </span>}
                </div>
                {request.address && <div className="text-greylish font-medium text-[10px]">
                    {AddressReducer(request.address)}
                </div>}
            </div>
        </td>
        <td className="flex h-full items-center ">
          {request.serviceDate && (
            <div className="flex text-greyish dark:text-white tracking-wide text-lg font-medium">
              {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
            </div>
          )}
      </td>
      <td className="flex items-center  ">
          <div className="space-y-2">
                <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                    {GetCoins && coin1 ? (
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center text-lg font-medium`}>
                        <div className="flex items-center">
                          <img
                            src={coin1.logoURI}
                            width="20"
                            height="20"
                            className="rounded-full mr-2"
                          />
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                          <span>{request.usdBase ? (parseFloat(request.amount) / coin1!.priceUSD!).toLocaleString() : request.amount}</span>
                        </div>
                        </div>
                    ) : (
                      <div>Unknown Coin</div>
                    )}
                </div>
                {!!request.secondaryAmount && !!request.secondaryCurrency &&
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                        {GetCoins && coin2 ? (<div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center text-lg font-medium`}>
                        <div className="flex items-center">
                          <img
                            src={coin2.logoURI}
                            width="20"
                            height="20"
                            className="rounded-full mr-2"
                          />
                        </div>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                          <span>{request.usdBase ? (+request.secondaryAmount / coin2!.priceUSD!).toLocaleString() : (+request.secondaryAmount).toLocaleString()}</span>
                        </div>
                        </div>
                        ) : (
                    <div>Unknown Coin</div>
                    )}
                </div>}
          </div>
      </td>
      <td className="items-center flex text-lg font-medium ">
        {request.requestType}
      </td>
    </tr>
}

export default ModalRequestItem