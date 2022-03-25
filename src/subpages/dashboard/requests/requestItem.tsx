import { Coins } from "types/coins";
import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { IRequest } from "API/useRequest";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const RequestItem = (props: { request: IRequest, requestState: [IRequest[], React.Dispatch<React.SetStateAction<IRequest[]>>] }) => {

    const [detect, setDetect] = useState(true);
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
            setDetect(false)
        }
    }, [])


    return <>
        <div className="pl-[2px] items-start" ref={divRef}>
            <div className="flex space-x-3 items-center">
                <input type="checkbox" checked={props.requestState[0].some(s => s.id === props.request.id)} className="relative cursor-pointer max-w-[1.25rem] max-h-[1.25rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                    const request = [...props.requestState[0]]
                    if (e.target.checked) {
                        if (!request.some(s => s.id === props.request.id)) {
                            request.push(props.request)
                            props.requestState[1](request)
                        }
                    } else {
                        props.requestState[1](request.filter(m => props.request.id !== m.id))
                    }
                }
                } />
                <div className="hover:cursor-pointer flex items-center space-x-1">
                    <Avatar name={props.request.name} />
                    <div>
                        {props.request.name}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col space-y-4">
            <div className=" pl-[2px] flex items-center justify-start gap-1">
                <div>{props.request.amount}</div>
                {props.request.usdBase ? <div>USD as {Coins[props.request.currency].name}</div> :
                    <div>
                        {Coins[props.request.currency].name}
                    </div>}
                <div>
                    <img src={Coins[props.request.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                </div>
            </div>
            {props.request.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                <div>{props.request.secondaryAmount}</div>
                {props.request.usdBase ? <div>USD as {Coins[props.request.secondaryCurrency].name}</div> :
                    <div>
                        {Coins[props.request.secondaryCurrency].name}
                    </div>}
                <div>
                    <img src={Coins[props.request.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                </div>
            </div>}
        </div>
        <div className="flex space-x-8">
            {props.request.timestamp && <>
                <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate">
                    {dateFormat(new Date(props.request.timestamp), `dd mmmm yyyy`)}
                </div>
            </>}
        </div>
        <div className="flex justify-end cursor-pointer items-start md:pr-0 ">
            <Link to={`/dashboard/requests/${props.request.id}`}><div className={`text-primary  ${detect ? "px-6 max-h-[5rem] border-2 border-primary hover:bg-primary hover:text-white" : "text-sm hover:text-black dark:hover:text-white"} rounded-xl py-2 transition-colors duration-300`}>View Details</div></Link>
        </div>
    </>
}

export default RequestItem;