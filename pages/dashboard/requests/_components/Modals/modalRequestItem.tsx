import { IRequest, RequestStatus } from 'rpcHooks/useRequest';
import {  useRef } from 'react';
import { AddressReducer, SetComma } from 'utils';
import { useWalletKit } from 'hooks';
import Avatar from 'components/avatar';
import dateFormat from 'dateformat';
import { useAppSelector } from 'redux/hooks';
import { SelectOwners } from 'redux/slices/account/remoxData';
import { fiatList } from "components/general/PriceInputField";


const ModalRequestItem = ({ request }: { request: IRequest }) => {
    const divRef = useRef<HTMLTableRowElement>(null)
    const { GetCoins } = useWalletKit()
    const owners = useAppSelector(SelectOwners)
    const owner = owners.find((owner) => owner.address == request.address)
    const fiatFirst = fiatList.find((fiat) => fiat.name === request.fiat)
    const fiatSecond = fiatList.find((fiat) => fiat.name === request.fiatSecond)

    const coin1 = Object.values(GetCoins).find((coin) => coin.symbol === request.currency);
    const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === request.secondCurrency);

    return <tr ref={divRef} className={`w-full py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all grid grid-cols-[25%,20%,30%,25%]   `}>
        <td className="flex space-x-3 overflow-hidden pl-2">
          <div className={`hidden sm:flex items-center justify-center`}>
            {owner ? (
                owner.image ? 
                <img
                  src={owner!.image!.imageUrl}
                  alt=""
                  className="w-[2.5rem] h-[2.5rem] border items-center justify-center rounded-full"
                /> : <Avatar name={request.fullname.split(" ")[0]} surname={request.fullname.split(" ")[1]} />
              ) : (
                <Avatar name={request.fullname.split(" ")[0]} surname={request.fullname.split(" ")[1]} />
              )}
            </div>
            <div className={`sm:flex flex-col justify-center items-start `}>
                <div className="text-sm font-medium">
                    {<span> {request.fullname ? `${request.fullname}` : "Unknown"} </span>}
                </div>
                {request.address && <div className="text-greylish font-medium text-[10px]">
                    {AddressReducer(request.address)}
                </div>}
            </div>
        </td>
        <td className="flex h-full items-center ">
          {request.serviceDate && (
            <div className="flex text-greyish dark:text-white tracking-wide text-sm font-medium">
              {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
            </div>
          )}
      </td>
      <td className="flex flex-col justify-center text-sm">
           <div className="flex items-center">
           {request.fiat ? 
              <div className="flex items-center  justify-end"> 
                <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2"  />
                <div className="flex items-center space-x-2">
                  <span>based on</span>
                  <img src={fiatFirst?.logo} alt="" className="w-5 h-3"/>
                  <span>{request.fiat} {SetComma(+request.amount)}</span>
                </div>
              </div> :
              <div className="flex items-center">
                <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2"  />
                <span className="">{SetComma(+request.amount)}</span>
              </div>
            }
            </div>
            {(request.secondCurrency && request.secondAmount) && 
              <div className="flex items-center gap-1 mt-3">
                {request.fiatSecond ? 
                  <div className="flex items-center justify-end"> 
                    <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2" />
                    <div className="flex items-center space-x-2">
                      <span>based on</span>
                      <img src={fiatSecond?.logo} alt="" className="w-5 h-3" />
                      <span className="">{request.fiatSecond} {SetComma(+request.secondAmount)}</span> 
                    </div>
                  </div> :
                  <div className="flex items-center">
                    <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2" />
                    <span className="">{SetComma(+request.secondAmount)}</span>
                  </div>
                }
              </div>
            }
      </td>
      <td className="items-center flex text-sm font-medium ">
        {request.requestType}
      </td>
    </tr>
}

export default ModalRequestItem