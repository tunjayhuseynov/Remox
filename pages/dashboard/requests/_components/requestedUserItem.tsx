import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { Dispatch, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AltCoins, Coins } from "types";
import { AddressReducer, SetComma } from "utils";
import dateFormat from "dateformat";
import Modal from "components/general/Modal";
import Button from "components/button";
import useRequest from "hooks/useRequest";
import { TotalUSDAmount } from "./totalAmount";
import { useWalletKit } from "hooks";
import {
  addRejectedRequest,
  addApprovedRequest,
  removePendingRequest,
  SelectCurrencies,
  SelectBalance,
} from "redux/slices/account/remoxData";
import { useAppDispatch } from "redux/hooks";
import { Checkbox } from "@mui/material";
import Avatar from "components/avatar";
import { SelectID } from "redux/slices/account/remoxData";
import { useAppSelector } from "redux/hooks";
import useLoading from "hooks/useLoading";
import { AiOutlineClose } from "react-icons/ai";

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
  const [modal, setModal] = useState(false);
  const [detect, setDetect] = useState(true);
  const divRef = useRef<HTMLTableRowElement>(null);
  const dispatch = useDispatch();
  const { rejectRequest } = useRequest();
  const { GetCoins } = useWalletKit();
  const userId = useAppSelector(SelectID);

  useEffect(() => {
    if (divRef.current && window.innerWidth / divRef.current.clientWidth > 3) {
      setDetect(false);
    }
  }, []);

  const Reject = async () => {
    try {
      await rejectRequest(request, userId?.toString() ?? "");
      dispatch(removePendingRequest(request.id));
      const newRequest = { ...request, status: RequestStatus.rejected };
      dispatch(addRejectedRequest(newRequest));
    } catch (error: any) {
      console.error(error.message);
    }
    setModal(false);
  };

  const [isLoading, setRejecting] = useLoading(Reject);

  return (
    <>
      <tr
        ref={divRef}
        className={`py-3 h-[6.1rem]  bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all  grid ${isAllowed  ? "" : request.status !== RequestStatus.rejected ? "!border-[#EF2727] border-2" : "" }  ${
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
                  className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
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
                  className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block mr-2"
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
              ))) : <span className="bg-[#EF2727] rounded-sm"><AiOutlineClose/></span> : "" }
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
        <td className="flex h-full items-center ">
          {request.serviceDate && (
            <div className="flex text-greyish dark:text-white tracking-wide text-lg font-medium">
              {dateFormat(new Date(request!.serviceDate * 1000), `dd/mm/yyyy`)}
            </div>
          )}
        </td>
        <td className="flex items-center  ">
          <div className="space-y-2">
            <div
              className={`flex ${
                detect ? "grid-cols-[20%,80%]" : "grid-cols-[45%,55%]"
              } items-center space-x-4`}
            >
              {GetCoins && coin1 ? (
                <div
                  className={`flex ${
                    detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"
                  } gap-x-2 items-center text-lg font-medium`}
                >
                  <div className="flex items-center">
                    <img
                      src={coin1.logoURI}
                      width="20"
                      height="20"
                      className="rounded-full mr-2"
                    />
                  </div>
                  <div
                    className={`flex ${
                      detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"
                    } gap-x-2 items-center justify-start text-lg font-medium`}
                  >
                    <span>
                      {request.usdBase
                        ? SetComma(
                            parseFloat(request.amount) / coin1!.priceUSD!
                          )
                        : SetComma(+request.amount)}
                    </span>
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
                } items-center space-x-4`}
              >
                {GetCoins && coin2 ? (
                  <div
                    className={`flex ${
                      detect ? "grid-cols-[10%,90%]" : "grid-cols-[30%,70%]"
                    } gap-x-2 items-center text-lg font-medium`}
                  >
                    <div className="flex items-center">
                      <img
                        src={coin2.logoURI}
                        width="20"
                        height="20"
                        className="rounded-full mr-2"
                      />
                    </div>
                    <div
                      className={`flex ${
                        detect ? "grid-cols-[15%,85%]" : "grid-cols-[25%,75%]"
                      } gap-x-2 items-center justify-start text-lg font-medium`}
                    >
                      <span>
                        {request.usdBase
                          ? SetComma(
                              +request.secondaryAmount / coin2!.priceUSD!
                            )
                          : SetComma(+request.secondaryAmount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>Unknown Coin</div>
                )}
              </div>
            )}
          </div>
        </td>
        <td className="items-center flex text-lg font-medium ">
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
                  <span className={`w-2 h-2 rounded-full ${request.status === RequestStatus.approved ? "bg-green-500" : request.status === RequestStatus.pending ? "bg-primary" : "bg-red-500"} `}></span>
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
                  {request?.address !== undefined &&
                    AddressReducer(request?.address)}
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
                            {request.usdBase ? (
                              <span className="mr-2">USD as</span>
                            ) : (
                              ""
                            )}
                            <img
                              src={coin1!.logoURI}
                              className="rounded-xl w-[1.25rem] h-[1.25rem]"
                            />
                          </div>
                        )}
                        {coin1 ? (
                          <span>{coin1!.name}</span>
                        ) : (
                          "Token not provided"
                        )}
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
                              {request.usdBase ? (
                                <span className="mr-2">USD as</span>
                              ) : (
                                ""
                              )}
                              <img
                                src={coin2!.logoURI}
                                className="rounded-xl w-[1.25rem] h-[1.25rem]"
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {coin2 ? <span>{coin2.name}</span> : ""}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between border-b pb-8">
                <div className="text-greylish">Total</div>
                <div>
                  {!request.usdBase
                    ? request?.secondaryAmount && coin2
                      ? (
                          +request?.secondaryAmount * coin2?.priceUSD +
                          +request?.amount * coin1!.priceUSD
                        ).toFixed(4)
                      : (+request?.amount * coin1!.priceUSD).toFixed(4)
                    : request?.secondaryAmount
                    ? request.amount + request.secondaryAmount
                    : request.amount}{" "}
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
                  {dateFormat(
                    new Date(request!.serviceDate * 1000),
                    `mmm dd, yyyy`
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-greylish">
                  Attach links <span className="text-black">(Optional)</span>
                </div>
                <div>
                  {request?.attachLink ? (
                    <a
                      href={request?.attachLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {request?.attachLink}
                    </a>
                  ) : (
                    "No link provided"
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-greylish">
                  Upload receipt or invoice{" "}
                  <span className="text-black block">(Optional)</span>
                </div>
                <div>
                  {request?.uploadedLink ? (
                    <a
                      href={request?.uploadedLink}
                      rel="noreferrer"
                      target="_blank"
                    ></a>
                  ) : (
                    "No file uploaded"
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-5 sm:pt-0">
                <Button
                  version="second"
                  className="w-[9.375rem] text-lg sm:w-full !py-2"
                  isLoading={isLoading}
                  onClick={() => setRejecting()}
                >
                  Reject Request
                </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RequestedUserItem;
