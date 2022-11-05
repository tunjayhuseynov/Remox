import React from "react";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode } from "redux/slices/account/remoxData";
import { AltCoins } from "types";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";
import { fiatList } from "components/general/PriceInputField";
import { NG } from "utils/jsxstyle";

const SingleRequestModal = ({
  request,
  coin1,
  coin2,
}: {
  request: IRequest;
  coin1: AltCoins;
  coin2?: AltCoins;
}) => {
  const isDark = useAppSelector(SelectDarkMode);

  const fiatFirst = fiatList.find((fiat) => fiat.name === request.fiat)
  const fiatSecond = fiatList.find((fiat) => fiat.name === request.fiatSecond)


  return (
      <div
        className={`w-[60%] shadow-15 transition-all hover:transition-all ${
          !isDark ? "border-2 border-solid border-[#FFF] bg-white hover:bg-[#f9f9f9]" : "bg-[#1C1C1C] hover:!bg-[#191919]"
        }  py-5 px-11`}
      >
        {request.status !== RequestStatus.approved && (
          <>
            <div className="font-semibold text-xl">Overview</div>
            <div className="flex flex-col space-y-2 mt-5">
              <div className="flex justify-between border-b pb-5">
                <div className="text-greylish text-sm font-medium">Status</div>
                <div className="flex gap-x-2 items-center text-sm font-medium ">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      request.status === RequestStatus.pending
                        ? "bg-primary"
                        : "bg-red-500"
                    } `}
                  ></span>
                  {request?.status}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="font-semibold text-xl my-4">Payee information</div>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">Full Name</div>
            <div className="text-sm font-medium">{request.fullname}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">Wallet Adress</div>
            <div className="truncate text-sm font-medium">
              {request?.address !== undefined &&
                AddressReducer(request?.address)}
            </div>
          </div>
          <div className={`flex justify-between ${!(request.secondCurrency && request.secondAmount) ? "border-b pb-5" : ""}`}>
            <div className="text-greylish text-sm font-medium">Requesting Amount</div>
            <div className="flex flex-col space-y-3">
              <div className="flex gap-x-3 justify-between">
                <div className="flex items-center text-sm font-medium">
                  <span className="w-2 h-2 rounded-full mr-2 bg-primary"></span>
                  <div>
                    <NG number={+request.amount} fontSize={0.875} />
                  </div>
                </div>
                <div className="flex gap-x-2 items-center">
                  <div className="flex items-center">
                    {
                      request.fiat ? (
                        <div className="relative">
                          <img src={fiatFirst?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                          <img src={coin1?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-5.3px] bottom-[-1.1px]" />
                        </div>
                        ) : <img src={coin1?.logoURI} className="rounded-xl w-[1.25rem] h-[1.25rem]" alt="Currency Logo" />
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!!request?.secondCurrency && !!request?.secondAmount && (
            <div className="flex justify-between border-b pb-5">
              <div className="text-greylish text-sm font-medium">Requesting Amount 2</div>
              <div className="flex flex-col space-y-3">
                <div className="flex gap-x-3 justify-between">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2 bg-primary"></span>
                    <div>
                      <NG number={+request.secondAmount} fontSize={0.875} />
                    </div>
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <div className="flex items-center">
                      {
                        request.fiatSecond ? (
                          <div className="relative">
                            <img src={fiatSecond?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                            <img src={coin2?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-5.3px] bottom-[-1.1px]" />
                          </div>
                        ) : <img src={coin2?.logoURI} className="rounded-xl w-[1.25rem] h-[1.25rem]" alt="Currency Logo" />
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="font-semibold text-xl my-4">Details</div>
        <div className="flex flex-col space-y-2 ">
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">Request Type</div>
            <div className="text-sm font-medium">{request?.requestType}</div>
          </div>
          {/* <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">Name of service</div>
            <div className="text-sm font-medium">{request?.nameOfService}</div>
          </div> */}
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">Date of service</div>
            <div className="text-sm font-medium">
              {dateFormat(
                new Date(request!.serviceDate * 1000),
                `mmm dd, yyyy`
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">
              Attach links <span className="">(Optional)</span>
            </div>
            <div className="text-sm font-medium">
              {request?.attachLink ? (
                <a href={request?.attachLink} rel="noreferrer" target="_blank">
                 {request?.attachLink.slice(0,50)}...
                </a>
              ) : (
                "No link provided"
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-greylish text-sm font-medium">
              Upload receipt or invoice (Optional)
            </div>
            <div className="text-sm font-medium">
              {request?.uploadedLink ? (
                <a href={request.uploadedLink} rel="noreferrer" target="_blank">{request.uploadedLink.slice(123, 136)}...</a>
              ) : (
                "No file uploaded"
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default SingleRequestModal;
