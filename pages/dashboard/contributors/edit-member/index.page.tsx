import {  useState } from "react";
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
import { AltCoins  } from "types";
import { useWalletKit } from "hooks";
import { Stack, TextField } from "@mui/material";
import {
  SelectContributors,
  SelectID,
  SelectSelectedAccountAndBudget,
  updateMemberFromContributor,
} from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import EditableAvatar from "components/general/EditableAvatar";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Image } from "firebaseConfig";

const EditMember = () => {
    const navigate = useRouter();
    const { id, teamId } = navigate.query as { id: string; teamId: string };
    const { GetCoins, blockchain } = useWalletKit();
    const dispatch = useAppDispatch();
    const { editMember, isLoading } = useContributors();


    //Selectors   
    const teams = useAppSelector(SelectContributors);
    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const userId = useAppSelector(SelectID)
  
  
    //RenderVariables
    const team: IContributor = teams.find((c) => c.id === teamId)!;
    const member: IMember = team?.members.find((m) => m.id === id)!;
    const schedule: DropDownItem[] = [
      { name: "Full Time" },
      { name: "Part Time" },
      { name: "Bounty" },
    ];
    const paymentBase: DropDownItem[] = [
      { name: "Pay with Token Amounts" },
      { name: "Pay with USD-based Amounts" },
    ];  

    const coin1 = Object.values(GetCoins).find((coin) => coin.symbol === member.currency);
    const coin2 = Object.values(GetCoins).find((coin) => coin.symbol === member.secondaryCurrency);
  
    // console.log(member)


    //States
    const [url, setUrl] = useState<string>(member.image?.imageUrl ?? "");
    const [type, setType] = useState<"image" | "nft">(member.image?.type ?? "image") 
    const [first, setFirst] = useState<string>(member.first);
    const [last, setLast] = useState<string>(member.last);
    const [selectedTeam, setSelectedTeam] = useState<DropDownItem>({
      name: team.name,
      id: team.id,
    });
    const [selectedSchedule, setSchedule] = useState<DropDownItem>(schedule.find((s) => s.name === member.compensation) ?? schedule[0]);
    const [selectedPaymentBase, setSelectedPaymentBase] = useState(member.usdBase ? paymentBase[1] : paymentBase[0]);
    const [role, setRole] = useState<string>(member.role);
    const [selectedCoin1, setSelectedCoin1] = useState<AltCoins>(coin1 ?? Object.values(GetCoins)[0]);
    const [amount1, setAmount1] = useState<number>(Number(member.amount) ?? 0);
    const [selectedCoin2, setSelectedCoin2] = useState<AltCoins>(coin2 ?? Object.values(GetCoins)[0]);
    const [amount2, setAmount2] = useState<number>(Number(member.secondaryAmount) ?? 0);
    const [address, setAddress] = useState<string>(member.address);
    
    const [secondActive, setSecondActive] = useState(member.secondaryAmount ? true : false);
    const [startDate, setStartDate] = useState<Date>(new Date(member.paymantDate)); 
    const [endDate, setEndDate] = useState<Date>(new Date(member.paymantEndDate));
    const [loading, setLoading] = useState<boolean>(false);
    
    
    //Variables
    const paymentBaseIsToken = selectedPaymentBase.name !== "Pay with Token Amounts";
    
    const paymentType: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];
    
    const [selectedPaymentType, setPaymentType] = useState(
      member?.execution === ExecutionType.auto ? paymentType[1] : paymentType[0]
    );
      
    const Frequency = [
        { name: "Monthly", type: DateInterval.monthly },
        { name: "Weekly", type: DateInterval.weekly },
    ]
    
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>(member.interval === DateInterval.monthly ? Frequency[0] : Frequency[1]);

  const submit = async () => {
    const Team = selectedTeam;
    const Compensation = selectedSchedule.name;
    const Photo : Image = {
        imageUrl: url,
        nftUrl: url.toString(),
        type: type,
        tokenId: null,
        blockchain: blockchain.name
    }

    const dateNow = new Date().getTime()

    setLoading(true)

    try {
      let newMember: IMember = {
        taskId: member.taskId,
        id: id,
        image:  url ? Photo : null ,
        first,
        name: `${first} ${last}`,
        last,
        role,
        address,
        compensation: Compensation,
        amount: amount1.toString(),
        currency: selectedCoin1.symbol,
        teamId:  Team.id?.toString() ?? "",
        usdBase: paymentBaseIsToken,
        interval: selectedFrequency.type as DateInterval,
        execution:
          selectedPaymentType.name === "Auto" ? ExecutionType.auto : ExecutionType.manual,
        paymantDate: new Date(startDate ?? dateNow).getTime(),
        paymantEndDate: new Date(endDate ?? dateNow).getTime(),
        secondaryAmount: amount2 && secondActive ? amount2.toString() : null,
        secondaryCurrency: selectedCoin2?.symbol ? selectedCoin2.symbol : null,
      };

      console.log(newMember)
      //   Task Id meselesi hell ele
      await editMember(teamId, id, newMember);
      dispatch(
        updateMemberFromContributor({
          id: teamId,
          member: newMember,
        })
      );

      setLoading(false);
      navigate.back();
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  const onChange = (url: string, type: "image" | "nft") => {
    setType(type)
    setUrl(url)
  }

  return <>
        <div className="relative w-full mx-auto">
            <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-semibold transition-all text-primary hover:transition-all flex items-center text-xl gap-2">
                <span className="text-3xl pb-1">&#171;</span> Back
            </button>
            <div>
                <div
                    className="flex flex-col space-y-8 w-[40%] mx-auto pb-4">
                    <div className="text-2xl self-center pt-2 font-semibold ">Add Contributor</div>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col mb-4 space-y-1 w-full">
                            <EditableAvatar  avatarUrl={member.image ? url : null } name={accountAndBudget.account?.address ?? ""} userId={userId ?? ""}  evm={blockchain.name !== "solana"} blockchain={blockchain} onChange={onChange}  />
                        </div>
                        <div className="grid grid-cols-2 gap-x-10">
                            <TextField label="Name" value={first} onChange={(e) =>  setFirst(e.target.value)} className="bg-white dark:bg-darkSecond" variant="outlined" />
                            <TextField label="Surname" value={last} onChange={(e) => setLast(e.target.value)} defaultValue={member.last} className="bg-white dark:bg-darkSecond" variant="outlined" />
                        </div>  
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <Dropdown
                            label="Workstream"
                            setSelect={setSelectedTeam}
                            selected={selectedTeam}
                            list={teams}
                            className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                            sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                        />

                        <Dropdown
                            label="Compensation Type"
                            className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                            list={schedule}
                            selected={selectedSchedule}
                            setSelect={setSchedule}
                            sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <Dropdown
                            label="Amount Type"
                            className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                            parentClass={' w-full rounded-md h-[3.15rem] '}
                            selectClass={'!text-sm'}
                            sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                            list={paymentBase}
                            selected={selectedPaymentBase}
                            setSelect={setSelectedPaymentBase}
                        />
                        <TextField label="Role"  value={role} onChange={(e) => setRole(e.target.value)} className="bg-white dark:bg-darkSecond" variant="outlined" />
                    </div>
                    <div className="flex w-full gap-x-10">
                        <div className="w-full h-full flex flex-col ">
                            <Dropdown
                                label="Token"
                                className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                                sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                                selected={selectedCoin1}
                                setSelect={val => {
                                    setSelectedCoin1(val)
                                }}
                                list={Object.values(GetCoins)}
                            />
                        </div>
                        <div className="w-full h-full flex flex-col relative">

                        {selectedPaymentBase.name === "Pay with USD-based" && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white absolute top-4 right-10 z-[999] ">USD as</span>}
                            <TextField label="Amount"  value={amount1} onChange={(e) => setAmount1(Number(e.target.value))} type="number" inputProps={{step: "0.01"}}  className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white " required variant="outlined" />
                        </div>
                    </div>
                    {secondActive ?
                        <div className="flex w-full gap-x-10">
                            <div className="w-full h-full flex flex-col ">
                                <Dropdown
                                    label="Token"
                                    className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                                    selected={selectedCoin2}
                                    sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                                    setSelect={val => {
                                        setSelectedCoin2(val)
                                    }}
                                    list={Object.values(GetCoins)}
                                />
                            </div>
                            <div className="w-full h-full flex flex-col relative">
                                <div className="flex items-center">
                                    <div className="absolute -right-[2rem] top-[0.8rem]">
                                        <DeleteOutlinedIcon className="hover:text-gray-600 cursor-pointer w-5 h-5" onClick={() => {
                                            setSecondActive(false)
                                        }} />
                                    </div>
                                </div>
                                {selectedPaymentBase.name === "Pay with USD-based" && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white absolute top-4 right-10 z-[999] ">USD as</span>}
                                <TextField type={'number'} label="Amount" value={amount2} onChange={(e) => setAmount2(Number(e.target.value))} defaultValue={member.secondaryAmount} inputProps={{step: 0.02}} className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white " required variant="outlined" />
                            </div>
                        </div> : <div className="text-primary cursor-pointer flex items-center gap-2 !mt-5" onClick={() => setSecondActive(true)}> <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token</div>}
                    <div className="flex flex-col space-y-1">
                        <TextField value={address} onChange={(e) => setAddress(e.target.value)} label="Wallet Address" defaultValue={member.address} className="bg-white dark:bg-darkSecond" variant="outlined" />
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <Dropdown
                                label="Payment Type"
                                className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md"
                                list={paymentType}
                                selected={selectedPaymentType}
                                sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                                setSelect={setPaymentType} />
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <Dropdown
                                label="Payment Frequency"
                                setSelect={setSelectedFrequency}
                                selected={selectedFrequency}
                                list={Frequency}
                                sx={{ '.MuiSelect-select': { paddingTop: '6px', paddingBottom: '6px', maxHeight: '52px' } }}
                                className=" border dark:border-white bg-white dark:bg-darkSecond text-sm !rounded-md" />
                        </div>
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Stack spacing={3} className={` bg-white dark:bg-darkSecond text-sm !rounded-md`}>
                                    <DesktopDatePicker
                                        label="Payment Start Date"
                                        inputFormat="MM/dd/yyyy"
                                        value={startDate}
                                        onChange={(newValue) =>  setStartDate(newValue!)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </Stack>
                            </LocalizationProvider>
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <LocalizationProvider dateAdapter={AdapterDateFns} >
                                <Stack spacing={3} className={` bg-white dark:bg-darkSecond text-sm !rounded-md`}>
                                    <DesktopDatePicker
                                        label="Payment End Date"

                                        inputFormat="MM/dd/yyyy"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue!)}

                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </Stack>
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 justify-center">
                        <Button version="second" className="px-8 py-3" onClick={() => navigate.back()}>
                            Close
                        </Button>
                        <Button className="px-8 py-3" onClick={() => submit()} isLoading={loading} >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default EditMember;
