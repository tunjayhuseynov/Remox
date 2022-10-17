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
import CurrencyElement from "components/general/CurrencyElement";

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
      <td className="flex items-center">
        {member.paymantDate && (
            <div className="text-sm font-medium">
              {dateFormat(new Date(+member.paymantDate), `dd/mm/yyyy`)}
            </div>
        )}
      </td>
      <td className="flex items-center">
        {member.paymantEndDate && (
            <div className="text-sm font-medium">
              {dateFormat(new Date(+member.paymantEndDate), `dd/mm/yyyy`)}
            </div>
        )}
      </td>
      <td className="flex flex-col justify-center text-sm space-y-4">
        <CurrencyElement amount={member?.amount} fiat={member.fiat} coin={coin1!}/>
        {member.secondAmount && member.secondCurrency && coin2 && 
          <CurrencyElement amount={member.secondAmount} coin={coin2} fiat={member.fiatSecond} />
        }
      </td>
      <td className="flex items-center justify-start text-sm font-medium">
        {member.execution === "Auto" ? 
          member.interval === DateInterval.monthly ? "Monthly" : "Weekly" : 
          "Streaming"
        }
      </td>
      <td className="flex items-center justify-start text-sm font-medium">
        {member.execution === "Auto" ? "Streaming" : "Manual"}
      </td>
      <td className="flex items-center text-sm font-medium justify-start">
        {member.compensation}
      </td>
    </tr>
  );
};

export default PayrollItem;