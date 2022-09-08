import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { Dispatch, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Coins } from "types";
import { AddressReducer, SetComma } from "utils";
import dateFormat from "dateformat";
import Modal from "components/general/modal";
import Button from "components/button";
import useRequest from "hooks/useRequest";
import { TotalUSDAmount } from "./totalAmount";
import { useWalletKit } from "hooks";
import {
  addRejectedRequest,
  addApprovedRequest,
  removePendingRequest,
  SelectCurrencies,
} from "redux/slices/account/remoxData";
import { useAppDispatch } from "redux/hooks";
import { Checkbox } from '@mui/material';
import Avatar from "components/avatar";


const RequestedUserItem = ({
  request,
  selectedPendingRequests,
  setSelectedPendingRequests,
  payment,
  selectedApprovedRequests,
  setSelectedApprovedRequests,
}: {
  request: IRequest;
  selectedPendingRequests: IRequest[];
  setSelectedPendingRequests: Dispatch<IRequest[]>;
  selectedApprovedRequests: IRequest[];
  setSelectedApprovedRequests: Dispatch<IRequest[]>;
  payment?: boolean;
}) => {
  const [modal, setModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [detect, setDetect] = useState(true);
  const divRef = useRef<HTMLTableRowElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { approveRequest, rejectRequest } = useRequest();
  const { GetCoins } = useWalletKit();
  const coin1 = Object.values(GetCoins).find((coin) => coin.name === request.currency);
  const coin2 = Object.values(GetCoins).find((coin) => coin.name === request.secondaryCurrency);

  useEffect(() => {
    if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
      setDetect(false);
    }
  }, []);
  console.log(request.id);
  

  const Reject = async () => {
    setLoading(true);
    try {
      await rejectRequest(request.id, request);
      dispatch(removePendingRequest(request.id));
      dispatch(addRejectedRequest(request));
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error.message);
    }
    setModal(false);
  };

  const Approve = async () => {
    setLoading(true);
    try {
      await approveRequest(request.id, request);
      dispatch(removePendingRequest(request.id));
      dispatch(addApprovedRequest(request));
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error.message);
    }
    setModal(false);
  };

  return (
    <>
    <tr
      ref={divRef}
      className={`py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all  grid ${
        detect
          ? "grid-cols-[25%,17.5%,22.5%,21%,14%] sm:grid-cols-[25%,17.5%,22.5%,21%,14%]"
          : "grid-cols-[27%,48%,25%]"
      } `}
    >
      <td className="flex overflow-hidden">
        <div className="flex items-center ml-2 mr-3">
          {
            !payment && request.status === RequestStatus.approved ? (
              <Checkbox
              sx={{ "&.Mui-checked": { color: "#ff7348" } }}
              checked={selectedApprovedRequests.find((item) => item.id === request.id) ? true : false}
              className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
              onChange={(e) => {
                const requests = [...selectedApprovedRequests];
                if (e.target.checked) {
                  if (!requests.some((s) => s.id === request.id)) {
                    requests.push(request);
                    setSelectedApprovedRequests(requests);
                  }
                } else {
                  setSelectedApprovedRequests(requests.filter((m) => m.id !== request.id));
                }
              }}
            />
            ) : (
              <Checkbox
                sx={{ "&.Mui-checked": { color: "#ff7348" } }}
                size="small"
                checked={selectedPendingRequests.find((item) => item.id === request.id) ? true : false}
                className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
                onChange={(e) => {
                  const requests2 = [...selectedPendingRequests];
                  if (e.target.checked) {
                    if (!requests2.some((s) => s.id === request.id)) {
                      requests2.push(request);
                      setSelectedPendingRequests(requests2);
                    }
                  } else {
                    setSelectedPendingRequests(requests2.filter((m) => m.id !== request.id));
                  }
                }}
            />
            )
          }
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
            {request.image ? (
              <img
                src={`/icons/profilePhoto/${request.image}`}
                alt=""
                className="  w-12 h-12 border items-center justify-center rounded-full"
              />
            ) : (
              <Avatar name={request.name} surname={request.surname} />
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
                {" "}
                {request.name
                  ? `${request.name} ${request.surname}`
                  : "Unknown"}{" "}
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
      <td>
        <div className="flex h-full items-center justify-center">
          {request.serviceDate && (
            <div className="flex text-greyish dark:text-white tracking-wide text-lg font-medium">
              {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
            </div>
          )}
        </div>
      </td>
      <td className="flex items-center justify-center">
        <div className="flex flex-col space-y-2">
            <div
              className={`flex ${
                detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"
              } items-center space-x-2`}
            >
              {GetCoins && coin1 ? (
                <div className={`flex ${
                  detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"
                } gap-x-2 items-center text-lg font-medium`}>
                  <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                    <span>{request.usdBase ? (+request.amount / coin1!.priceUSD!).toFixed(3) : (+request.amount).toFixed(3)}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={coin1.logoURI}
                      width="20"
                      height="20"
                      className="rounded-full mr-2"
                    />
                    <span>{coin1.symbol}</span>
                  </div>
                  </div>
                ) : (
                  <div>Unknown Coin</div>
                )}
            </div>
          {!!request.secondaryAmount && !!request.secondaryCurrency && (
            <div
              className={`flex ${
                detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"
              } items-center space-x-2`}
            >
              {GetCoins && coin2 ? (
                <div className={`flex ${
                  detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"
                } gap-x-2 items-center text-lg font-medium`}>
                  <div className={`flex ${detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"} gap-x-2 items-center justify-start text-lg font-medium`}>
                    <span>{request.usdBase ? (+request.secondaryAmount / coin2!.priceUSD!).toFixed(3) : (+request.secondaryAmount).toFixed(3) }</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={coin2.logoURI}
                      width="20"
                      height="20"
                      className="rounded-full mr-2"
                    />
                    <span>{coin2.symbol}</span>
                  </div>
                  </div>
                ) : (
                  <div>Unknown Coin</div>
                )}
            </div>
          )}
        </div>
      </td>
      <td className="items-center flex justify-center  text-lg font-medium ">
        {request.requestType}
      </td>
      <td className="flex justify-end cursor-pointer items-center md:pr-0 ">
        {request.status !== RequestStatus.rejected && !payment && (
          <div
            onClick={() => setModal(true)}
            className={`text-primary text-center mr-7 ${
              detect
                ? "px-5 max-h-[5rem] min-w-[8.5rem] border rounded-md border-primary hover:bg-primary hover:text-white"
                : "text-sm hover:text-black dark:hover:text-white "
            }  py-1 transition-colors duration-300`}
          >
            View Details
          </div>
        )}
      </td>
    </tr>
      {modal && (
        <Modal onDisable={setModal} animatedModal={false} disableX={true}>
          <div className="flex flex-col space-y-4 min-w-[30vw]">
          <div className="font-semibold">Overview</div>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between border-b pb-8">
          <div className="text-greylish">Status</div>
          <div className="flex gap-x-2 items-center ">
            <span className="w-2 h-2 rounded-full bg-primary"></span>  
            {request?.status}
          </div>
        </div>
      </div>
      <div className="font-semibold">Payee information</div>
      <div className="flex flex-col space-y-5">
        {!!request?.name && (
          <div className="flex justify-between">
            <div className="text-greylish">Full Name</div>
            <div>{`${request?.name} ${request?.surname}`}</div>
          </div>
        )}
        <div className="flex justify-between">
          <div className="text-greylish">Wallet Adress</div>
          <div className="truncate">
            {request?.address !== undefined && AddressReducer(request?.address)}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Requesting Amount</div>
          <div className="flex flex-col space-y-3">
            <div>
              <div className="flex gap-x-5 justify-between">
                <div className="flex gap-x-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {request?.amount}
                </div>
                <div className="flex gap-x-2 items-center">
                  {!!request?.currency && (
                    <div className="flex items-center">
                      {request.usdBase ? <span className="mr-2">USD as</span> : ""}
                      <img
                        src={coin1!.logoURI}
                        className="rounded-xl w-[1.25rem] h-[1.25rem]"
                      />
                    </div>
                  )}
                  {coin1 ? <span>{coin1!.name}</span> : "Token not provided"}
                </div>
              </div>
            </div>
            {!!request?.secondaryCurrency && !!request?.secondaryAmount && (
              <div>
                <div className="flex gap-x-5 justify-between">
                  <div className="flex gap-x-2 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {request?.secondaryAmount}
                  </div>
                  <div className="flex gap-x-2 items-center">
                    {coin2 ? (
                      <div className="flex items-center">
                      {request.usdBase ? <span className="mr-2">USD as</span> : ""}
                      <img
                        src={coin2!.logoURI}
                        className="rounded-xl w-[1.25rem] h-[1.25rem]"
                      />
                    </div>
                    ) : (
                      ""
                    )}
                    {coin2
                      ? <span>{coin2.name}</span> 
                      : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between border-b pb-8">
          <div className="text-greylish">Total</div>
          <div>
            {!request.usdBase ? request?.secondaryAmount && coin2 ? ((+request?.secondaryAmount * coin2?.priceUSD) + (+request?.amount * coin1!.priceUSD)).toFixed(4) : (+ request?.amount * coin1!.priceUSD).toFixed(4) : request?.secondaryAmount ? request.amount + request.secondaryAmount : request.amount}
            {" "}
            USD
          </div>
        </div>
      </div>
      <div className="font-semibold">Details</div>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between">
          <div className="text-greylish">Request Type</div>
          <div>{request?.requestType}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Name of service</div>
          <div>{request?.nameOfService}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Date of service</div>
          <div>
            {dateFormat(new Date(request!.serviceDate * 1000), `mmm dd, yyyy`)}
          </div>
        </div>
          <div className="flex justify-between">
            <div className="text-greylish">
              Attach links <span className="text-black">(Optional)</span>
            </div>
            <div>
              {request?.attachLink ? (
              <a href={request?.attachLink} rel="noreferrer" target="_blank">
                {request?.attachLink}
              </a>) : "No link provided"}
            </div>
          </div>
        <div className="flex justify-between">
          <div className="text-greylish">
            Upload receipt or invoice{" "}
            <span className="text-black block">(Optional)</span>
          </div>
          <div>
            {request?.uploadedLink ? (
              <a href={request?.uploadedLink} rel="noreferrer" target="_blank">
                
              </a>
            ) : (
              "No file uploaded"
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-5 sm:pt-0">
      </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RequestedUserItem;
