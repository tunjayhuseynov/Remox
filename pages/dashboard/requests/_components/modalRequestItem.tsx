import { IRequest, RequestStatus } from 'rpcHooks/useRequest';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Coins } from 'types';
import { AddressReducer, SetComma } from 'utils';
import useRequest from 'hooks/useRequest';
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import { useWalletKit } from 'hooks';
import Avatar from 'components/avatar';
import dateFormat from 'dateformat';

const ModalRequestItem = ({ request, payment }: { request: IRequest, payment?: boolean }) => {

    const [modal, setModal] = useState(false)
    const [isLoading, setLoading] = useState(false)
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
        <td>
            <div className="flex h-full items-center justify-center">
                {request.serviceDate && !payment &&
                    <div className="text-greyish dark:text-white tracking-wide text-lg font-medium w-20 text-right">
                        {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
                    </div>
                }
            </div>
        </td>
        <td className="flex items-center justify-center">
            <div className="flex flex-col space-y-2">
                <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                    {GetCoins && coin1 ? (
                        <div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center text-lg font-medium`}>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                          <span>{request.usdBase ? (+request.amount / coin1!.priceUSD!).toFixed(3) : (+request.amount).toFixed(3)}</span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={coin1.logoURI}
                            width="20"
                            height="20"
                            className="rounded-full mr-2"
                          />
                          <span>{coin1.symbol}</span>
                        </div>
                        </div>
                    ) : (
                      <div>Unknown Coin</div>
                    )}
                </div>
                {!!request.secondaryAmount && !!request.secondaryCurrency &&
                    <div className={`flex ${detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"} items-center space-x-4`}>
                        {GetCoins && coin2 ? (<div className={`flex ${detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"} gap-x-2 items-center text-lg font-medium`}>
                        <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                          <span>{request.usdBase ? (+request.secondaryAmount / coin2!.priceUSD!).toFixed(3) : (+request.secondaryAmount).toFixed(3) }</span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={coin2.logoURI}
                            width="20"
                            height="20"
                            className="rounded-full mr-2"
                          />
                          <span>{coin2.symbol}</span>
                        </div>
                        </div>
                        ) : (
                    <div>Unknown Coin</div>
                    )}
                </div>}
            </div>
        </td>
        <td className="flex items-center justify-center text-lg font-medium">{request.requestType}</td>
    </tr>
}

export default ModalRequestItem