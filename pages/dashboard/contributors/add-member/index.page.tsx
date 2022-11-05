import React, { useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "types/dashboard/contributors";
import { SelectContributors, SelectID, addMemberToContributor } from "redux/slices/account/remoxData";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from "uuid";
import { AltCoins, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Stack, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import EditableAvatar from "components/general/EditableAvatar";
import PriceInputField from "components/general/PriceInputField";
import { FiatMoneyList } from "firebaseConfig";
import { IoMdRemoveCircle } from "react-icons/io";
import { GetTime } from "utils";
import { ToastRun } from "utils/toast";
import Modal from "components/general/modal";
import ChooseBudget from "components/general/chooseBudget";
import { IAccountORM } from "pages/api/account/index.api";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { DateTimePicker } from "@mui/x-date-pickers";


const AddMember = () => {
    const navigate = useRouter()
    const {compensationIndex } = useRouter().query as { compensationIndex:  string}
    const [url, setUrl] = useState<string>("");
    const [type, setType] = useState<"image" | "nft">("image")
    const { addMember } = useContributors();
    const contributors = useAppSelector(SelectContributors);
    const userId = useAppSelector(SelectID);
    const dispatch = useAppDispatch();
    const schedule: DropDownItem[] = [
        { name: "Full Time" },
        { name: "Part Time" },
        { name: "Bounty" },
    ];
    console.log(compensationIndex)
    const [selectedSchedule, setSelectedSchedule] = useState(compensationIndex ?  +compensationIndex === 0 ? schedule[0] : schedule[+compensationIndex-1] : schedule[0]);
    const paymentType: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];
    const [selectedPaymentType, setPaymentType] = useState(paymentType[0]);
    const isAutoPayment = selectedPaymentType.name === "Auto";
    const { GetCoins, blockchain, SendTransaction } = useWalletKit();
    const [secondActive, setSecondActive] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<DropDownItem>(
        contributors.length > 0
        ? { name: "Select Team", coinUrl: CoinsURL.None }
        : { name: "No Team", coinUrl: CoinsURL.None }
        );
        
    const [amount, setAmount] = useState<number | null>()
    const [coin, setCoin] = useState<AltCoins>()
    const [fiatMoney, setFiatMoney] = useState<FiatMoneyList | null>()

    const [amountSecond, setAmountSecond] = useState<number | null>()
    const [coinSecond, setCoinSecond] = useState<AltCoins>()
    const [fiatMoneySecond, setFiatMoneySecond] = useState<FiatMoneyList | null>()
        
    const [fullname, setFullname] = useState<string>("")
    const [role, setRole] = useState<string>("")
    const [address, setAddress] = useState<string>("")
        
    const teams = contributors.map(w => { return { name: w.name, id: w.id } })
    const Frequency = [{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({
        name: "Monthly",
        type: DateInterval.monthly,
    });
    const [loading, setIsLoading] = useState(false);
    const [choosingBudget, setChoosingBudget] = useState<boolean>(false)

    const submit = async (account?: IAccountORM | undefined, budget?: IBudgetORM | null, subbudget?: ISubbudgetORM | null) => {
        const Team = selectedTeam;
        const Compensation = selectedSchedule.name;
        const Amount = amount
        const Amount2 = amountSecond
        const Coin1 = coin;
        const Coin2 = coinSecond;
        const Frequency = selectedFrequency.type;
        const Photo = {
            imageUrl: url,
            nftUrl: url,
            type: type,
            tokenId: null,
            blockchain: blockchain.name
        }

        const dateNow = new Date()
        
        try {
            if(Team.id) {
                let taskId: string | null = null
                let inputs: IPaymentInput[] = []
                if (isAutoPayment && startDate && endDate) {
                    inputs.push({
                        amount: Amount ?? 1,
                        coin: Coin1?.symbol ?? Object.values(GetCoins)[0].symbol ,
                        recipient: address,
                    })
                    if (Amount2 && Coin2) {
                        inputs.push({
                            amount: Amount2,
                            coin: Coin2.symbol,
                            recipient: address,
                        })
                    }
    
                    const id = await SendTransaction(account!, inputs, {
                        createStreaming: true,
                        startTime: GetTime(startDate),
                        endTime: GetTime(endDate),
                        budget: budget,
                        subbudget: subbudget
                    })
    
                    taskId = id!
                }
                setIsLoading(true)
    
                let member: IMember = {
                    id: uuidv4(),
                    fullname: fullname.trim(),
                    teamId: Team.id!.toString(),
                    compensation: Compensation,
                    role: role.trim(),
                    amount: (amount ?? 1).toString() ,
                    currency: Coin1?.symbol ?? "",
                    fiat: fiatMoney ?? null,
                    secondAmount: amountSecond ? amountSecond.toString() : null,
                    secondCurrency: Coin2 ? (Coin2.symbol) : null,
                    fiatSecond: fiatMoneySecond ?? null,
                    address: address.trim(),
                    execution: isAutoPayment ? ExecutionType.auto : ExecutionType.manual,
                    interval: Frequency as DateInterval,
                    paymantDate: GetTime(startDate ?? dateNow),
                    paymantEndDate: endDate ? GetTime(endDate) : null,
                    lastCheckedDate: null,
                    checkedCount: 0,
                    image: url ? Photo : null,
                    taskId: isAutoPayment ? taskId : null,
                };
    
                await addMember(Team.id!.toString(), member);
                dispatch(addMemberToContributor({ id: Team.id!.toString(), member: member }));
                setIsLoading(false);
                setChoosingBudget(false)
                navigate.back();
            } else {
                ToastRun(<>Please choose a team</>, "warning")
                return
            }
        } catch (error: any) {
            setIsLoading(false)
            console.error(error);
        }
    };

    const onChange = (url: string, type: "image" | "nft") => {
        setUrl(url);
        setType(type);
    }


    return <>
        <div className="relative w-full mx-auto">
            <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-semibold transition-all text-primary hover:transition-all flex items-center text-xl gap-2">
                <span className="text-3xl pb-1">&#171;</span> Back
            </button>
            <div>
                <div
                    className="flex flex-col space-y-8 w-[40%] mx-auto pb-4">
                    <div className="text-2xl self-center pt-2 font-semibold ">Add Member</div>
                    <div className="flex justify-center mb-4 w-full">
                        <EditableAvatar avatarUrl={null} name={"snsabf021"} userId={userId ?? ""} evm={blockchain.name !== "solana"} blockchain={blockchain} onChange={onChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <TextField label="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} required className="bg-white dark:bg-darkSecond z-[0]" variant="outlined" />
                        <Dropdown
                            label="Workstream"
                            setSelect={setSelectedTeam}
                            selected={selectedTeam}
                            list={teams}
                            className="border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]"
                            sx={{ '.MuiSelect-select': { paddingTop: '8px', paddingBottom: '8px', maxHeight: '52px' } }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <Dropdown
                            label="Compensation Type"
                            className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]"
                            list={schedule}
                            selected={selectedSchedule}
                            setSelect={setSelectedSchedule}
                            sx={{ '.MuiSelect-select': { paddingTop: '8px', paddingBottom: '8px', maxHeight: '55px' } }}
                        />
                        <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} required  className="bg-white dark:bg-darkSecond z-[0]" variant="outlined" />
                    </div>
                    <div className={`flex w-full gap-x-10 ${choosingBudget ? "z-[0]" : ""}`}>
                        <PriceInputField 
                          isMaxActive={true}
                          coins={GetCoins} 
                          onChange={(val, coin, fiatMoney) => {
                            setAmount(val)
                            setCoin('amount' in coin ? coin.coin : coin)
                            setFiatMoney(fiatMoney ?? null)
                          }}
                        />
                    </div>
                    {secondActive ? 
                        <div className={`col-span-2 relative ${choosingBudget ? "z-[0]" : ""}`}>
                            <PriceInputField 
                              isMaxActive={true}
                              coins={GetCoins} 
                              onChange={(val, coin, fiatMoney) => {
                                setAmountSecond(val)
                                setCoinSecond('amount' in coin ? coin.coin : coin)
                                setFiatMoneySecond(fiatMoney ?? null)
                              }}
                            />
                        <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                          setSecondActive(false),
                          setCoinSecond(undefined),
                          setAmountSecond(undefined)
                        }}>
                          <IoMdRemoveCircle color="red" />
                        </div>
                      </div> : <div className="text-primary cursor-pointer flex items-center gap-2 !mt-5" onClick={() => setSecondActive(true)}> <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span>Add</div>}
                    <div className="flex flex-col space-y-1">
                        <TextField value={address} onChange={(e) => setAddress(e.target.value)} required label="Wallet Address" className="bg-white dark:bg-darkSecond z-[0]" variant="outlined" />
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <Dropdown
                                label="Payment Type"
                                className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]"
                                list={paymentType}
                                selected={selectedPaymentType}
                                sx={{ '.MuiSelect-select': { paddingTop: '8px', paddingBottom: '8px', maxHeight: '52px' } }}
                                setSelect={setPaymentType} />
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <Dropdown
                                label="Payment Frequency"
                                setSelect={setSelectedFrequency}
                                selected={selectedFrequency}
                                list={Frequency}
                                sx={{ '.MuiSelect-select': { paddingTop: '8px', paddingBottom: '8px', maxHeight: '52px' } }}
                                className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]" />
                        </div>
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Stack spacing={3} className={` bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]`}>
                                    {/* <DateTimePicker
                                      renderInput={(props) => <TextField {...props} />}
                                    //   disablePast={true}
                                      label="Payment Start Date"
                                      value={startDate}
                                      onChange={(newValue) => {
                                        setStartDate(newValue);
                                      }}
                                    /> */}
                                    <DesktopDatePicker
                                        label="Payment Start Date"
                                        disablePast
                                        inputFormat="MM/dd/yyyy"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </Stack>
                            </LocalizationProvider>
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <LocalizationProvider dateAdapter={AdapterDateFns} >
                                <Stack spacing={3} className={` bg-white dark:bg-darkSecond text-sm !rounded-md z-[0]`}>
                                    <DesktopDatePicker
                                        disablePast
                                        label="Payment End Date"
                                        inputFormat="MM/dd/yyyy"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                    {/* <DateTimePicker
                                        disablePast
                                        renderInput={(props) => <TextField {...props} />}
                                        label="Payment End Date"
                                        value={endDate}
                                        onChange={(newValue) => {
                                        setEndDate(newValue);
                                      }}
                                    /> */}
                                </Stack>
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className="justify-center">
                        <Button className="px-8 py-3 w-full" onClick={() => {
                            isAutoPayment ? setChoosingBudget(true) : submit()
                        }} isLoading={loading} >
                            Add Contributor
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <Modal onDisable={setChoosingBudget} openNotify={choosingBudget} >
            <ChooseBudget submit={submit}/>
        </Modal>
    </>
};


export default AddMember;