import Button from "components/button";
import { fiatList } from "components/general/PriceInputField";
import { IRequest } from "rpcHooks/useRequest";
import { AltCoins, Coins } from "types";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";
import { useForm } from "react-hook-form";
import { ITag } from "pages/api/tags/index.api";

interface IProps {
  request: IRequest | null | undefined;
  closeModal: () => Promise<void>;
  GetCoins: AltCoins[];
  loading: boolean;
  filename: string;
  tag: ITag,
  submit: () => Promise<void>;
}

export default ({
  request,
  GetCoins,
  closeModal,
  loading,
  tag,
  filename,
  submit
}: IProps) => {
  if (request === null || request === undefined) return <>No Data</>;
  const { handleSubmit } = useForm();

  const currency = GetCoins.find((coin) => coin.symbol === request.currency);
  const secondCurrency = GetCoins.find((coin) => coin.symbol === request.secondCurrency);

  const fiatFirst = fiatList.find((fiat) => fiat.name === request.fiat)
  const fiatSecond = fiatList.find((fiat) => fiat.name === request.fiatSecond)

  
  return (
    <div className="flex flex-col space-y-8 px-2">
      <div className="font-semibold text-xl my-4">Payee information</div>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between">
            <div className="text-greylish">Full Name</div>
            <div>{request.fullname}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-greylish">Wallet Adress</div>
            <div className="truncate">
              {request?.address !== undefined &&
                AddressReducer(request?.address)}
            </div>
          </div>
          <div className={`flex justify-between ${!(request.secondCurrency && request.secondAmount) ? "border-b pb-5" : ""}`}>
            <div className="text-greylish">Requesting Amount</div>
            <div className="flex flex-col space-y-3">
              <div className="flex gap-x-3 justify-between">
                <div className="flex gap-x-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {request?.amount}
                </div>
                <div className="flex gap-x-2 items-center">
                  <div className="flex items-center">
                    {
                      request.fiat ? (
                        <div className="relative">
                          <img src={fiatFirst?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                          <img src={currency?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-5.3px] bottom-[-1.1px]" />
                        </div>
                        ) : <img src={currency?.logoURI} className="rounded-xl w-[1.25rem] h-[1.25rem]" alt="Currency Logo" />
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!!request?.secondCurrency && !!request?.secondAmount && (
            <div className="flex justify-between border-b pb-5">
              <div className="text-greylish">Requesting Amount 2</div>
              <div className="flex flex-col space-y-3">
                <div className="flex gap-x-3 justify-between">
                  <div className="flex gap-x-2 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {request?.secondAmount}
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <div className="flex items-center">
                      {
                        request.fiatSecond ? (
                          <div className="relative">
                            <img src={fiatSecond?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                            <img src={secondCurrency?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-5.3px] bottom-[-1.1px]" />
                          </div>
                        ) : <img src={secondCurrency?.logoURI} className="rounded-xl w-[1.25rem] h-[1.25rem]" alt="Currency Logo" />
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
      <div className="font-semibold">Details</div>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between">
          <div className="text-greylish">Request Label</div>
          <div className="items-center flex text-sm font-medium ">
            <div className="flex space-x-2">
              <div className="w-1 h-5" style={{ backgroundColor: tag?.color }}></div>
              <span className="text-sm font-medium">{tag?.name}</span>
            </div>
        </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Name of Service</div>
          <div>
            {request.serviceName}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Request Date</div>
          <div>
            {dateFormat(new Date(request!.timestamp * 1000), `mmm dd, yyyy`)}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">
            Attach links <span className="">(Optional)</span>
          </div>
          <div>
            {request?.attachLink ? (
            <a href={request?.attachLink} rel="noreferrer" target="_blank">
              {request?.attachLink.slice(0,50)}...
            </a>) : "No link provided"}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">
            Upload receipt or invoice{" "}
            <span className="">(Optional)</span>
          </div>
          <div>
            {request?.uploadedLink ? (
              <a href={request?.uploadedLink} rel="noreferrer" target="_blank">
                {filename.slice(0,60)}...
              </a>
            ) : (
              "No file uploaded"
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-5 sm:pt-0">
        <form onSubmit={handleSubmit(submit)} className="flex flex-row gap-10 sm:grid grid-cols-2 w-[30rem] sm:justify-center sm:gap-5">
          <Button
            version="second"
            onClick={() => closeModal()}
            className="w-[9.375rem] text-lg sm:w-full !py-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className=" w-[9.375rem] text-lg sm:w-full bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg"
          >
            Confirm & Submit
          </Button>
        </form>
      </div>
    </div>
  );
};
