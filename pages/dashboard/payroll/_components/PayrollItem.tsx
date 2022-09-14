import { Checkbox } from "@mui/material";
import Avatar from "components/avatar";
import dateFormat from "dateformat";
import { useWalletKit } from "hooks";
import { Dispatch, SetStateAction } from "react";
import { useAppSelector } from "redux/hooks";
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
    const coin1 = Object.values(GetCoins).find((coin) => coin.name ===  member.currency)
    const coin2 = Object.values(GetCoins).find((coin) => coin.name ===  member.secondaryCurrency)

  return (
    <tr className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5 hover:transition-all text-sm`">
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
            {member.image !== null ? (
              <img
                src={`/icons/profilePhoto/${member.image}`}
                alt=""
                className="rounded-full border w-12 object-cover h-12"
              />
            ) : (
              <Avatar name={member.first} surname={member.last} />
            )}
            <div className="flex flex-col text-left   ">
              <div className=" h-6 font-medium text-lg">{member.name}</div>
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
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm xl:text-lg font-medium">
              {dateFormat(new Date(+member.paymantDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </th>
      <th className="flex space-x-8 items-center">
        {member.paymantEndDate && (
          <>
            <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] thuncate text-sm xl:text-lg font-medium">
              {dateFormat(new Date(+member.paymantEndDate), `dd/mm/yyyy`)}
            </div>
          </>
        )}
      </th>
      <th
        className={`flex relative ${
          member.secondaryAmount && "flex-col !items-start "
        }  space-y-4 items-center`}
      >
        <div className=" flex  items-center justify-start gap-1">
          {member.usdBase ? (
            <div className="flex items-center gap-1 ">
              USD as
              <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" />
            </div>
          ) : (
            <div className="flex gap-3 items-center text-lg font-medium">
              <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full " />
            </div>
          )}
          <div className="text-lg font-medium flex justify-start">
            {SetComma(parseFloat(member.amount))}
          </div>
          <div></div>
        </div>
        {member.secondaryCurrency && member.secondaryAmount && (
          <div className=" flex items-center justify-start gap-1">
            {member.secondaryAmount ? (
              <div className="flex items-center gap-2 ">
                <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" />
              </div>
            ) : (
              <div className="flex gap-3 items-center text-lg font-medium">
                <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full text-base" />
              </div>
            )}
            <div className="text-lg font-medium flex justify-start">
              {SetComma(+member.secondaryAmount)}
            </div>
            <div></div>
          </div>
        )}
      </th>
      <th className="pl-[2px] hidden sm:flex items-center justify-start text-lg font-medium">
        {member.interval === DateInterval.monthly && "Monthly"}
        {member.interval === DateInterval.weekly && "Weekly"}
      </th>
      <th className="flex items-center justify-start text-lg font-medium">
        {member.execution === "auto" ? "Stheaming" : "Manual"}
      </th>
      <th className="flex items-center text-lg font-medium justify-start pr-8">
        {member.compensation}
      </th>
    </tr>
  );
};

export default PayrollItem;
