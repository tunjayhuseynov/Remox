import { Checkbox } from "@mui/material";
import dateFormat from "dateformat";
import makeBlockie from "ethereum-blockies-base64";
import { useWalletKit } from "hooks";
import { Dispatch, SetStateAction } from "react";
import { fiatList } from "components/general/PriceInputField";

import {
  DateInterval,
  ExecutionType,
  IMember,
} from "types/dashboard/contributors";
import { AddressReducer } from "utils";
import { NG } from "utils/jsxstyle";

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
    const fiatFirst = fiatList.find((fiat) => fiat.name === member.fiat)
    const fiatSecond = fiatList.find((fiat) => fiat.name === member.fiatSecond)


  return (
    <tr className="grid grid-cols-[18%,11%,14%,15%,14%,11%,17%] py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5 hover:transition-all text-sm`">
      <td
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
      </td>
      <td className="flex space-x-8 items-center">
        {member.paymantDate && (
          <>
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm font-medium">
              {dateFormat(new Date(+member.paymantDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </td>
      <td className="flex space-x-8 items-center">
        {member.paymantEndDate && (
          <>
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm font-medium">
              {dateFormat(new Date(+member.paymantEndDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </td>
      <td className="flex flex-col justify-center text-sm space-y-4">
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            {
              member.fiat ? (
                <div className="relative">
                  <img src={fiatFirst?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                  <img src={coin1?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-6.3px] bottom-[-4.5px]" />
                </div>
                ) : <img src={coin1?.logoURI} className="rounded-xl w-6 h-6" alt="Currency Logo" />
            }
            </div>
            <div className="flex items-center">
              <NG number={+member?.amount}/>
            </div>
            </div>
            {(member.secondAmount && member.secondCurrency) && <div className="flex items-center">
              <div className="flex items-center mr-3">
                {
                  member.fiatSecond ? (
                    <div className="relative">
                      <img src={fiatSecond?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                      <img src={coin2?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-6.3px] bottom-[-4.5px]" />
              </div> ) : <img src={coin2?.logoURI} className="rounded-xl w-6 h-6" alt="Currency Logo" />
            }
          </div>
          <div className="flex items-center">
            <NG number={+member?.secondAmount} />
          </div>
        </div>}
      </td>
      <td className="pl-[2px] hidden sm:flex items-center justify-start text-sm font-medium">
        {member.interval === DateInterval.monthly && "Monthly"}
        {member.interval === DateInterval.weekly && "Weekly"}
      </td>
      <td className="flex items-center justify-start text-sm font-medium">
        {member.execution === "Auto" ? "Streaming" : "Manual"}
      </td>
      <td className="flex items-center text-sm font-medium justify-start pr-8">
        {member.compensation}
      </td>
    </tr>
  );
};

export default PayrollItem;