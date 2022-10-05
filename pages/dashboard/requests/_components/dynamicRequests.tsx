import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import Button from "components/button";
import Modal from "components/general/modal";
import useRequest from "hooks/useRequest";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import {  SelectBalance, SelectRequests, SelectSelectedAccountAndBudget } from "redux/slices/account/remoxData";
import TotalAmount from "pages/dashboard/requests/_components/totalAmount";
import TokenBalance from "./tokenBalance";
import ModalRequestItem from "./Modals/modalRequestItem";
import { Checkbox } from "@mui/material";
import RequestedUserItem from "./requestedUserItem";
import {
  addApprovedRequest,
  removePendingRequest,
  removeApprovedRequest
} from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { SelectID } from "redux/slices/account/remoxData";
import { useWalletKit } from "hooks";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import ModalAllocation from "pages/dashboard/payroll/_components/modalpay/modalAllocation";
import ApprovePendings from "./Modals/ApprovePendings";
import { GetFiatPrice } from "utils/const";

export default function DynamicRequest({
  type,
}: {
  type: "approved" | "pending" | "rejected";
}) {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(SelectRequests);
  const { approveRequest, removeRequest } = useRequest();
  const userId = useAppSelector(SelectID);
  const balance = useAppSelector(SelectBalance);
  const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget); 
  const { GetCoins, SendTransaction } = useWalletKit();
  const [openNotify, setNotify] = useState(false);
  const [openNotify2, setNotify2] = useState(false);

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

  useEffect(() => {
    if (openNotify) {
      document.querySelector("body")!.style.overflowY = "hidden";
    } else {
      document.querySelector("body")!.style.overflowY = "";
    }
  }, [openNotify]);

  const confirmRequest = async () => {
    try {
      let inputs: IPaymentInput[] = [];
      const requests = [...selectedApprovedRequests];
      for (const request of requests){
        const amount = request.amount;
        const address = request.address;
        const coin = Object.values(GetCoins).find((coin) => coin.symbol === request.currency);
        console.log(coin)

        if(request.fiat) {
          const fiatPrice = GetFiatPrice(coin!, request.fiat)

          inputs.push({
            amount: Number(amount) / (fiatPrice),
            coin: coin?.symbol ?? "",
            recipient: address,
          });
        } else {
          inputs.push({
            amount: Number(amount),
            coin: coin?.symbol ?? "",
            recipient: address,
          });
        }

        if(request.secondCurrency && request.secondAmount) {
          const secondAmount = request.secondAmount;
          const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === request.secondCurrency);
          console.log(coin2)

          if(request.fiatSecond) {
            const fiatPrice = GetFiatPrice(coin2!, request.fiatSecond)

            inputs.push({
              amount: Number(secondAmount) / (fiatPrice),
              coin: coin2?.symbol ?? "",
              recipient: address,
            });
          } else {
            inputs.push({
              amount: Number(secondAmount),
              coin: coin2?.symbol ?? "",
              recipient: address,
            });
          }
        } 
      };

      console.log(inputs)

      // await SendTransaction(accountAndBudget.account!, inputs, {
      //   budget: accountAndBudget.budget,
      // })

      // inputs = [];

      // for(const request of requests) {
      //   await removeRequest(request, userId ?? "");
      //   dispatch(removeApprovedRequest(request.id));
      // }

      // setSelectedApprovedRequests([])
      // setNotify(false);
    } catch (error) {
      console.log(error);
      throw new Error(error as any);
    }
  };

  const Approve = async () => {
    try {
      for (const request of selectedpPendingRequests) {
        await approveRequest(request, userId?.toString() ?? "");
        dispatch(removePendingRequest(request.id));
        const newRequest = { ...request, status: RequestStatus.approved };
        dispatch(addApprovedRequest(newRequest));
      }
      setNotify2(false);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const [isApproving, setApproving] = useLoading(Approve);
  const [isExecuting, setExecuting] = useLoading(confirmRequest);

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
                  } dark:border-[#D6D6D6]  border-opacity-10  h-9`}
                >
                  Total Treasury
                </div>

                <div className="flex flex-col items-end w-[11.05rem] ">
                  <TotalAmount coinList={selectedApprovedRequests} />
                </div>
                {selectedApprovedRequests.length > 0 && (
                  <div className="h-[1px] border-b dark:border-[#D6D6D6] absolute w-full bottom-10 "></div>
                )}
              </div>
              {selectedApprovedRequests.length > 0 && (
                <div className=" w-full relative">
                  <div className="h-[1px] border-b dark:border-[#D6D6D6] absolute w-full bottom-10 "></div>
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
          <ApprovePendings selectedpPendingRequests={selectedpPendingRequests} isApproving={isApproving} setApproving={setApproving} />
        </Modal>
        <table className="w-full pt-4 pb-6 mt-5">
          <thead>
            <tr className="overflow-hidden grid grid-cols-[25%,20.5%,25.5%,15%,14%] items-center mb-5 font-semibold tracking-wide bg-[#F2F2F2] shadow-15  dark:bg-darkSecond rounded-md  ">
              <th className="flex py-3 items-center space-x-1 pl-2">
                {page !== RequestStatus.rejected && (
                  <Checkbox
                    sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                    size="small"
                    className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:
                    before:w-full checked:before:h-full checked:before:bg-primary checked:before:block rounded-sm"
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
                <span className="text-sm font-semibold text-greylish dark:text-[#aaaaaa] pl-2">
                  Name
                </span>
              </th>
              <th className="text-sm py-3 text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Request date
              </th>
              <th className="text-sm py-3 text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Requested Amount
              </th>
              <th className="text-sm py-3 text-left font-semibold text-greylish dark:text-[#aaaaaa]">
                Request Type
              </th>
              {page === RequestStatus.pending &&
                <th>
                  {selectedpPendingRequests.length > 0 && (
                    <Button
                      className="text-sm !py-1 border-none !my-0 !px-2"
                      onClick={() => {
                        setNotify2(true);
                      }}
                    >
                      Approve Selected
                    </Button>)}
                 </th>
                }
                {page === RequestStatus.approved &&
                  <th>
                    {selectedApprovedRequests.length > 0 && (
                    <Button
                      className="text-sm !py-1 border-none !my-0 !px-3"
                      onClick={() => {
                        setNotify(true);
                      }}
                    >
                      Pay selected
                    </Button>)}
                  </th>
                }
            </tr>
            {requestsList.map((request) => {
              const coin1 = Object.values(GetCoins).find(
                (coin) => coin.symbol === request.currency
              );
              const coin2 = Object.values(GetCoins).find(
                (coin) => coin.symbol === request.secondCurrency
              );
              let isAllowed: boolean = true;
              const balance1 = Object.values(balance).find(
                (coin) => coin.symbol === request.currency
              )!.amount;
              const balance2 = Object.values(balance).find(
                (coin) => coin.symbol === request.secondCurrency
              )?.amount;
              if (request.secondCurrency) {
                if (
                  balance1 < +request.amount ||
                  balance2! < +request.secondAmount!
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
          <div className="h-fulll mx-[6rem] mt-12 !pb-7">
            <div className="text-2xl font-semibold mb-4">
              Approved Requests
            </div>
            <table className="w-full pb-4">
              <thead>
                <tr className="grid grid-cols-[25%,20%,30%,25%] font-semibold tracking-wide items-center bg-[#F2F2F2] shadow-15  dark:bg-darkSecond py-2 rounded-md ">
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
                    Request Type
                  </th>
                </tr>
                {selectedApprovedRequests.map((s) => (
                  <ModalRequestItem key={s.id} request={s} />
                ))}
              </thead>
            </table>
            <>
              <p className="py-2 text-xl font-semibold">
                Review Treasury Impact
              </p>
              <ModalAllocation selectedList={selectedApprovedRequests} />
            </>
            <div className="flex justify-end pb-2">
              <Button
                isLoading={isExecuting}
                onClick={() => setExecuting()}
                className={"py-2 mt-10 mb-3 text-sm"}
              >
                Confirm and Create Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
