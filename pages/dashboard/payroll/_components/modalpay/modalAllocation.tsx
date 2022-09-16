import React from 'react'
import TotalAmount from 'pages/dashboard/requests/_components/totalAmount'
import {  IMember } from 'types/dashboard/contributors';
import TokenBalance from 'pages/dashboard/requests/_components/tokenBalance';

const ModalAllocation = ({selectedPayrollList} : {selectedPayrollList: IMember[]}) => {
  return (
        <>
            <div className="w-full flex  py-6 px-7 bg-white shadow-15 dark:bg-darkSecond  rounded-md">
              <div className="relative">
                <div
                  className={`font-semibold text-lg text-greylish dark:text-white ${
                    selectedPayrollList.length > 0 && "border-r"
                  }  border-greylish dark:border-[#454545]  border-opacity-10  h-9`}
                >
                  Total Treasury
                </div>

                <div className="flex flex-col items-end w-[11.05rem] ">
                  <TotalAmount coinList={selectedPayrollList} />
                </div>
                {selectedPayrollList.length > 0 && (
                  <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>
                )}
              </div>
              {selectedPayrollList.length > 0 && (
                <div className=" w-full relative">
                  <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>
                  <div className="font-semibold text-lg text-greylish dark:text-white pl-5 h-9">
                    Token Allocation
                  </div>
                  <div className="pl-5">
                    <TokenBalance coinList={selectedPayrollList} />
                  </div>
                </div>
              )}
            </div>
        </>
  )
}

export default ModalAllocation