import { Dispatch, SetStateAction, useState } from "react";
import {
  IMember,
} from "types/dashboard/contributors";
import Button from "components/button";
import PayrollItem from "../PayrollItem";
import ModalAllocation from "./modalAllocation";
import useLoading from "hooks/useLoading";
import { useForm } from "react-hook-form";

interface IProps {
    selectedContributors: IMember[];
    runmodal: boolean;
    isAvaible:boolean;
    setSelectedContributors: Dispatch<SetStateAction<IMember[]>>,
    setChoosingBudget:  Dispatch<SetStateAction<boolean>>
}

const RunModal = ({
    selectedContributors,
    runmodal,
    isAvaible,
    setSelectedContributors,
    setChoosingBudget,
} : IProps) => {
  const {handleSubmit} = useForm()

  return (
    <>
      {selectedContributors.length > 0 ? (
        <div className="h-fulll mx-[6rem] mt-12 pb-4">
          <div className="text-2xl font-semibold pb-5 ">
            Run Payroll
          </div>
          <table className="w-full pt-1 pb-4 ">
              <thead>
                <tr id="header" className={`grid lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-darkSecond rounded-md`} >
                  <th className={`text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ${isAvaible ? "pl-4" : "pl-2" }`}>Contributor</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Start Date</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">End Date</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Salary</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Frequency</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Status</th>
                  <th className=" text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] ">Compensation Type</th>
                </tr>
              </thead>
                <tbody>
                  {selectedContributors.map((contributor) => <PayrollItem runmodal={runmodal} isRuning={isAvaible} key={contributor.id} member={contributor} selectedMembers={selectedContributors} setSelectedMembers={setSelectedContributors}  /> )}
                </tbody>
            </table>
          <div className="flex flex-col space-y-3 mt-5">
            <div className="text-2xl font-semibold tracking-wide">
              Review Treasury Impact
            </div>
                <ModalAllocation selectedList={selectedContributors}/>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setChoosingBudget(true)} className={" py-3 mt-10 mb-3 text-base"}>
              Run Payroll 
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-primary text-2xl font-semibold pt-12  px-2">
          please choose some of the members.!
        </div>
      )}
    </>
  );
};

export default RunModal;