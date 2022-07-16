import { Dispatch, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "components/button";
import {
  DateInterval,
  ExecutionType,
  IContributor,
  IMember,
} from "rpcHooks/useContributors";
import { useAppSelector } from "redux/hooks";
import useContributors from "hooks/useContributors";
import useAllowance from "rpcHooks/useAllowance";
import useGelato from "rpcHooks/useGelato";
import { CoinsName, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Loader from "components/Loader";
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import { IFormInput } from "../add-member";
import { UploadNFTorImageForUser } from "hooks/singingProcess/utils";
import {
  SelectContributors,
  updateMemberFromContributor,
} from "redux/slices/account/remoxData";
import { useRouter } from "next/router";

const EditMember = () => {
  const navigate = useRouter();
  const { id, teamId } = navigate.query as { id: string; teamId: string };
  const { register, handleSubmit } = useForm<IFormInput>();
  const [userIsUpload, setUserIsUpload] = useState<boolean>(true);

  const contributors = useAppSelector(SelectContributors);
  const contributor: IContributor = contributors.find((c) => c.id === teamId)!;

  const props: IMember = contributor?.members.find((m) => m.id === id)!;

  const imageType: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }];
  const [selectedPayment, setSelectedPayment] = useState(imageType[0]);

  const paymentname2: DropDownItem[] = [
    { name: "Full Time" },
    { name: "Part Time" },
    { name: "Bounty" },
  ];
  const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0]);

  const paymentname3: DropDownItem[] = [
    { name: "Pay with Token Amounts" },
    { name: "Pay with USD-based Amounts" },
  ];
  const [selectedPayment3, setSelectedPayment3] = useState(paymentname3[0]);

  const paymentname4: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];
  const [selectedPayment4, setSelectedPayment4] = useState(paymentname4[0]);

  const dispatch = useDispatch();
  const [file, setFile] = useState<File>();
  const { GetCoins, blockchain } = useWalletKit();

  const [value3, setValue3] = useState(
    props?.execution === ExecutionType.auto ? " Auto" : "Manual"
  );



  const { loading: allowLoading } = useAllowance();
  const { loading } = useGelato();

  const { editMember, isLoading } = useContributors();
  const [member, setMember] = useState<IMember>();

  const [selectedTeam, setSelectedTeam] = useState<DropDownItem>({
    name: "No Team",
    coinUrl: CoinsURL.None,
  });
  const [secondActive, setSecondActive] = useState(false);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [selectedExecution, setSelectedExecution] = useState(
    props?.execution === ExecutionType.auto ? true : false
  );

  const [selectedType, setSelectedType] = useState(props?.usdBase);

  const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({
    name: "Monthly",
    type: DateInterval.monthly,
  });
  const [selectedWallet, setSelectedWallet] = useState<DropDownItem>({
    name: GetCoins[props?.currency]?.name,
    id: GetCoins[props?.currency]?.name,
    coinUrl: GetCoins[props?.currency]?.coinUrl,
  });
  const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>({
    name: GetCoins[props?.currency]?.name,
    id: GetCoins[props?.currency]?.name,
    coinUrl: GetCoins[props?.currency]?.coinUrl,
  });

  useEffect(() => {
    setMember(props);
    setSecondActive(!!props!.secondaryAmount);
    if (props!.interval) {
      setSelectedFrequency(
        props!.interval === DateInterval.monthly
          ? { name: "Monthly", type: DateInterval.monthly }
          : { name: "Weekly", type: DateInterval.weekly }
      );
    }
    if (props!.paymantDate) {
      setStartDate(new Date(props!.paymantDate));
    }
    if (props!.paymantEndDate) {
      setEndDate(new Date(props!.paymantEndDate));
    }
    if (props!.secondaryCurrency) {
      setSelectedWallet2({
        name: GetCoins[props!.secondaryCurrency].name,
        id: GetCoins[props!.secondaryCurrency].name,
        coinUrl: GetCoins[props!.secondaryCurrency].coinUrl,
      });
    }
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const Photo = file;
    const Team = selectedTeam;
    const Compensation = selectedPayment2.name;
    const Wallet = selectedWallet;
    const Wallet2 = selectedWallet2;
    const dateStart = startDate;
    const dateEnd = endDate;


    try {
      let image: Parameters<typeof UploadNFTorImageForUser>[0] | undefined;
      if (Photo || data.nftAddress) {
        image = {
          image: {
            blockchain,
            imageUrl: Photo ?? data.nftAddress!,
            nftUrl: data.nftAddress ?? "",
            tokenId: data.nftTokenId ?? null,
            type: imageType ? "image" : "nft",
          },
          name: `individuals/${data.name}`,
        };
        await UploadNFTorImageForUser(image);
      }

      let newMember: IMember = {
        taskId: null,
        id: id,
        image: image ? image.image : null,
        first: `${data.name}`,
        name: `${data.name} ${data.surname}`,
        last: `${data.surname}`,
        role: `${data.role}`,
        address: data.address,
        compensation: Compensation,
        amount: data.amount.toString(),
        currency: Wallet.name as CoinsName,
        teamId: Team.id ? Team.id!.toString() : teamId.toString(),
        usdBase: selectedType,
        interval: selectedFrequency.type as DateInterval,
        execution:
          value3 === "Auto" ? ExecutionType.auto : ExecutionType.manual,
        paymantDate: dateStart!.toISOString(),
        paymantEndDate: dateEnd!.toISOString(),
        secondaryAmount: data.amount2 ? data.amount2.toString() : null,
        secondaryCurrency: Wallet2?.name ? (Wallet2.name as CoinsName) : null,
        secondaryUsdBase: data.amount2 ? selectedType : null,
      };
      //   Task Id meselesi hell ele
      await editMember(teamId, id, newMember);
      dispatch(
        updateMemberFromContributor({
          id: teamId,
          member: newMember,
        })
      );
      navigate.back();
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  return (
    <>
      <div>
        {member ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative w-full mx-auto"
          >
            <button
              onClick={() => navigate.back()}
              className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2"
            >
              {/* <img src="/icons/cross_greylish.png" alt="" /> */}
              <span className="text-4xl pb-1">&#171;</span> Back
            </button>
            <div className="flex flex-col space-y-8 w-[40%] mx-auto">
              <div className="text-2xl self-center pt-2 font-semibold ">
                Edit People
              </div>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col mb-4 space-y-1 w-full">
                  <div className=" text-left text-greylish">
                    Choose Profile Photo Type
                  </div>
                  <div className={` flex items-center gap-3 w-full`}>
                    <Dropdown
                      parentClass={"bg-white w-full rounded-lg "}
                      className={
                        "!rounded-lg !border dark:border-white h-[3.15rem]"
                      }
                      childClass={"!rounded-lg"}
                      list={imageType}
                      selected={selectedPayment}
                      onSelect={(e) => {
                        setSelectedPayment(e);
                        if (e.name === "NFT") setUserIsUpload(false);
                        else setUserIsUpload(true);
                      }}
                    />
                  </div>
                </div>
                {
                  <div className="flex flex-col mb-4 space-y-1 w-full">
                    <div className="text-left text-greylish">
                      {!userIsUpload ? "NFT Address" : "Your Photo"}{" "}
                    </div>
                    <div className={`  w-full border rounded-lg`}>
                      {!userIsUpload ? (
                        <input
                          type="text"
                          {...register("nftAddress", { required: true })}
                          className="bg-white dark:bg-darkSecond rounded-lg h-[3.15rem]  w-full px-1"
                        />
                      ) : (
                        <Upload
                          className={"!h-[3.15rem] block border-none w-full"}
                          setFile={setFile}
                        />
                      )}
                    </div>
                  </div>
                }
                {blockchain === "celo" && !userIsUpload && (
                  <div className="flex flex-col mb-4 gap-1 w-full">
                    <div className=" text-left  text-greylish">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                      <input
                        type="number"
                        {...register("nftTokenId", { required: true })}
                        className="bg-white dark:bg-darkSecond rounded-lg h-[3.15rem] unvisibleArrow  w-full px-1"
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-10">
                  <div>
                    <div className="text-greylish ">Name</div>
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      placeholder="First Name"
                      defaultValue={member.first}
                      className="border pl-2 rounded-md outline-none py-3  w-full dark:bg-darkSecond"
                      required
                    />
                  </div>
                  <div>
                    <div className="text-greylish ">Surname</div>
                    <input
                      type="text"
                      {...register("surname", { required: true })}
                      placeholder="Last Name"
                      defaultValue={member.last}
                      className="border pl-2 rounded-md outline-none py-3  w-full dark:bg-darkSecond"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-10">
                <div className="flex flex-col">
                  <div className="text-greylish">Team</div>
                  <div className="w-full ">
                    <Dropdown
                      onSelect={setSelectedTeam}
                      selected={selectedTeam}
                      list={
                        contributors.length > 0
                          ? [
                              ...contributors.map((w) => {
                                return {
                                  name: w.name,
                                  coinUrl: CoinsURL.None,
                                  id: w.id,
                                };
                              }),
                            ]
                          : []
                      }
                      nameActivation={true}
                      parentClass={"bg-white w-full rounded-lg h-[3.15rem]"}
                      className={
                        "!rounded-lg h-[3.15rem] border dark:border-white"
                      }
                      childClass={"!rounded-lg"}
                    />
                  </div>
                </div>
                <div className="flex flex-col ">
                  <div className="text-greylish">Compensation Type</div>
                  <div className=" w-full ">
                    <div>
                      <Dropdown
                        parentClass={"bg-white w-full rounded-lg h-[3.15rem]"}
                        className={
                          "!rounded-lg h-[3.15rem] border dark:border-white"
                        }
                        childClass={"!rounded-lg"}
                        list={paymentname2}
                        selected={selectedPayment2}
                        onSelect={(e) => {
                          setSelectedPayment2(e);
                          if (e.name === "Pay with USD-based Amounts")
                            setSelectedType(true);
                          else setSelectedType(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-10">
                <div>
                  <div className="text-greylish">Amount Type</div>
                  <div>
                    <Dropdown
                      parentClass={"bg-white w-full rounded-lg "}
                      className={
                        "!rounded-lg !h-[3.15rem] border dark:border-white"
                      }
                      childClass={"!rounded-lg"}
                      list={paymentname3}
                      selected={selectedPayment3}
                      onSelect={(e) => {
                        setSelectedPayment3(e);
                        if (e.name === "Pay with USD-based Amounts")
                          setSelectedType(true);
                        else setSelectedType(false);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-greylish ">Role</div>
                  <input
                    type="text"
                    {...register("role", { required: true })}
                    placeholder="Role"
                    defaultValue={member?.role}
                    className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond"
                    required
                  />
                </div>
              </div>
              <div className="flex w-full gap-x-10">
                {
                  <Dropdown
                    parentClass={
                      "w-full   border-transparent text-sm dark:text-white"
                    }
                    className="!rounded-md !h-[3.15rem] border dark:border-white"
                    nameActivation={true}
                    selected={
                      selectedWallet ??
                      Object.values(GetCoins!).map((w) => ({
                        name: w.name,
                        coinUrl: w.coinUrl,
                      }))[0]
                    }
                    list={Object.values(GetCoins!).map((w) => ({
                      name: w.name,
                      coinUrl: w.coinUrl,
                    }))}
                    onSelect={(val) => {
                      setSelectedWallet(val);
                    }}
                  />
                }
                <div
                  className={`border w-full text-black py-1 rounded-md grid ${
                    selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"
                  }`}
                >
                  <input
                    type="number"
                    defaultValue={member.amount}
                    {...register("amount", { required: true })}
                    className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white "
                    placeholder="Amount"
                    required
                    step={"any"}
                    min={0}
                  />
                  {selectedType && (
                    <span className="text-xs self-center opacity-70 dark:text-white">
                      USD as
                    </span>
                  )}
                </div>
              </div>
              {secondActive ? (
                <div className="flex gap-x-10">
                  {
                    <Dropdown
                      parentClass={
                        "w-full border-transparent text-sm dark:text-white"
                      }
                      className="!rounded-md !h-[3.15rem] border dark:border-white"
                      nameActivation={true}
                      selected={
                        selectedWallet2 ??
                        Object.values(GetCoins!).map((w) => ({
                          name: w.name,
                          coinUrl: w.coinUrl,
                        }))[0]
                      }
                      list={Object.values(GetCoins!).map((w) => ({
                        name: w.name,
                        coinUrl: w.coinUrl,
                      }))}
                      onSelect={(val) => {
                        setSelectedWallet2(val);
                      }}
                    />
                  }
                  <div
                    className={`border w-full text-black py-1 rounded-md grid ${
                      selectedType
                        ? "grid-cols-[80%,20%]"
                        : "grid-cols-[50%,50%]"
                    }`}
                  >
                    <input
                      type="number"
                      {...register("amount2", { required: true })}
                      defaultValue={member.secondaryAmount ?? 0}
                      className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white"
                      placeholder="Amount"
                      step={"any"}
                      min={0}
                    />
                    {selectedType && (
                      <span className="text-xs self-center opacity-70 dark:text-white ">
                        USD as
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => setSecondActive(true)}
                >
                  + Add another token
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <div className="text-greylish">Wallet Address</div>
                <div>
                  <input
                    type="text"
                    {...register("address", { required: true })}
                    defaultValue={member.address}
                    className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond"
                    placeholder="Wallet Address"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-x-10">
                <div className="flex flex-col space-y-2 w-full">
                  <div className="text-greylish">Payment Type</div>
                  <Dropdown
                    parentClass={"bg-white w-full rounded-lg h-[3.15rem]"}
                    className={
                      "!rounded-lg h-[3.15rem] border dark:border-white"
                    }
                    childClass={"!rounded-lg"}
                    list={paymentname4}
                    selected={selectedPayment4}
                    onSelect={(e) => {
                      setSelectedPayment4(e);
                      if (e.name === "Auto") setSelectedExecution(true);
                      else setSelectedExecution(false);
                    }}
                  />
                </div>

                <div className="flex flex-col space-y-2 w-full">
                  <div className="text-greylish">Payment Frequency</div>
                  <div>
                    <Dropdown
                      onSelect={setSelectedFrequency}
                      selected={selectedFrequency}
                      list={[
                        { name: "Monthly", type: DateInterval.monthly },
                        { name: "Weekly", type: DateInterval.weekly },
                      ]}
                      nameActivation={true}
                      className="border dark:border-white !rounded-md !py-[0.7rem] "
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-10">
                <div className="flex flex-col space-y-2 w-full">
                  <div className="text-greylish">Payment Start Date</div>
                  <div className="border  dark:bg-darkSecond bg-white  rounded-lg">
                    <DatePicker
                      className="dark:bg-darkSecond bg-white w-full rounded-lg outline-none h-[3.15rem] pl-2"
                      selected={startDate}
                      minDate={new Date()}
                      onChange={(date) => (date ? setStartDate(date) : null)}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2 w-full">
                  <div className="text-greylish">Payment End Date</div>
                  <div className="border dark:bg-darkSecond bg-white  rounded-lg">
                    <DatePicker
                      className="dark:bg-darkSecond bg-white w-full rounded-lg outline-none h-[3.15rem] pl-2"
                      selected={endDate}
                      minDate={new Date()}
                      onChange={(date) => (date ? setEndDate(date) : null)}
                    />
                  </div>
                </div>
              </div>
              {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
              <div className="grid grid-cols-2 gap-x-10 justify-center">
                <Button
                  version="second"
                  className="px-8 py-3"
                  onClick={() => navigate.back()}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="px-8 py-3"
                  isLoading={isLoading || loading || allowLoading}
                >
                  Save Person
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex justify-center">
            {" "}
            <Loader />
          </div>
        )}
      </div>
    </>
  );
};

export default EditMember;
