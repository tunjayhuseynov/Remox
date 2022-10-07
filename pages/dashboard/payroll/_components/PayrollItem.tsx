import { Checkbox } from "@mui/material";
import dateFormat from "dateformat";
import makeBlockie from "ethereum-blockies-base64";
import { useWalletKit } from "hooks";
import { Dispatch, SetStateAction } from "react";

import {
  DateInterval,
  ExecutionType,
  IMember,
} from "types/dashboard/contributors";
import { AddressReducer, SetComma } from "utils";

interface IProps {
  member: IMember;
  selectedMembers?: IMember[];
  isRuning: boolean,
  runmodal: boolean,
  setSelectedMembers: Dispatch<SetStateAction<IMember[]>>
}

const PayrollItem = ({ member, selectedMembers, setSelectedMembers, isRuning, runmodal }: IProps) => {
    const {GetCoins } = useWalletKit()
    const coin1 = Object.values(GetCoins).find((coin) => coin.symbol ===  member.currency)
    const coin2 = Object.values(GetCoins).find((coin) => coin.symbol ===  member.secondCurrency)

  return (
    <tr className="grid grid-cols-[18%,11%,14%,15%,14%,11%,17%] py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5 hover:transition-all text-sm`">
      <th
        className={` ${
          member.execution !== ExecutionType.auto && isRuning
            ? "pl-4"
            : "pl-2"
        } flex `}
      >
        <div className={`flex space-x-2 items-center `}>
          {member.execution !== ExecutionType.auto && isRuning && !runmodal ? (
            <Checkbox
                sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                
                className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:
                before:w-full checked:before:h-full checked:before:bg-primary checked:before:block"
                onChange={(e) => {
                    const members = [...selectedMembers!] ;
                    if(e.target.checked) {
                        if (!members.includes(member)) {
                            members.push(member);
                            setSelectedMembers(members);
                        } 
                    } else {
                      setSelectedMembers(
                        members.filter((m) => m.id !== member.id)
                      );
                    }
                }}
                checked={
                  selectedMembers?.find((m) => m.id === member.id) ? true : false
                }
            />
          ) : (
            <div className=""></div>
          )}
          <div
            className={`hover:cursor-pointer flex items-center space-x-2 ${
              member.execution !== ExecutionType.auto 
                ? "pl-0"
                : "pl-3"
            } `}
          >
              <img
                src={member.image?.imageUrl ?? makeBlockie(member.address)}
                alt=""
                className="rounded-full border w-10 object-cover h-10"
              />
            <div className="flex flex-col text-left">
              <div className=" h-6 font-medium text-sm">{member.fullname}</div>
              <div className="text-greylish font-medium text-[10px]">
                {AddressReducer(member.address)}
              </div>
            </div>
          </div>
        </div>
      </th>
      <th className="flex space-x-8 items-center">
        {member.paymantDate && (
          <>
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm font-medium">
              {dateFormat(new Date(+member.paymantDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </th>
      <th className="flex space-x-8 items-center">
        {member.paymantEndDate && (
          <>
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm font-medium">
              {dateFormat(new Date(+member.paymantEndDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </th>
      <th className="flex flex-col items-start justify-center space-y-4">
        <div className="pl-[2px] flex items-center  gap-1">
            {member.fiat ? <div className="flex items-center gap-1"> <span className="text-sm">{member.amount}</span> {member.fiat} as <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" /></div> :
                <div className="flex items-center">
                    <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full mr-1" />
                    <span className="text-sm">{member.amount}</span>
                </div>
            }
            
            <div>
            </div>
        </div>
        {(member.secondCurrency && member.secondAmount) && <div className="pl-[2px] flex items-center justify-start gap-1">
            <div className="flex items-center gap-1 mr-1">
                <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" />
            </div>
            <div className=" text-sm">{member.secondAmount}</div>
            <div>
            </div>
        </div>}
      </th>
      <th className="pl-[2px] hidden sm:flex items-center justify-start text-lg font-medium">
        {member.interval === DateInterval.monthly && "Monthly"}
        {member.interval === DateInterval.weekly && "Weekly"}
      </th>
      <th className="flex items-center justify-start text-sm font-medium">
        {member.execution === "Auto" ? "Streaming" : "Manual"}
      </th>
      <th className="flex items-center text-sm font-medium justify-start pr-8">
        {member.compensation}
      </th>
    </tr>
  );
};

export default PayrollItem;
