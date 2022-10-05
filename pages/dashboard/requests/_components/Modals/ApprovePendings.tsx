import React from 'react'
import Button from "components/button";
import ModalRequestItem from "./modalRequestItem";
import { IRequest } from 'rpcHooks/useRequest'

const ApprovePendings = ({selectedpPendingRequests , isApproving, setApproving} : {selectedpPendingRequests: IRequest[] , isApproving: boolean, setApproving: (...type: any) => void}) => {
  return (
    <div className="h-fulll mx-[6rem] mt-12 pb-4">
        <div className="text-2xl font-semibold  mb-4">
          Pending Requests
        </div>
        <table className="w-full pt-12 pb-4">
          <thead>
            <tr className="grid grid-cols-[25%,20%,30%,25%]  font-semibold tracking-wide items-center bg-[#F2F2F2] shadow-15 py-2  dark:bg-darkSecond rounded-md ">
              <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa] pl-3">
                Name
              </th>
              <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Request date
              </th>
              <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Requested Amount
              </th>
              <th className="text-sm text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Requests Type
              </th>
            </tr>
            {selectedpPendingRequests.map((s) => (
              <ModalRequestItem key={s.id} request={s} />
            ))}
          </thead>
        </table>
        <div className="w-full flex justify-end">
          <Button
            isLoading={isApproving}
            onClick={() => setApproving()}
            className={"py-2 px-16 mt-5 mb-3 text-sm"}
          >
            Approve Requests
          </Button>
        </div>
    </div>
  )
}

export default ApprovePendings