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
import CurrencyElement from "components/general/CurrencyElement";
import { motion } from "framer-motion";
import { DayDifference, MonthDiff } from "../index.page";
import dateTime from 'date-and-time'
import { useAppSelector } from "redux/hooks";
import { SelectCumlativeTxs } from "redux/slices/account/selector";
import { Blockchains } from "types/blockchains";

interface IProps {
  member: IMember;
  selectedMembers?: IMember[];
  isRuning: boolean;
  runmodal: boolean;
  setSelectedMembers: Dispatch<SetStateAction<IMember[]>>;
}

const PayrollItem = ({
  member,
  selectedMembers,
  setSelectedMembers,
  isRuning,
  runmodal,
}: IProps) => {
  const { GetCoins } = useWalletKit();
  let blockchain = Blockchains.find(s => s.name === member.blockchain) ?? Blockchains[0]
  const coin1 = Object.values(GetCoins(blockchain.chainId)).find(
    (coin) => coin.symbol === member.currency
  );
  const coin2 = Object.values(GetCoins(blockchain.chainId)).find(
    (coin) => coin.symbol === member.secondCurrency
  );

  const txs = useAppSelector(SelectCumlativeTxs)
  let checks = txs.filter(tx =>
    member.checkedList?.find(d =>
      d.contractAddress.toLowerCase() === ('tx' in tx ? tx.contractAddress : tx.address).toLowerCase() &&
      d.hashOrIndex.toLowerCase() === ('tx' in tx ? tx.hashOrIndex : tx.hash).toLowerCase()
    )
    && ('tx' in tx ? tx.isExecuted : true)
  );
  let lastCheckedDate = checks.length > 0 ? checks[0].timestamp : new Date(0);
  let checkedCount = checks.length || 0

  const dateNow = new Date()
  const haveToBeChecked = member.paymantEndDate ? member.interval === "monthly" ?
    MonthDiff(new Date(member.paymantDate * 1e3), new Date(member.paymantEndDate * 1e3)) + 1 : Math.floor(Math.abs(dateTime.subtract(new Date(member.paymantDate * 1e3), new Date(member.paymantEndDate * 1e3)).toDays()) / 7) : null

  const monthPassed = MonthDiff(new Date(member.paymantDate * 1e3), dateNow)

  const startDate = new Date(member.paymantDate * 1e3)
  const payCheckDate = member.paymantEndDate ? (dateNow.getMonth() === new Date(member.paymantEndDate * 1e3).getMonth() && dateNow.getFullYear() === new Date(member.paymantEndDate * 1e3).getFullYear()) ? member.paymantEndDate * 1e3 : startDate.setMonth(startDate.getMonth() + monthPassed) : startDate.setMonth(startDate.getMonth() + monthPassed);
  const checkedPrecentage = (haveToBeChecked && member.paymantEndDate) ? ((checkedCount ?? 0) * 100) / haveToBeChecked : null

  const daysLeft = dateNow.getTime() < payCheckDate ? DayDifference(dateNow.getTime(), payCheckDate) : 0

  return (
    <tr className="grid grid-cols-[18.5%,9.5%,9.5%,15.5%,12.5%,12.5%,9.5%,12.5%] py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919] hover:bg-opacity-5 hover:transition-all text-sm`">
      <td
        className={` pl-4 pt-5`}
      >
        <div className={`space-x-2`}>
          <div className="float-left pt-2 pr-3">
            {member.execution !== ExecutionType.auto && isRuning && !runmodal ? (
              <Checkbox
                sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:
                before:w-full checked:before:h-full checked:before:bg-primary checked:before:block"
                onChange={(e) => {
                  const members = [...selectedMembers!];
                  if (e.target.checked) {
                    if (!members.includes(member)) {
                      members.push(member);
                      setSelectedMembers(members);
                    }
                  } else {
                    setSelectedMembers(members.filter((m) => m.id !== member.id));
                  }
                }}
                checked={
                  selectedMembers?.find((m) => m.id === member.id) ? true : false
                }
              />
            ) : (
              <></>
            )}
          </div>
          <div
            className={`flex space-x-2 `}
          >
            <img
              src={member.image?.imageUrl ?? makeBlockie(member.address)}
              alt=""
              height={40}
              width={40}
              className="rounded-full border object-cover"
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
      <td className="flex pt-7">
        {member.paymantDate && (
          <div className="text-sm font-medium">
            {dateFormat(new Date(+member.paymantDate * 1e3), `dd/mm/yyyy`)}
          </div>
        )}
      </td>
      <td className="flex pt-7">
        <div className="text-sm font-medium">
          {member.paymantEndDate ? dateFormat(new Date(+member.paymantEndDate * 1e3), `dd/mm/yyyy`) : "Active"}
        </div>
      </td>
      <td className="flex flex-col pr-9 gap-2 pt-8">
        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl h-2 w-full overflow-x-hidden">
          <motion.div
            className="h-full bg-primary rounded-2xl z-10 "
            animate={{ x: 0, width: `${member.paymantEndDate ? Math.min((checkedPrecentage ?? 0), 100) : 100}%` }}
            transition={{ ease: "easeOut", duration: 2 }}
          ></motion.div>
        </div>
        <div className="text-xs text-end w-full"> {checkedCount} / {member.paymantEndDate ? haveToBeChecked : "∞"} </div>
      </td>
      <td className="flex text-sm space-y-4 pt-7">
        <CurrencyElement
          amount={member?.amount}
          fiat={member.fiat}
          coin={coin1!}
          disableFiat={!member.fiat}
        />
        {member.secondAmount && member.secondCurrency && coin2 && (
          <CurrencyElement
            amount={member.secondAmount}
            coin={coin2}
            fiat={member.fiatSecond}
            disableFiat={!member.fiatSecond}
          />
        )}
      </td>
      <td className="flex justify-start text-sm font-medium pt-7">
        {member.execution !== "Auto"
          ? member.interval === DateInterval.monthly
            ? "Monthly"
            : "Weekly"
          : "Streaming"}
      </td>
      <td className="text-sm font-medium pt-7">
        {member.execution === "Auto" ? <p>Streaming</p> : <p>Manual</p>}
        {member.execution !== "Auto" ? payCheckDate < dateNow.getTime() && (lastCheckedDate ? lastCheckedDate < payCheckDate : true) && <span className="text-[#E84142] ">(overdue)</span> : <></>}
        {member.execution !== "Auto" ? daysLeft <= 3 && daysLeft > 0 ? <span className="text-[#707070]">({daysLeft} day{daysLeft > 1 ? "s" : ""} left)</span> : <></> : <></>}
      </td>
      <td className="flex text-sm font-medium justify-start pt-7">
        {member.compensation}
      </td>
    </tr>
  );
};

export default PayrollItem;
