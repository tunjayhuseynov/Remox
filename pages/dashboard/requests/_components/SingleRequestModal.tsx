import React from "react";
import { IRequest, RequestStatus } from "rpcHooks/useRequest";
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode } from "redux/slices/account/remoxData";
import { AltCoins } from "types";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";
import Button from "components/button";

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
                <div className="text-greylish">Status</div>
                <div className="flex gap-x-2 items-center ">
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
                  </div>
                  <div className="flex gap-x-2 items-center">
                    {request?.amount}
                  </div>
                </div>
              </div>
              {!!request?.secondaryCurrency && !!request?.secondaryAmount && (
                <div>
                  <div className="flex gap-x-5 justify-between">
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
                    </div>
                    <div className="flex gap-x-2 items-center">
                      {request?.secondaryAmount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between border-b pb-8">
            <div className="text-greylish">Total</div>
            <div>
             ${!request.usdBase
                ? request?.secondaryAmount && coin2
                  ? (
                      +request?.secondaryAmount * coin2?.priceUSD +
                      +request?.amount * coin1!.priceUSD
                    ).toFixed(4)
                  : (+request?.amount * coin1!.priceUSD).toFixed(4)
                : request?.secondaryAmount
                ? request.amount + request.secondaryAmount
                : request.amount}{" "}
            </div>
          </div>
        </div>
        <div className="font-semibold text-xl my-4">Details</div>
        <div className="flex flex-col space-y-2 ">
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
              Attach links <span className="">(Optional)</span>
            </div>
            <div>
              {request?.attachLink ? (
                <a href={request?.attachLink} rel="noreferrer" target="_blank">
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
              <span>(Optional)</span>
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
      </div>
  );
};

export default SingleRequestModal;
