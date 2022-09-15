import { Dispatch, SetStateAction, useState } from "react";
import Avatar from "components/avatar";
import dateFormat from "dateformat";
import {
  DateInterval,
  ExecutionType,
  IMember,
} from "types/dashboard/contributors";
import Button from "components/button";
import PayrollItem from "../PayrollItem";
import ModalAllocation from "./modalAllocation";

interface IProps {
    selectedContributors: IMember[];
    runmodal: boolean;
    isAvaible:boolean;
    setSelectedContributors: Dispatch<SetStateAction<IMember[]>>
}

const RunModal = ({
    selectedContributors,
    runmodal,
    isAvaible,
    setSelectedContributors
} : IProps) => {
  return (
    <>
      {selectedContributors.length > 0 ? (
        <div className="px-5 pt-20 w-full h-[80%] mx-auto">
          <div className="text-2xl font-semibold py-2 pb-5 pt-4">
            Run Payroll
          </div>
          <div className="w-full  pt-4 pb-6 ">
            <div
              id="header"
              className={`hidden sm:grid grid-cols-[30%,30%,1fr]  lg:grid-cols-[18%,11%,14%,15%,14%,11%,17%] bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md`}
            >
              <div
                className={` text-lg font-semibold text-greylish dark:text-[#aaaaaa] pl-4 `}
              >
                Contributor
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">
                Start Date
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa]">
                End Date
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">
                Salary
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">
                Frequency
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">
                Status
              </div>
              <div className=" text-lg font-semibold text-greylish dark:text-[#aaaaaa] ">
                Compensation Type
              </div>
            </div>
            <div>
              {selectedContributors.map((contributor, index) => (
                <PayrollItem
                  key={contributor.id}
                  runmodal={runmodal}
                  isRuning={isAvaible}
                  member={contributor}
                  setSelectedMembers={setSelectedContributors}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-3 pt-10">
            <div className="text-2xl font-semibold tracking-wide">
              Review Treasury Impact
            </div>
                <ModalAllocation selectedPayrollList={selectedContributors}/>
          </div>
          <Button  className={"w-full py-3 mt-10 mb-3 text-base"}>
            Confirm and Run Payroll
          </Button>
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
