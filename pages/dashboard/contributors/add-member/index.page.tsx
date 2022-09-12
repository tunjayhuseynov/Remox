import React, { useEffect, useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "types/dashboard/contributors";
import { SelectContributors, SelectSelectedAccountAndBudget } from "redux/slices/account/remoxData";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from "uuid";
import { AltCoins, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import { UploadNFTorImageForUser } from "hooks/singingProcess/utils";
import { addMemberToContributor } from "redux/slices/account/remoxData";
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Stack, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Task } from "hooks/walletSDK/useWalletKit";
import { GetTime } from "utils";
import { IPaymentInput } from "pages/api/payments/send/index.api";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    surname: string;
    address: string;
    amount: number;
    amount2?: number;
    role: string;
}

export default () => {
    const navigate = useRouter()
    const { register, handleSubmit } = useForm<IFormInput>();
    const { addMember, isLoading } = useContributors();
    const contributors = useAppSelector(SelectContributors);
    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const dispatch = useAppDispatch();
    const schedule: DropDownItem[] = [
        { name: "Full Time" },
        { name: "Part Time" },
        { name: "Bounty" },
    ];
    const imageType: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }];
    const [selectedImageType, setSelectedImageType] = useState(imageType[0]);
    const [selectedSchedule, setSelectedSchedule] = useState(schedule[0]);
    const paymentBase: DropDownItem[] = [
        { name: "Pay with Token Amounts" },
        { name: "Pay with USD-based Amounts" },
    ];
    const [selectedPaymentBase, setSelectedPaymentBase] = useState(paymentBase[0]);
    const paymentBaseIsToken = selectedPaymentBase.name === "Pay with Token Amounts";
    const paymentType: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];
    const [selectedPaymentType, setPaymentType] = useState(paymentType[0]);
    const isAutoPayment = selectedPaymentType.name === "Auto";
    const { GetCoins, blockchain } = useWalletKit();
    const [file, setFile] = useState<File>();
    const [secondActive, setSecondActive] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [selectedCoin1, setSelectedCoin1] = useState<AltCoins>(Object.values(GetCoins)[0])
    const [selectedCoin2, setSelectedCoin2] = useState<AltCoins>(Object.values(GetCoins)[0])
    const [selectedTeam, setSelectedTeam] = useState<DropDownItem>(
        contributors.length > 0
        ? { name: "Select Team", coinUrl: CoinsURL.None }
        : { name: "No Team", coinUrl: CoinsURL.None }
        );
        const teams = contributors.map(w => { return { name: w.name, id: w.id } })
    const Frequency = [{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({
        name: "Monthly",
        type: DateInterval.monthly,
    });
    const userIsUpload = selectedImageType.name === "Upload Photo";
    

    const submit: SubmitHandler<IFormInput> = async (data) => {
        const Photo = file;
        const Team = selectedTeam;
        const Compensation = selectedSchedule.name;
        const Coin1 = selectedCoin1;
        const Coin2 = selectedCoin2;
        const Frequency = selectedFrequency.type;
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

            let taskId : string | null =  null
            let inputs: IPaymentInput[] = []
            if(isAutoPayment){ 
                const startDate = new Date(dateStart!).getTime()
                const interval = Frequency as DateInterval

                console.log(startDate)
                const task : Task = {
                    interval: interval,
                    startDate: startDate,
                }

                
            }

            let member: IMember = {
                taskId: null,
                id: uuidv4(),
                first: `${data.name}`,
                name: `${data.name} ${data.surname}`,
                last: `${data.surname}`,
                role: `${data.role}`,
                address: data.address,
                image: image ? image.image : null,
                compensation: Compensation,
                currency: Coin1.name,
                amount: data.amount.toString(),
                teamId: Team.id!.toString(),
                usdBase: !paymentBaseIsToken,
                execution: isAutoPayment ? ExecutionType.auto : ExecutionType.manual,
                interval: Frequency as DateInterval,
                paymantDate: GetTime(dateStart!) ,
                paymantEndDate: GetTime(dateEnd!),
                secondaryAmount: data.amount2 ? data.amount2.toString() : null,
                secondaryCurrency: Coin2?.name ? (Coin2.name) : null,
                secondaryUsdBase: data.amount2 ? !paymentBaseIsToken : null,
            };

            console.log(member)
            // await addMember(Team.id!.toString(), sent);
            // dispatch(addMemberToContributor({ id: Team.id!.toString(), member: sent }));

            // navigate.back()
        } catch (error: any) {
            console.error(error);
        }
    };


    return <>
        <div className="relative w-full mx-auto">
            <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-semibold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
                {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                <span className="text-3xl pb-1">&#171;</span> Back
            </button>
            <div>
                <form onSubmit={handleSubmit(submit)} 
                    className="flex flex-col space-y-8 w-[40%] mx-auto pb-4">
                    <div className="text-2xl self-center pt-2 font-semibold ">Add Contributor</div>
                    <div className="flex flex-col space-y-4">
                        {<div className="flex flex-col mb-4 space-y-1 w-full">
                            {!userIsUpload ? <input type="text"  {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.15rem]  w-full px-1" />
                                :
                                <Upload  setFile={setFile} />}

                        </div>}
                        <div className="grid grid-cols-2 gap-x-10">
                            <TextField label="Name" {...register("name", { required: true })} className="bg-white dark:bg-darkSecond" variant="outlined" />
                            <TextField label="Surname" {...register("surname", { required: true })} className="bg-white dark:bg-darkSecond" variant="outlined" />
                        </div>  
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <Dropdown
                            label="Team"
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
                            setSelect={setSelectedSchedule}
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
                        <TextField label="Role" {...register("role", { required: true })} className="bg-white dark:bg-darkSecond" variant="outlined" />
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
                            <TextField label="Amount" {...register("amount", { required: true, valueAsNumber: true })} type="number" inputProps={{step: "0.01"}}  className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white " required variant="outlined" />
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
                                <TextField type={'number'} label="Amount" {...register("amount2", { required: true, valueAsNumber: true })} className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white " required variant="outlined" />
                            </div>
                        </div> : <div className="text-primary cursor-pointer flex items-center gap-2 !mt-5" onClick={() => setSecondActive(true)}> <span className="w-5 h-5 border rounded-full border-primary  text-primary  flex items-center justify-center">+</span> Add another token</div>}
                    <div className="flex flex-col space-y-1">
                        <TextField {...register("address", {required: true})} label="Wallet Address" className="bg-white dark:bg-darkSecond" variant="outlined" />
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
                                        onChange={(newValue) =>  setStartDate(newValue)}

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
                                        onChange={(newValue) => setEndDate(newValue)}

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
                        <Button className="px-8 py-3" type="submit" >
                            Add Contributor
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </>
};
