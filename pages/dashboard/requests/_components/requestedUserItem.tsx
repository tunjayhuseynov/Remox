import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { Dispatch, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AltCoins } from "types";
import { AddressReducer, SetComma } from "utils";
import dateFormat from "dateformat";
import Modal from "components/general/modal";
import Button from "components/button";
import useRequest from "hooks/useRequest";
import { FaChevronCircleRight } from "react-icons/fa";
import { useWalletKit } from "hooks";
import {
  addRejectedRequest,
  removePendingRequest,
  removeApprovedRequest,
  SelectDarkMode,
  addApprovedRequest,
} from "redux/slices/account/remoxData";
import { Checkbox } from "@mui/material";
import Avatar from "components/avatar";
import { SelectID, SelectSelectedAccountAndBudget } from "redux/slices/account/remoxData";
import { useAppSelector } from "redux/hooks";
import useLoading from "hooks/useLoading";
import { AiOutlineClose } from "react-icons/ai";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import SingleRequestModal from "./Modals/SingleRequestModal";
import { GetFiatPrice } from "utils/const";


const RequestedUserItem = ({
  request,
  coin1,
  coin2,
  isAllowed,
  selectedPendingRequests,
  setSelectedPendingRequests,
  payment,
  selectedApprovedRequests,
  setSelectedApprovedRequests,
}: {
  request: IRequest;
  coin1: AltCoins;
  coin2: AltCoins | undefined;
  isAllowed?: boolean;
  selectedPendingRequests: IRequest[];
  setSelectedPendingRequests: Dispatch<IRequest[]>;
  selectedApprovedRequests: IRequest[];
  setSelectedApprovedRequests: Dispatch<IRequest[]>;
  payment?: boolean;
}) => {
  const isDark = useAppSelector(SelectDarkMode)
  const [modal, setModal] = useState(false);
  const [detect, setDetect] = useState(true);
  const divRef = useRef<HTMLTableRowElement>(null);
  const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget);
  const dispatch = useDispatch();
  const { rejectRequest, approveRequest, removeRequest } = useRequest();
  const { GetCoins, SendTransaction } = useWalletKit();
  const userId = useAppSelector(SelectID);

  useEffect(() => {
    if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
      setDetect(false);
    }
  }, []);

  const Reject = async () => {
    try {
      await rejectRequest(request, userId?.toString() ?? "");
      if(request.status === RequestStatus.pending){
        dispatch(removePendingRequest(request.id));
      } else if(request.status === RequestStatus.approved){
        dispatch(removeApprovedRequest(request.id));
      }
      const newRequest = { ...request, status: RequestStatus.rejected };
      dispatch(addRejectedRequest(newRequest));
    } catch (error: any) {
      console.error(error.message);
    }
    setModal(false);
  };

  const Approve = async () => {
    try{
      await approveRequest(request, userId?.toString() ?? "");
      dispatch(removePendingRequest(request.id));
      const newRequest = { ...request, status: RequestStatus.approved };
      dispatch( addApprovedRequest(newRequest));
    } catch(error: any){
      console.error(error.message);
    }
    setModal(false)
  }

  const Execute = async () => {
    let inputs: IPaymentInput[] = [];
    const amount = request.amount
    if(request.fiat) {
      const fiatPrice = GetFiatPrice(coin1!, request.fiat)

      inputs.push({
        amount: Number(amount) / (fiatPrice),
        coin: coin1?.symbol ?? "",
        recipient: request.address,
      });
    } else {
      inputs.push({
        amount: Number(amount),
        coin: coin1?.symbol ?? "",
        recipient: request.address,
      });
    }

    if(request.secondCurrency && request.secondAmount) {
      const secondAmount = request.secondAmount;
      const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === request.secondCurrency);

      if(request.fiatSecond) {
        const fiatPrice = GetFiatPrice(coin2!, request.fiatSecond)

        inputs.push({
          amount: Number(secondAmount) / (fiatPrice),
          coin: coin2?.symbol ?? "",
          recipient: request.address,
        });
      } else {
        inputs.push({
          amount: Number(secondAmount),
          coin: coin2?.symbol ?? "",
          recipient: request.address,
        });
      }
    } 

    await SendTransaction(accountAndBudget.account!, inputs, {
      budget: accountAndBudget.budget,
    })
    
    dispatch(removeApprovedRequest(request.id));
    await removeRequest(request, userId ?? "")

  }

  const [isRejecting, setRejecting] = useLoading(Reject);
  const [isApproving, setApproving] = useLoading(Approve);
  const [isExecuting, setExecuting] = useLoading(Execute);

  return (
    <>
      <tr
        ref={divRef}
        className={`py-3 h-[6.1rem]  bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all  grid ${isAllowed  ? "" : request.status !== RequestStatus.rejected ? "!border-[#A60000] border-2" : "" }  ${
          detect
            ? "grid-cols-[25%,20.5%,19.5%,21%,14%] sm:grid-cols-[25%,20.5%,19.5%,21%,14%]"
            : "grid-cols-[27%,48%,25%]"
        } `}
      >
        <td className="flex overflow-hidden">
          <div className="flex items-center ml-2 mr-3">
            {request.status !== RequestStatus.rejected ? isAllowed ? (
              (!payment && request.status === RequestStatus.approved ? (
                <Checkbox
                  sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                  checked={
                    selectedApprovedRequests.find(
                      (item) => item.id === request.id
                    )
                      ? true
                      : false
                  }
                  className="relative cursor-pointer rounded-sm w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
                  onChange={(e) => {
                    const requests = [...selectedApprovedRequests];
                    if (e.target.checked) {
                      if (!requests.some((s) => s.id === request.id)) {
                        requests.push(request);
                        setSelectedApprovedRequests(requests);
                      }
                    } else {
                      setSelectedApprovedRequests(
                        requests.filter((m) => m.id !== request.id)
                      );
                    }
                  }}
                />
              ) : (
                <Checkbox
                  sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                  size="small"
                  checked={
                    selectedPendingRequests.find(
                      (item) => item.id === request.id
                    )
                      ? true
                      : false
                  }
                  className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full rounded-sm checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
                  onChange={(e) => {
                    const requests2 = [...selectedPendingRequests];
                    if (e.target.checked) {
                      if (!requests2.some((s) => s.id === request.id)) {
                        requests2.push(request);
                        setSelectedPendingRequests(requests2);
                      }
                    } else {
                      setSelectedPendingRequests(
                        requests2.filter((m) => m.id !== request.id)
                      );
                    }
                  }}
                />
              ))) : <span className="bg-[#A60000] text-white rounded-sm"><AiOutlineClose/></span> : "" }
            {!payment && request.status === RequestStatus.rejected && (
              <img src="/icons/request/close.png" className="mr-2" />
            )}
          </div>
          <div
            className={`hidden sm:flex ${
              detect ? "items-center" : "items-start"
            } justify-center mr-2`}
          >
            <div
              className={` ${
                request.status !== RequestStatus.rejected
                  ? ""
                  : "bg-red-300 text-black"
              }  ${
                detect
                  ? "w-[2.813rem] h-[2.813rem] text-lg"
                  : "w-[1.563rem] h-[1.563rem] text-xs"
              } flex items-center justify-center rounded-full font-bold `}
            >
              {request.uploadedLink ? (
                <img
                  src={request.uploadedLink}
                  alt=""
                  className="w-[2.5rem] h-[2.5rem] border items-center justify-center rounded-full"
                />
              ) : (
                <Avatar name={request.fullname.split(" ")[0]} surname={request.fullname.split(" ")[1]} />
              )}
            </div>
          </div>
          <div
            className={`sm:flex flex-col ${
              detect ? "justify-center" : "justify-start"
            } items-start `}
          >
            <div className="font-medium text-lg  ">
              {
                <span>
                    {request.fullname}
                </span>
              }
            </div>
            {request.address && (
              <div className="text-greylish font-medium text-[10px]">
                {AddressReducer(request.address)}
              </div>
            )}
          </div>
        </td>
        <td className="flex h-full items-center ">
          {request.serviceDate && (
            <div className="flex text-greyish dark:text-white tracking-wide text-lg font-medium">
              {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
            </div>
          )}
        </td>
        <td className="flex flex-col justify-center">
          <div className="flex items-center justify-start gap-1">
            {request.fiat ? <div className="flex items-center gap-1"> <span className="text-base">{request.amount}</span> {request.fiat} as <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" /></div> :
              <div className="flex items-center">
                  <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2" />
                  <span className="text-base">{request.amount}</span>
              </div>
            } 
          </div>
          {(request.secondCurrency && request.secondAmount) && <div className="flex items-center justify-start gap-1 mt-2">
          {request.fiatSecond ? <div className="flex items-center gap-1"> <span className="text-base">{request.secondAmount}</span> {request.fiatSecond} as <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full ml-2" /></div> :
              <div className="flex items-center">
                  <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full mr-2" />
                  <span className="text-base">{request.secondAmount}</span>
              </div>
            }      
          </div>}
        </td>
        <td className="items-center flex text-lg font-medium ">
          {request.requestType}
        </td>
        <td className="flex justify-end cursor-pointer items-center md:pr-0 ">
          {request.status !== RequestStatus.rejected && !payment && (
            <FaChevronCircleRight onClick={() => setModal(true)} className="mr-5  text-primary text-xl" />
          )}
        </td>
      </tr>
        <Modal onDisable={setModal} openNotify={modal}>
          <div className="w-full z-[10] flex flex-col items-center gap-4  ">
            <SingleRequestModal request={request} coin1={coin1} coin2={coin2}  />
                {request.status === RequestStatus.pending  ? (
                  <div className="flex justify-center w-[60%] pt-5 sm:pt-0">
                    <Button
                    version="reject"
                    className={`w-[9.375rem] text-lg sm:w-full ${isAllowed? "mr-2" : ""} !py `}
                    isLoading={isRejecting}
                    onClick={() => setRejecting()}
                  >
                    Reject Request
                  </Button>
                  {isAllowed && 
                    <Button
                      className="w-[9.375rem] text-lg sm:w-full !py-2 ml-2"
                        isLoading={isApproving}
                        onClick={() => setApproving()}
                    >
                      Approve Request
                    </Button>}
                  </div>) : <div className="w-[60%] flex justify-end pt-5 sm:pt-0">
                    <Button
                      className=" text-lg !py-2 w-[40%]"
                        isLoading={isExecuting}
                        onClick={() => setExecuting()}
                    >
                      Confirm & Submit
                    </Button>
                  </div> } 
          </div>
        </Modal>
    </>
  );
};

export default RequestedUserItem;
