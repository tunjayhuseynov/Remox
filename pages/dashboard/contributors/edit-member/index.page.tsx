import { useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import "react-datepicker/dist/react-datepicker.css";
import Button from "components/button";
import {
  DateInterval,
  ExecutionType,
  IContributor,
  IMember,
} from "types/dashboard/contributors";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import useContributors from "hooks/useContributors";
import { AltCoins } from "types";
import { useWalletKit } from "hooks";
import { Stack, TextField } from "@mui/material";
import {
  SelectContributors,
  SelectID,
  updateMemberFromContributor,
} from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import EditableAvatar from "components/general/EditableAvatar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FiatMoneyList, Image } from "firebaseConfig";
import PriceInputField from "components/general/PriceInputField";
import { IoMdRemoveCircle } from "react-icons/io";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import Modal from "components/general/modal";
import ChooseBudget from "components/general/chooseBudget";
import { IAccountORM } from "pages/api/account/index.api";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { GetTime } from "utils";
import { Blockchains } from "types/blockchains";

const EditMember = () => {
  const navigate = useRouter();
  const { id, teamId } = navigate.query as { id: string; teamId: string };
  const { GetCoins: coins, SendTransaction } = useWalletKit();
  const dispatch = useAppDispatch();
  const { editMember } = useContributors();

  //Selectors
  const teams = useAppSelector(SelectContributors);
  const userId = useAppSelector(SelectID);

  //RenderVariables
  const team: IContributor = teams.find((c) => c.id === teamId)!;
  const member: IMember = team?.members.find((m) => m.id === id)!;
  const schedule: DropDownItem[] = [
    { name: "Full Time" },
    { name: "Part Time" },
    { name: "Bounty" },
  ];

  //States
  const blockchain = Blockchains.find(b => b.name === member.blockchain) ?? Blockchains[0]
  let GetCoins = coins(blockchain.chainId)

  const [url, setUrl] = useState<string>(member.image?.imageUrl ?? "");
  const [type, setType] = useState<"image" | "nft">(
    member.image?.type ?? "image"
  );
  const [fullname, setFullname] = useState<string>(member.fullname);
  const [selectedTeam, setSelectedTeam] = useState<DropDownItem>({
    name: team.name,
    id: team.id,
  });
  const [selectedSchedule, setSchedule] = useState<DropDownItem>(
    schedule.find((s) => s.name === member.compensation) ?? schedule[0]
  );
  const [role, setRole] = useState<string>(member.role);

  const [amount, setAmount] = useState<number | null>(+member.amount);
  const [coin, setCoin] = useState<AltCoins | undefined>(
    Object.values(GetCoins).find((coin) => coin.symbol === member.currency) ??
    Object.values(GetCoins)[0]
  );
  const [fiatMoney, setFiatMoney] = useState<FiatMoneyList | null>(member.fiat);

  const [amountSecond, setAmountSecond] = useState<number | null | undefined>(
    member.secondAmount ? +member.secondAmount : null
  );
  const [coinSecond, setCoinSecond] = useState<AltCoins | undefined>(
    Object.values(GetCoins).find(
      (coin) => coin.symbol === member.secondCurrency
    ) ?? Object.values(GetCoins)[1]
  );
  const [fiatMoneySecond, setFiatMoneySecond] = useState<FiatMoneyList | null>(
    member.fiatSecond
  );

  const [address, setAddress] = useState<string>(member.address);

  const [secondActive, setSecondActive] = useState(
    member.secondAmount ? true : false
  );
  const [startDate, setStartDate] = useState<Date>(
    new Date(member.paymantDate * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(member.paymantEndDate ? new Date(member.paymantEndDate * 1000) : null);
  const [taskId, setTaskId] = useState<string | null>(member.taskId);
  const [loading, setLoading] = useState<boolean>(false);
  const [choosingBudget, setChoosingBudget] = useState<boolean>(false);
  const [selectedBlockchain, setSelectedBlockchain] = useState<typeof Blockchains[0]>(blockchain);

  //Variables

  const paymentType: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];

  const [selectedPaymentType, setPaymentType] = useState(
    member?.execution === ExecutionType.auto ? paymentType[1] : paymentType[0]
  );

  const Frequency = [
    { name: "Monthly", type: DateInterval.monthly },
    { name: "Weekly", type: DateInterval.weekly },
  ];

  const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>(
    member.interval === DateInterval.monthly ? Frequency[0] : Frequency[1]
  );

  const submit = async (account?: IAccountORM | undefined, budget?: IBudgetORM | null, subbudget?: ISubbudgetORM | null) => {
    const blockchain = Blockchains.find((b) => b.name === member.blockchain) ?? Blockchains[0];
    const Team = selectedTeam;
    const Compensation = selectedSchedule.name;
    const Coin1 = coin;
    const Coin2 = coinSecond;
    const Photo: Image = {
      imageUrl: url,
      nftUrl: url.toString(),
      type: type,
      tokenId: null,
      blockchain: blockchain.name,
    };

    const dateNow = new Date();

    setLoading(true);
    let inputs: IPaymentInput[] = [];

    try {
      if (!(member.execution === selectedPaymentType.name)) {
        if (selectedPaymentType.name === "Auto") {
          if (
            new Date(startDate ?? dateNow).getTime() !== member.paymantDate ||
            new Date(endDate ?? dateNow).getTime() !== member.paymantEndDate
          ) {
            await SendTransaction(account!, [], {
              cancelStreaming: true,
              streamingIdDirect: member.taskId ?? undefined,
              budget: budget,
              subbudget: subbudget
            });

            inputs.push({
              amount: amount ?? 1,
              coin: Coin1?.symbol ?? Object.values(GetCoins)[0].symbol,
              recipient: address,
            });
            if (amountSecond && Coin2) {
              inputs.push({
                amount: amountSecond,
                coin: Coin2.symbol,
                recipient: address,
              });
              const id = await SendTransaction(
                account!,
                inputs,
                {
                  createStreaming: true,
                  startTime: startDate.getTime(),
                  endTime: endDate!.getTime(),
                  budget: budget,
                  subbudget: subbudget
                }
              );

              setTaskId(id!);
            }
          }
        } else if (
          member.execution === "Auto" &&
          selectedPaymentType.name == "Manual"
        ) {
          await SendTransaction(account!, [], {
            cancelStreaming: true,
            streamingIdDirect: member.taskId ?? undefined,
          });
        } else if (
          member.execution === "Manual" &&
          selectedPaymentType.name === "Auto"
        ) {
          inputs.push({
            amount: amount ?? 1,
            coin: Coin1?.symbol ?? Object.values(GetCoins)[0].symbol,
            recipient: address,
          });
          if (amountSecond && Coin2) {
            inputs.push({
              amount: amountSecond,
              coin: Coin2.symbol,
              recipient: address,
            });
            const id = await SendTransaction(
              account!,
              inputs,
              {
                createStreaming: true,
                startTime: startDate.getTime(),
                endTime: endDate!.getTime(),
                budget: budget,
                subbudget: subbudget
              }
            );

            setTaskId(id!);
          }
        }
      }

      let newMember: IMember = {
        id: id,
        fullname: fullname.trim(),
        teamId: Team.id?.toString() ?? "",
        compensation: Compensation,
        role,
        amount: (amount ?? 1).toString(),
        currency: Coin1?.symbol ?? "",
        fiat: fiatMoney ?? null,
        secondAmount: amountSecond ? amountSecond.toString() : null,
        secondCurrency: Coin2 ? Coin2.symbol : null,
        fiatSecond: fiatMoneySecond ?? null,
        address,
        execution:
          selectedPaymentType.name === "Auto"
            ? ExecutionType.auto
            : ExecutionType.manual,
        interval: selectedFrequency.type as DateInterval,
        paymantDate: GetTime(startDate ?? dateNow),
        paymantEndDate: endDate ? GetTime(endDate) : null,
        // checkedCount: member.checkedCount,
        // lastCheckedDate: member.lastCheckedDate,
        checkedList: member.checkedList,
        image: url ? Photo : null,
        taskId: taskId,
        blockchain: member.blockchain,
      };

      // console.log(newMember);
      await editMember(teamId, id, newMember);
      dispatch(
        updateMemberFromContributor({
          id: teamId,
          member: newMember,
        })
      );

      setLoading(false);
      setChoosingBudget(false);
      navigate.back();
    } catch (error: any) {
      console.log(error);
      setLoading(false)
      throw error;
    }
  };

  const onChange = (url: string, type: "image" | "nft") => {
    setType(type);
    setUrl(url);
  };

  return (
    <>
      <div className="relative w-full mx-auto">
        <button
          onClick={() => navigate.back()}
          className="absolute left-0 w-[4rem] top-0 tracking-wider font-semibold transition-all text-primary hover:transition-all flex items-center text-xl gap-2"
        >
          <span className="text-3xl pb-1">&#171;</span> Back
        </button>
        <div>
          <div className="flex flex-col space-y-8 w-[40%] mx-auto pb-4">
            <div className="text-2xl self-center pt-2 font-semibold ">
              Edit Member
            </div>
            <div className="flex justify-center items-center mb-4 w-full">
              <EditableAvatar
                avatarUrl={member.image ? url : null}
                name={member.address ?? ""}
                userId={userId ?? ""}
                // evm={blockchain.name !== "solana"}
                // blockchain={blockchain}
                onChange={onChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-10">
              <TextField
                label="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="bg-white dark:bg-darkSecond z-[0]"
                variant="outlined"
              />
              <Dropdown
                label="Workstream"
                setSelect={setSelectedTeam}
                selected={selectedTeam}
                list={teams}
                className="z-[0] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                sx={{
                  ".MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    maxHeight: "52px",
                  },
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-10">
              <Dropdown
                label="Compensation Type"
                className="z-[0] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                list={schedule}
                selected={selectedSchedule}
                setSelect={setSchedule}
                sx={{
                  ".MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    maxHeight: "52px",
                  },
                }}
              />
              <TextField
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-white dark:bg-darkSecond z-[0]"
                variant="outlined"
              />
            </div>
            <div className={`flex w-full gap-x-10 ${choosingBudget ? 'z-[0]' : ''}`}>
              <PriceInputField
                isMaxActive={true}
                coins={GetCoins}
                defaultCoin={Object.values(GetCoins).find(
                  (coin) => coin.symbol === member.currency
                )}
                defaultValue={+member.amount}
                defaultFiat={member.fiat ?? undefined}
                onChange={(val, coin, fiatMoney) => {
                  setAmount(val);
                  setCoin("amount" in coin ? coin.coin : coin);
                  setFiatMoney(fiatMoney ?? null);
                }}
              />
            </div>
            {secondActive ? (
              <div className={`col-span-2 relative ${choosingBudget ? 'z-[0]' : ''}`}>
                <PriceInputField
                  isMaxActive={true}
                  coins={GetCoins}
                  defaultCoin={Object.values(GetCoins).find(
                    (coin) => coin.symbol === member.secondCurrency
                  )}
                  defaultValue={
                    member.secondAmount ? +member.secondAmount : undefined
                  }
                  defaultFiat={member.fiatSecond ?? undefined}
                  onChange={(val, coin, fiatMoney) => {
                    setAmountSecond(val);
                    setCoinSecond("amount" in coin ? coin.coin : coin);
                    setFiatMoneySecond(fiatMoney ?? null);
                  }}
                />
                <div
                  className="absolute -right-6 top-5 cursor-pointer"
                  onClick={() => {
                    setSecondActive(false),
                      setCoinSecond(undefined),
                      setAmountSecond(undefined);
                  }}
                >
                  <IoMdRemoveCircle color="red" />
                </div>
              </div>
            ) : (
              <div
                className="text-primary cursor-pointer flex items-center gap-2 !mt-5"
                onClick={() => setSecondActive(true)}
              >
                {" "}
                <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">
                  +
                </span>
                Add
              </div>
            )}
            <div className="grid grid-cols-[30%,70%]">
              <Dropdown
                list={Blockchains}
                selected={selectedBlockchain}
                setSelect={setSelectedBlockchain}
                className='bg-light dark:bg-darkSecond'
                label="Network"
              />
              <TextField value={address} onChange={(e) => setAddress(e.target.value)} required label="Wallet Address" className="bg-white dark:bg-darkSecond z-[0]" variant="outlined" />
            </div>
            <div className="flex gap-x-10">
              <div className="flex flex-col space-y-1 w-full">
                <Dropdown
                  label="Payment Type"
                  className="z-[0] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                  list={paymentType}
                  selected={selectedPaymentType}
                  sx={{
                    ".MuiSelect-select": {
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      maxHeight: "52px",
                    },
                  }}
                  setSelect={setPaymentType}
                />
              </div>
              <div className="flex flex-col space-y-1 w-full">
                <Dropdown
                  label="Payment Frequency"
                  setSelect={setSelectedFrequency}
                  selected={selectedFrequency}
                  list={Frequency}
                  sx={{
                    ".MuiSelect-select": {
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      maxHeight: "52px",
                    },
                  }}
                  className="z-[0] border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-x-10">
              <div className="flex flex-col space-y-1 w-full z-[0]">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack
                    spacing={3}
                    className={` bg-white dark:bg-darkSecond text-sm !rounded-md`}
                  >
                    <DesktopDatePicker
                      label="Payment Start Date"
                      inputFormat="MM/dd/yyyy"
                      disablePast
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue!)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                </LocalizationProvider>
              </div>
              <div className="flex flex-col space-y-1 w-full z-[0]">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack
                    spacing={3}
                    className={` bg-white dark:bg-darkSecond text-sm !rounded-md`}
                  >
                    <DesktopDatePicker
                      label="Payment End Date"
                      inputFormat="MM/dd/yyyy"
                      disablePast
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue!)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Stack>
                </LocalizationProvider>
              </div>
            </div>
            <div className="justify-center">
              <Button
                className="px-8 py-3 w-full"
                onClick={() => {
                  if (!(member.execution === selectedPaymentType.name)) {
                    if (selectedPaymentType.name === "Auto" && (new Date(startDate).getTime() !== member.paymantDate || new Date(endDate!).getTime() !== member.paymantEndDate)) {
                      setChoosingBudget(true)
                    } else if ((member.execution === "Auto" && selectedPaymentType.name == "Manual") || (member.execution === "Manual" && selectedPaymentType.name === "Auto")) {
                      setChoosingBudget(true)
                    }
                  } else {
                    submit()
                  }
                }}
                isLoading={loading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal onDisable={setChoosingBudget} openNotify={choosingBudget}>
        <ChooseBudget submit={submit} />
      </Modal>
    </>
  );
};

export default EditMember;
