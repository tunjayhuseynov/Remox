import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import Button from "components/button";
import Modal from "components/general/modal";
import useRequest from "hooks/useRequest";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "redux/hooks";
import { selectError } from "redux/slices/notificationSlice";
import { SelectBalance, SelectRequests } from "redux/slices/account/remoxData";
import TotalAmount from "pages/dashboard/requests/_components/totalAmount";
import { DashboardContext } from "layouts/dashboard";
import Loader from "components/Loader";
import TokenBalance from "./tokenBalance";
import ModalRequestItem from "./modalRequestItem";
import { Checkbox } from "@mui/material";
import RequestedUserItem from "./requestedUserItem";
import {
  addRejectedRequest,
  addApprovedRequest,
  removePendingRequest,
  SelectCurrencies,
} from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { SelectID } from "redux/slices/account/remoxData";
import { useWalletKit } from "hooks";

export default function DynamicRequest({
  type,
}: {
  type: "approved" | "pending" | "rejected";
}) {
  const [isPaying, setIsPaying] = useState(false);
  const dispatch = useDispatch();
  const requests = useAppSelector(SelectRequests);
  const { approveRequest, rejectRequest } = useRequest();
  const userId = useAppSelector(SelectID);
  const balance = useAppSelector(SelectBalance);
  const { GetCoins } = useWalletKit();

  let page: RequestStatus;
  if (type === "pending") {
    page = RequestStatus.pending;
  } else if (type === "approved") {
    page = RequestStatus.approved;
  } else {
    page = RequestStatus.rejected;
  }

  const requestsList =
    page === RequestStatus.pending
      ? requests.pendingRequests
      : page === RequestStatus.approved
      ? requests.approvedRequests
      : requests.rejectedRequests;
  let notAllowed: IRequest[] = [];
  const [selectedpPendingRequests, setSelectedPendingRequests] = useState<
    IRequest[]
  >([]);
  const [selectedApprovedRequests, setSelectedApprovedRequests] = useState<
    IRequest[]
  >([]);

  const [openNotify, setNotify] = useState(false);
  const [openNotify2, setNotify2] = useState(false);

  useEffect(() => {
    if (openNotify) {
      document.querySelector("body")!.style.overflowY = "hidden";
    } else {
      document.querySelector("body")!.style.overflowY = "";
    }
  }, [openNotify]);

  // const Submit = async () => {
  //     const result: Array<MultipleTransactionData & { member?: IRequest }> = []

  //     const mems = selected;

  //     if (mems.length) {
  //         for (let index = 0; index < mems.length; index++) {
  //             let amount;
  //             if (mems[index].usdBase) {
  //                 amount = (parseFloat(mems[index].amount) * (balance[GetCoins[mems[index].currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toString()
  //             } else {
  //                 amount = mems[index].amount
  //             }
  //             result.push({
  //                 toAddress: mems[index].address,
  //                 amount,
  //                 tokenName: mems[index].currency,
  //                 member: mems[index]
  //             })

  //             let secAmount = mems[index].secondaryAmount, secCurrency = mems[index].secondaryCurrency;

  //             if (secAmount && secCurrency) {
  //                 if (mems[index].secondaryAmount) {
  //                     secAmount = (parseFloat(secAmount) * (balance[GetCoins[mems[index].secondaryCurrency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(4)
  //                 }

  //                 result.push({
  //                     toAddress: mems[index].address,
  //                     amount: secAmount,
  //                     tokenName: secCurrency,
  //                 })
  //             }
  //         }
  //     }
  //     setIsPaying(true)

  //     try {
  //         if (selectedAccount) { //storage?.accountAddress.toLowerCase() === selectedAccount.toLowerCase()
  //             if (result.length === 1) {
  //                 // await Pay({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
  //                 await SendTransaction({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
  //             }
  //             else if (result.length > 1) {
  //                 const arr: Array<PaymentInput> = result.map(w => ({
  //                     coin: GetCoins[w.tokenName as keyof Coins],
  //                     recipient: w.toAddress,
  //                     amount: w.amount,
  //                     from: true
  //                 }))

  //                 // await BatchPay(arr)
  //                 await SendBatchTransaction(arr)
  //             }
  //         } else {
  //             if (result.length === 1) {
  //                 await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, coin: GetCoins[result[0].tokenName as keyof Coins], amount: result[0].amount }])
  //             }
  //             else if (result.length > 1) {
  //                 const arr: Array<PaymentInput> = result.map(w => ({
  //                     coin: GetCoins[w.tokenName as keyof Coins],
  //                     recipient: w.toAddress,
  //                     amount: w.amount,
  //                     from: true
  //                 }))

  //                 await submitTransaction(selectedAccount, arr)
  //             }
  //         }

  //         await FirestoreWrite<{ requests: FieldValue }>().updateDoc("requests", selectedAccount.toLowerCase(), {
  //             requests: arrayRemove(...selected)
  //         })

  //         setSuccess(true);
  //         setSelected([])
  //         refetch()
  //         setModal(false)

  //     } catch (error: any) {
  //         console.error(error)
  //         dispatch(changeError({ activate: true, text: error.message }));
  //     }

  //     setIsPaying(false);
  // }

  const Approve = async () => {
    try {
      for (const request of selectedpPendingRequests) {
        await approveRequest(request, userId?.toString() ?? "");
        dispatch(removePendingRequest(request.id));
        const newRequest = { ...request, status: RequestStatus.approved };
        dispatch(addApprovedRequest(request));
      }
      setNotify2(false);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const [isApproving, setApproving] = useLoading(Approve);

  return (
    <>
      <div className="flex flex-col space-y-8">
        {page === RequestStatus.approved && (
          <>
            <div className="w-full flex  py-6 px-7 bg-white shadow-15 dark:bg-darkSecond  rounded-md">
              <div className="relative">
                <div
                  className={`font-semibold text-lg text-greylish dark:text-white ${
                    selectedApprovedRequests.length > 0 && "border-r"
                  }  border-greylish dark:border-[#454545]  border-opacity-10  h-9`}
                >
                  Total Treasury
                </div>

                <div className="flex flex-col items-end w-[11.05rem] ">
                  <TotalAmount coinList={selectedApprovedRequests} />
                </div>
                {selectedApprovedRequests.length > 0 && (
                  <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>
                )}
              </div>
              {selectedApprovedRequests.length > 0 && (
                <div className=" w-full relative">
                  <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>
                  <div className="font-semibold text-lg text-greylish dark:text-white pl-5 h-9">
                    Token Allocation
                  </div>
                  <div className="pl-5">
                    <TokenBalance coinList={selectedApprovedRequests} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <Modal onDisable={setNotify2} openNotify={openNotify2}>
          <div className="flex flex-col w-[92.5%] h-[80%] pt-20 mx-auto">
            <div className="text-2xl font-semibold pt-4 pb-4">
              Pending Requests
            </div>
            <table className="w-full pt-12 pb-4">
              <thead>
                <tr className="grid grid-cols-[25%,20%,20%,20%,15%]  font-semibold tracking-wide items-center bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md ">
                  <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa] pl-3">
                    Contributors
                  </th>
                  <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                    Request date
                  </th>
                  <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                    Requested Amount
                  </th>
                  <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                    Requests Type
                  </th>
                </tr>
                {selectedpPendingRequests.map((s) => (
                  <ModalRequestItem key={s.id} request={s} />
                ))}
              </thead>
            </table>
            <Button
              isLoading={isApproving}
              onClick={() => setApproving()}
              className={"w-full py-2 mt-5 text-2xl"}
            >
              Approve Requests
            </Button>
          </div>
        </Modal>
        <table className="w-full pt-4 pb-6 mt-5">
          <thead>
            <tr className="grid grid-cols-[25%,20.5%,19.5%,21%,14%] mb-5 font-semibold tracking-wide items-center bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md  ">
              <th className="flex items-center space-x-1 pl-2">
                {page !== RequestStatus.rejected && (
                  <Checkbox
                    sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                    size="small"
                    className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:
                    before:w-full checked:before:h-full checked:before:bg-primary checked:before:block"
                    onChange={(e) => {
                      if (e.target.checked) {
                        (page as RequestStatus) === RequestStatus.approved
                          ? setSelectedApprovedRequests(requestsList)
                          : setSelectedPendingRequests(
                              requestsList.filter(
                                (r) => !notAllowed.includes(r)
                              )
                            );
                      } else {
                        (page as RequestStatus) === RequestStatus.approved
                          ? setSelectedApprovedRequests([])
                          : setSelectedPendingRequests([]);
                      }
                    }}
                  />
                )}
                <span className="text-lg  font-semibold text-greylish dark:text-[#aaaaaa] pl-2">
                  Contributor
                </span>
              </th>
              <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Request date
              </th>
              <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Requested Amount
              </th>
              <th className="text-lg text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Requests Type
              </th>
              {page === RequestStatus.pending &&
                selectedpPendingRequests.length > 0 && (
                  <th>
                    <Button
                      className="text-sm font-medium !py-1 w-[80%] !px-0 ml-4"
                      onClick={() => {
                        setNotify2(true);
                      }}
                    >
                      Approve Selected
                    </Button>
                  </th>
                )}
              {page === RequestStatus.approved &&
                selectedApprovedRequests.length > 0 && (
                  <th>
                    <Button
                      className="text-sm font-medium !py-1 w-[80%] !px-0 ml-4"
                      onClick={() => {
                        setNotify(true);
                      }}
                    >
                      Pay selected
                    </Button>
                  </th>
                )}
            </tr>
            {requestsList.map((request) => {
              const coin1 = Object.values(GetCoins).find(
                (coin) => coin.name === request.currency
              );
              const coin2 = Object.values(GetCoins).find(
                (coin) => coin.name === request.secondaryCurrency
              );
              let isAllowed: boolean = true;
              const balance1 = Object.values(balance).find(
                (coin) => coin.name === request.currency
              )!.amount;
              const balance2 = Object.values(balance).find(
                (coin) => coin.name === request.secondaryCurrency
              )?.amount;
              if (request.secondaryCurrency) {
                if (
                  balance1 < +request.amount ||
                  balance2! < +request.secondaryAmount!
                ) {
                  isAllowed = false;
                  notAllowed.push(request);
                }
              } else if (request.currency) {
                if (balance1 < +request.amount) {
                  isAllowed = false;
                  notAllowed.push(request);
                }
              }
              return (
                <RequestedUserItem
                  key={request.id}
                  request={request}
                  isAllowed={isAllowed}
                  coin1={coin1!}
                  coin2={coin2}
                  selectedPendingRequests={selectedpPendingRequests}
                  setSelectedPendingRequests={setSelectedPendingRequests}
                  selectedApprovedRequests={selectedApprovedRequests}
                  setSelectedApprovedRequests={setSelectedApprovedRequests}
                />
              );
            })}
          </thead>
        </table>
      </div>
      {page === RequestStatus.approved && (
        <Modal onDisable={setNotify} openNotify={openNotify}>
          <div className="flex  w-[92.5%] pt-20 h-[80%] mx-auto">
            <div className="flex flex-col w-full  ">
              <div className="flex flex-col">
                <div className="text-2xl font-bold tracking-wide pt-4 pb-4">
                  Approve Payments
                </div>
                <div className="w-full pt-12 pb-4 ">
                  <div className="grid grid-cols-[25%,17.5%,22.5%,20%,15%]  font-semibold tracking-wide bg-[#F2F2F2] shadow-15 py-2  dark:bg-[#2F2F2F] rounded-md  sm:mb-5 ">
                    <div className="text-lg  font-semibold text-greylish    dark:text-[#aaaaaa]  pl-3">
                      Contributor
                    </div>
                    <div className="text-lg  font-semibold text-greylish    dark:text-[#aaaaaa] ">
                      Request date
                    </div>
                    <div className="text-lg  font-semibold text-greylish    dark:text-[#aaaaaa] ">
                      Requested Amount
                    </div>
                    <div className="text-lg  font-semibold text-greylish    dark:text-[#aaaaaa] ">
                      Requests Type
                    </div>
                  </div>
                  {selectedApprovedRequests.map((w) => {
                    const coin1 = Object.values(GetCoins).find(
                      (coin) => coin.name === w.currency
                    );
                    const coin2 = Object.values(GetCoins).find(
                      (coin) => coin.name === w.secondaryCurrency
                    );
                    return (
                      <RequestedUserItem
                        key={w.id}
                        request={w}
                        coin1={coin1!}
                        coin2={coin2}
                        selectedPendingRequests={selectedpPendingRequests}
                        setSelectedPendingRequests={setSelectedPendingRequests}
                        selectedApprovedRequests={selectedApprovedRequests}
                        setSelectedApprovedRequests={
                          setSelectedApprovedRequests
                        }
                        payment={true}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col pt-4 space-y-3">
                <div className="text-2xl font-bold tracking-wide">
                  Review Treasury Impact
                </div>
                <div className="w-full flex flex-col  py-6 px-7 bg-white shadow-15 dark:bg-darkSecond  rounded-md">
                  <div className="grid grid-cols-[13.75%,86.25%] ">
                    <div
                      className={`font-semibold text-lg text-greylish dark:text-white ${
                        selectedApprovedRequests.length > 0 && "border-r"
                      }  border-greylish dark:border-[#454545]  border-opacity-10 h-9`}
                    >
                      Total Treasury
                    </div>
                    {selectedApprovedRequests.length > 0 && (
                      <div className="font-semibold text-lg text-greylish dark:text-white pl-5 h-9">
                        Token Allocation
                      </div>
                    )}
                  </div>
                  <div className="flex gap-5 justify-start items-start w-full relative">
                    {selectedApprovedRequests.length > 0 && (
                      <div className="h-[1px] border-b border-greylish dark:border-[#454545]  border-opacity-10 absolute w-full bottom-10 "></div>
                    )}
                    <div className="flex flex-col items-end w-[11.9rem] ">
                      <TotalAmount coinList={selectedApprovedRequests} />
                    </div>
                    <>
                      <TokenBalance coinList={selectedApprovedRequests} />
                    </>
                  </div>
                </div>
              </div>
              <div className="w-full pb-6 pt-6">
                <Button
                  className="w-full text-xl font-semibold"
                  isLoading={isPaying}
                >
                  Confirm and Create Transactions
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
