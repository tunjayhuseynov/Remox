import { forwardRef, useEffect, useState } from "react";
import { TransactionStatus } from "types";
import { ERCMethodIds, IAutomationBatchRequest, IAutomationCancel, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess";
import { CSVLink } from "react-csv";
import _ from "lodash";
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration } from "utils";
import { useModalSideExit, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccounts, SelectAllBudgets, SelectAlldRecurringTasks, SelectCumlativeTxs as SelectCumulativeTxs, SelectCurrencies, SelectDarkMode, SelectTags } from "redux/slices/account/remoxData";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import useAsyncEffect from "hooks/useAsyncEffect";
import SingleTransactionItem from "./_components/SingleTransactionItem";
import MultisigTx from "./_components/MultisigTransactionItem";
import { Checkbox, ClickAwayListener, Input, TablePagination } from "@mui/material";
import { IAccountORM } from "pages/api/account/index.api";
import { Blockchains, BlockchainType } from "types/blockchains";
import { ITag } from "pages/api/tags/index.api";
import Filter from "./_components/Filter";
import { AnimatePresence, motion } from "framer-motion";
import { DecimalConverter } from "utils/api";
import { Tx_Refresh_Data_Thunk } from "redux/slices/account/thunks/refresh/txRefresh";
import useLoading from "hooks/useLoading";
import Loader from "components/Loader";
import DateTime from 'date-and-time'
import dateFormat from "dateformat";
import { IAutomationTransfer } from 'hooks/useTransactionProcess'
import AnimatedTabBar from "components/animatedTabBar";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { MdKeyboardArrowDown } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';


const Transactions = () => {
    const STABLE_INDEX = 6;
    const accountsRaw = useAppSelector(SelectAccounts)
    const tags = useAppSelector(SelectTags)
    const accounts = accountsRaw.map((a) => a.address)
    const Txs = useAppSelector(SelectCumulativeTxs)
    const streamings = useAppSelector(SelectAlldRecurringTasks)
    const navigate = useRouter()
    const coins = useAppSelector(SelectCurrencies)

    const dark = useAppSelector(SelectDarkMode)


    const index = navigate.query?.index as string | undefined;
    const name = navigate.query?.name as string | undefined;
    const pending = navigate.query?.pending as string | undefined;

    const dispatch = useAppDispatch()
    const { Address } = useWalletKit()
    const darkMode = useSelector(SelectDarkMode)


    const budgets = useAppSelector(SelectAllBudgets)
    const accountsAll = useAppSelector(SelectAccounts)

    const [isDateFilterOpen, setDateFilterOpen] = useState(false)
    const [isLabelFilterOpen, setLabelFilterOpen] = useState(false)
    const [isBudgetFilterOpen, setBudgetFilterOpen] = useState(false)
    const [isChainFilterOpen, setChainFilterOpen] = useState(false)
    const [isWalletFilterOpen, setWalletFilterOpen] = useState(false)

    const [pagination, setPagination] = useState(STABLE_INDEX)

    const [address, setAddress] = useState<string>()

    useAsyncEffect(async () => {
        const val = await Address
        if (val) setAddress(val)
    }, [Address])

    // const list = useAppSelector(SelectTransactions)

    const [datePicker, setDate] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
    const [selectedChains, setSelectedChains] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<string>("Any");

    const [specificAmount, setSpecificAmount] = useState<number>();
    const [minAmount, setMinAmount] = useState<number>();
    const [maxAmount, setMaxAmount] = useState<number>();

    useEffect(() => {
        setPagination(index ? +index + (STABLE_INDEX - (+index % STABLE_INDEX)) : STABLE_INDEX)
    }, [datePicker, selectedTags, selectedBudgets, selectedAccounts, selectedDirection, specificAmount, minAmount, maxAmount])

    const refreshFn = async () => {
        setDate([])
        setSelectedTags([])
        setSelectedBudgets([])
        setSelectedAccounts([])
        setSelectedDirection("Any")
        setSpecificAmount(undefined)
        setMinAmount(undefined)
        setMaxAmount(undefined)
        await dispatch(Tx_Refresh_Data_Thunk())
    }

    const [refreshLoading, refresh] = useLoading(refreshFn)


    const filterFn = (c: (IFormattedTransaction | ITransactionMultisig)) => {
        const date = datePicker

        if ('tx' in c) {
            const tx = c.tx
            let amount = tx?.amount && tx?.coin ? DecimalConverter(tx.amount, tx.coin.decimals).toFixed(0).length < 18 ? DecimalConverter(tx.amount, tx.coin.decimals) : undefined : undefined
            if (tx.method === ERCMethodIds.swap) {
                const swap = tx as ISwap
                amount = swap?.amountIn && swap?.coinIn ? DecimalConverter(swap.amountIn, swap.coinIn.decimals) : undefined
            }

            if (selectedDirection !== "Any") {
                if (selectedDirection === "In") return false
                if (selectedDirection === "Out") return true
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.find(s => s.toLowerCase() === c.contractAddress.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false
            if (selectedChains.length > 0 && !selectedChains.some((b) => b === c.blockchain)) return false

            if (specificAmount && (+(amount ?? 0)) !== specificAmount) return false
            if (minAmount && (+(amount ?? tx?.payments?.reduce((a, c) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? 0)) < minAmount) return false
            if (maxAmount && (+(amount ?? tx?.payments?.reduce((a, c) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? Number.MAX_VALUE)) > maxAmount) return false

            if ((!name) && (c.isExecuted === true || c.rejection?.isExecuted === true)) return false
            if ((name) && ((c.rejection?.isExecuted ?? false) === false && c.isExecuted === false)) return false
        } else {
            // console.log(selectedAccounts, c.address)
            if (!name) return false
            const tx = c as any
            let amount = tx?.amount && tx?.coin ? DecimalConverter(tx.amount, tx.coin.decimals).toFixed(0).length < 18 ? DecimalConverter(tx.amount, tx.coin.decimals) : undefined : undefined
            if (tx.method === ERCMethodIds.swap) {
                const swap = tx as ISwap
                amount = swap?.amountIn && swap?.coinIn ? DecimalConverter(swap.amountIn, swap.coinIn.decimals) : undefined
            }

            if (selectedDirection !== "Any") {
                if (selectedDirection === "In" && c.address.toLowerCase() === c.rawData.from.toLowerCase()) return false
                if (selectedDirection === "Out" && c.address.toLowerCase() !== c.rawData.from.toLowerCase()) return false
            }

            if (selectedTags.length > 0 && !c.tags.some(s => selectedTags.includes(s.id))) return false

            if (selectedAccounts.length > 0 && !selectedAccounts.find(s => s.toLowerCase() === c.address.toLowerCase())) return false

            if (selectedBudgets.length > 0 && !selectedBudgets.some((b) => b === c.budget?.id)) return false
            if (selectedChains.length > 0 && !selectedChains.some((b) => b === c.blockchain)) return false
            
            if (specificAmount && (amount ?? 0) !== specificAmount) return false
            if (minAmount && +(amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? 0) < minAmount) return false
            if (maxAmount && +(amount ?? tx?.payments?.reduce((a: number, c: ITransfer) => a += DecimalConverter(c.amount, c.coin.decimals), 0) ?? Number.MAX_VALUE) > maxAmount) return false
        }

        if (date && date.length === 1) {
            const crr = new Date(c.timestamp * 1e3)
            const dateOne = new Date(date[0])
            const prev = new Date(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate())
            const next = new Date(DateTime.addDays(dateOne, -1).getFullYear(), DateTime.addDays(dateOne, -1).getMonth(), DateTime.addDays(dateOne, -1).getDay());

            if (crr.getTime() < prev.getTime() || crr.getTime() > next.getTime()) return false
        } else if (date && date.length === 2) {
            const crr = new Date(c.timestamp * 1e3)
            const dateOne = new Date(date[0])
            const dateTwo = new Date(date[1])
            const prev = new Date(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate())
            const next = new Date(DateTime.addDays(dateTwo, 1).getFullYear(), DateTime.addDays(dateTwo, 1).getMonth(), DateTime.addDays(dateTwo, 1).getDate())

            if (crr.getTime() < prev.getTime()) return false
            if (crr.getTime() > next.getTime()) return false
        }

        return true

    }
    const tabFilterFn = (c: (IFormattedTransaction | ITransactionMultisig), type?: "signing" | "history") => {
        if ('tx' in c) {
            if (!type) {
                if ((!name) && (c.isExecuted === true || c.rejection?.isExecuted === true)) return false
                if ((name) && ((c.rejection?.isExecuted ?? false) === false && c.isExecuted === false)) return false
            } else if (type === "signing") {
                if ((c.isExecuted === true || c.rejection?.isExecuted === true)) return false
            } else if (type === "history") {
                if ((c.rejection?.isExecuted ?? false) === false && c.isExecuted === false) return false
            }
        } else {
            if (!type) {
                if (!name) return false
            } else if (type === "signing") {
                return false;
            }
        }
        return true
    }
    const txs = Txs?.filter(filterFn)
    if (!name) {
        txs.sort((a, b) => (a as any)?.nonce > (b as any)?.nonce ? 1 : -1)
    }

    const [searchLabel, setSearchLabel] = useState<string>("")
    const [searchBudget, setSearchBudget] = useState<string>("")
    const [searchChain, setSearchChain] = useState<string>("")

    const [dateLast, setDateLast] = useState<string>("")

    const lastList = [
        {
            label: "Today",
            value: "today",
            action: () => {
                setDateLast("today")
                setDate([DateTime.addDays(new Date(), -1).getTime(), Date.now()])
            }
        },
        {
            label: "Last 3 days",
            value: "3",
            action: () => {
                setDateLast("3");
                setDate([DateTime.addDays(new Date(), -3).getTime(), Date.now()])
            }
        },
        {
            label: "Last 7 days",
            value: "7",
            action: () => {
                setDateLast("7");
                setDate([DateTime.addDays(new Date(), -7).getTime(), Date.now()])
            }
        },
        {
            label: "Last 30 days",
            value: "30",
            action: () => {
                setDateLast("30");
                setDate([DateTime.addDays(new Date(), -30).getTime(), Date.now()])
            }
        },
        {
            label: "Last Quarter",
            value: "90",
            action: () => {
                setDateLast("90");
                setDate([DateTime.addDays(new Date(), -90).getTime(), Date.now()])
            }
        },
    ]


    const historyTxLn = Txs.filter((s) => tabFilterFn(s, "history")).length
    const data = [
        {
            to: "/dashboard/transactions",
            text: "Signing",
            count: Txs.filter((s) => tabFilterFn(s, "signing")).length.toString(),
        },
        {
            to: "/dashboard/transactions/history",
            text: "History",
            count: historyTxLn.toString(),
        },
    ]
    return <>
        <div>
            <div className="flex flex-col space-y-5 gap-14" >
                <div>
                    <div className="flex justify-between">
                        <div className="text-2xl font-semibold">Transactions</div>
                        <div>
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[]}
                                count={txs.length}
                                page={(pagination / STABLE_INDEX) - 1}
                                onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                rowsPerPage={STABLE_INDEX}
                            // onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center w-[32%] mb-5 !text-xl mt-4">
                        <AnimatedTabBar data={data} index={name ? 1 : 0} fontSize={"!text-xl"} />
                    </div>
                    {!!name && <div className="flex justify-between">
                        <div className="flex space-x-5 items-center">
                            <Filter isOpen={isDateFilterOpen} setOpen={setDateFilterOpen} title={
                                datePicker.length > 0 ? <div className="rounded-md py-0 px-2 font-semibold text-xs">
                                    Specific date{datePicker.length > 1 ? "s" : ""}
                                </div>
                                    : "All dates"
                            } width={8.75}>
                                <div className='text-xs pb-1 font-medium'>
                                    Custom dates
                                </div>
                                <DatePicker plugins={[<DatePanel sort="date" />]} value={datePicker} onChange={(data) => {
                                    if (Array.isArray(data)) {
                                        setDate(data.map(s => s.toDate().getTime()))
                                        setDateLast("")
                                    }
                                }} range={true} className={`${dark ? "bg-dark" : ""}`} style={
                                    {
                                        height: "1.9rem",
                                        fontSize: "0.75rem",
                                    }
                                } />
                                <div className="flex flex-col space-y-1 mt-2">
                                    {
                                        lastList.map((s, i) =>
                                            <div key={i} className='flex space-x-1 items-center'>
                                                <Checkbox
                                                    icon={<RadioButtonUncheckedIcon />}
                                                    checkedIcon={<RadioButtonCheckedIcon />}
                                                    style={{
                                                        transform: "scale(0.875)",
                                                        padding: 0
                                                    }}
                                                    classes={{ colorPrimary: "!text-primary", root: "" }} checked={dateLast === s.value} onChange={() => {
                                                        if (dateLast !== s.value) {
                                                            s.action()
                                                        } else {
                                                            setDateLast("")
                                                            setDate([])
                                                        }
                                                    }} />
                                                <span className="text-xs font-medium">{s.label}</span>
                                            </div>
                                        )
                                    }
                                </div>
                            </Filter>

                            <Filter isOpen={isLabelFilterOpen} setOpen={setLabelFilterOpen} title={selectedTags.length > 0 ?
                                <div className="rounded-md font-semibold text-xs">
                                    <div>Labels ({selectedTags.length})</div>
                                </div> : "Labels"} childWidth={10}>
                                <Input fullWidth disableUnderline sx={{
                                    fontSize: "0.875rem",
                                }} className="border px-1" placeholder="Search" onChange={(val) => setSearchLabel(val.target.value)} endAdornment={<>
                                    <AiOutlineSearch />
                                </>} />
                                <div className='flex flex-col mt-3'>
                                    {tags.filter(s => s.name.toLowerCase().includes(searchLabel.toLowerCase())).map((tag, index) => {
                                        return <div key={tag.id} className='flex space-x-1 items-center'>
                                            <Checkbox
                                                style={{
                                                    transform: "scale(0.875)",
                                                    padding: 0
                                                }}
                                                classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedTags.includes(tag.id)} onChange={() => {
                                                    if (selectedTags.includes(tag.id)) {
                                                        setSelectedTags(selectedTags.filter(s => s !== tag.id))
                                                    } else {
                                                        setSelectedTags([...selectedTags, tag.id])
                                                    }
                                                }} /> <span className="text-xs">{tag.name}</span>
                                        </div>
                                    })}
                                </div>
                            </Filter>

                            {/* <Filter isOpen={isBudgetFilterOpen} setOpen={setBudgetFilterOpen} title={selectedBudgets.length > 0 ?
                                <div className="rounded-md font-semimedium text-xs">
                                    <div>Budgets ({selectedBudgets.length})</div>
                                </div> : "Budgets"
                            } childWidth={10}>
                                <Input fullWidth disableUnderline sx={{
                                    fontSize: "0.875rem",
                                }} className="border px-1" placeholder="Search" onChange={(val) => setSearchBudget(val.target.value)} endAdornment={<>
                                    <AiOutlineSearch />
                                </>} />
                                <div className='flex flex-col mt-3'>
                                    {budgets.filter(s => s.name.toLowerCase().includes(searchBudget.toLowerCase())).map((budget) => {
                                        return <div key={budget.id} className='flex space-x-1 items-center'>
                                            <Checkbox
                                                style={{
                                                    transform: "scale(0.875)",
                                                    padding: 0
                                                }}
                                                classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedBudgets.includes(budget.id)} onChange={() => {
                                                    if (selectedBudgets.includes(budget.id)) {
                                                        setSelectedBudgets(selectedBudgets.filter(s => s !== budget.id))
                                                    } else {
                                                        setSelectedBudgets([...selectedBudgets, budget.id])
                                                    }
                                                }} /> <span className="text-xs">{budget.name}</span>
                                        </div>
                                    })}
                                    {budgets.length === 0 && <div className='text-xs text-gray-400'>
                                        No budgets found
                                    </div>}
                                </div>
                            </Filter> */}
                            <Filter isOpen={isWalletFilterOpen} setOpen={setWalletFilterOpen} title={selectedAccounts.length > 0 ?
                                <div className="rounded-md font-semimedium text-xs">
                                    <div>Wallets ({selectedAccounts.length})</div>
                                </div> : "All wallets"} childWidth={12}>
                                <div className='flex flex-col'>
                                    <div className='flex space-x-1 items-center'>
                                        <Checkbox
                                            icon={<RadioButtonUncheckedIcon />}
                                            checkedIcon={<RadioButtonCheckedIcon />}
                                            style={{
                                                transform: "scale(0.875)",
                                                padding: 0
                                            }}
                                            classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedAccounts.length === 0} onChange={() => {
                                                setSelectedAccounts([])
                                            }} /> <span className="text-xs font-medium">All wallets</span>
                                    </div>
                                    {accountsAll.map((account) => {
                                        return <div key={account.id} className='flex space-x-1 items-center'>
                                            <Checkbox
                                                style={{
                                                    transform: "scale(0.875)",
                                                    padding: 0
                                                }}
                                                classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedAccounts.includes(account.address)} onChange={() => {
                                                    if (selectedAccounts.includes(account.address)) {
                                                        setSelectedAccounts(selectedAccounts.filter(s => s !== account.address))
                                                    } else {
                                                        setSelectedAccounts([...selectedAccounts, account.address])
                                                    }
                                                }} />
                                            <span className="text-xs font-medium">{account.name}</span>
                                        </div>
                                    })}
                                    {accounts.length === 0 && <div className='text-sm text-gray-400'>
                                        No account found
                                    </div>}
                                </div>
                            </Filter>
                            <Filter isOpen={isChainFilterOpen} setOpen={setChainFilterOpen} title={selectedChains.length > 0 ?
                                <div className="rounded-md font-semimedium text-xs">
                                    <div>Chains ({selectedChains.length})</div>
                                </div> : "Chains"
                            } childWidth={10}>
                                <Input fullWidth disableUnderline sx={{
                                    fontSize: "0.875rem",
                                }} className="border px-1" placeholder="Search" onChange={(val) => setSearchChain(val.target.value)} endAdornment={<>
                                    <AiOutlineSearch />
                                </>} />
                                <div className='flex flex-col mt-3'>
                                    {Object.values(Blockchains).filter(s => s.name.toLowerCase().includes(searchChain.toLowerCase())).map((chain) => {
                                        return <div key={chain.name} className='flex space-x-1 items-center'>
                                            <Checkbox
                                                style={{
                                                    transform: "scale(0.875)",
                                                    padding: 0
                                                }}
                                                classes={{ colorPrimary: "!text-primary", root: "" }} checked={selectedChains.includes(chain.name)} onChange={() => {
                                                    if (selectedChains.includes(chain.name)) {
                                                        setSelectedChains(selectedChains.filter(s => s !== chain.name))
                                                    } else {
                                                        setSelectedChains([...selectedChains, chain.name])
                                                    }
                                                }} /> <span className="text-xs">{chain.displayName}</span>
                                        </div>
                                    })}
                                    {Object.values(Blockchains).length === 0 && <div className='text-xs text-gray-400'>
                                        No chain found
                                    </div>}
                                </div>
                            </Filter>
                        </div>

                        {txs.length > 0 && <div className="py-1">
                            <CSVLink className="cursor-pointer rounded-md dark:bg-darkSecond bg-white border px-5 py-1 font-semibold flex items-center space-x-5 h-9" filename={"remox_transactions.csv"} data={txs.map(w => {
                                let directionType = TransactionDirectionDeclare(w, accounts);
                                const blockchain = Blockchains.find(s => s.name === w.blockchain)!;
                                const account = accountsRaw.find(s => s.address.toLowerCase() === ('tx' in w ? w.contractAddress : w.address).toLowerCase())
                                const [img, name, action] = TransactionDirectionImageNameDeclaration(blockchain, directionType, 'tx' in w, account?.provider ?? undefined);
                                let method = 'tx' in w ? w.tx.method : w.method;

                                const from = 'tx' in w ? w.contractAddress : w.rawData.from;

                                let amountCoins: { amount: number, coin: string }[] = [];

                                let swapping: {
                                    amountIn: number,
                                    amountOut: number,
                                    amountInCoin: string,
                                    amountOutCoin: string,
                                } | null = null

                                let startDate: string | null = null
                                let endDate: string | null = null

                                const nativeToken = Object.values(coins).find((c) => blockchain.nativeToken.toLowerCase() === c.address.toLowerCase())


                                if (method === ERCMethodIds.transfer || method === ERCMethodIds.transferFrom || method === ERCMethodIds.transferWithComment
                                    || method === ERCMethodIds.deposit || method === ERCMethodIds.withdraw || method === ERCMethodIds.borrow || method === ERCMethodIds.repay
                                ) {
                                    const coinData = 'tx' in w ? (w.tx as ITransfer).coin : (w as ITransfer).coin;
                                    amountCoins = [{ amount: DecimalConverter('tx' in w ? (w.tx as ITransfer).amount : (w as ITransfer).amount, coinData.decimals), coin: coinData.symbol }];
                                } else if (method === ERCMethodIds.batchRequest || method === ERCMethodIds.automatedBatchRequest) {
                                    const payments = 'tx' in w ? (w.tx as unknown as IBatchRequest).payments : (w as IBatchRequest).payments;
                                    amountCoins = payments.map(w => ({ amount: DecimalConverter(w.amount, w.coin.decimals), coin: w.coin.symbol }));
                                } else if (method === ERCMethodIds.swap) {
                                    const swap = 'tx' in w ? (w.tx as unknown as ISwap) : (w as ISwap);
                                    swapping = {
                                        amountIn: DecimalConverter(swap.amountIn, swap.coinIn.decimals),
                                        amountOut: DecimalConverter(swap.amountOutMin, swap.coinOutMin.decimals),
                                        amountInCoin: swap.coinIn.symbol,
                                        amountOutCoin: swap.coinOutMin.symbol,
                                    }
                                } else if (method === ERCMethodIds.automatedTransfer) {
                                    const transfer = 'tx' in w ? (w.tx as unknown as IAutomationTransfer) : (w as IAutomationTransfer);
                                    amountCoins = [{ amount: DecimalConverter(transfer.amount, transfer.coin.decimals), coin: transfer.coin.symbol }];
                                    startDate = dateFormat(transfer.startTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                    endDate = dateFormat(transfer.endTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                } else if (method === ERCMethodIds.automatedCanceled) {
                                    const { streamId } = 'tx' in w ? (w.tx as unknown as IAutomationCancel) : (w as IAutomationCancel);
                                    const transfer = streamings.find(s => (s as IAutomationTransfer).streamId === streamId) as IAutomationTransfer;
                                    if (transfer) {
                                        amountCoins = [{ amount: DecimalConverter(transfer.amount, transfer.coin.decimals), coin: transfer.coin.symbol }];
                                        startDate = dateFormat(transfer.startTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                        endDate = dateFormat(transfer.endTime * 1e3, "mmm dd, yyyy HH:MM:ss");
                                    }
                                }

                                let timestamp = w.timestamp * 1e3;

                                // let gasCoin = 'tx' in w ? "" : w.rawData.tokenSymbol ?? w.rawData.feeCurrency ?? "";
                                // let gasCoinObj = coins[gasCoin.toUpperCase()];
                                let gas = 'tx' in w ? w.fee : +w.rawData.gasPrice * +w.rawData.gasUsed;
                                let blockNumber = 'tx' in w ? "" : w.rawData.blockNumber;
                                let hash = 'tx' in w ? "" : w.rawData.hash;
                                let blockhash = 'tx' in w ? "" : w.rawData.blockHash;
                                let data = 'tx' in w ? "" : w.rawData.input;

                                let to = "";
                                if (method === ERCMethodIds.transfer || method === ERCMethodIds.transferFrom || method === ERCMethodIds.transferWithComment) {
                                    to = 'tx' in w ? (w.tx as ITransfer).to : (w as ITransfer).to;
                                } else if (method === ERCMethodIds.batchRequest || method === ERCMethodIds.automatedBatchRequest) {
                                    to = 'tx' in w ? (w.tx as unknown as IBatchRequest).payments.map(w => w.to).join(", ") : (w as unknown as IBatchRequest).payments.map(w => w.to).join(", ");
                                } else if (method === ERCMethodIds.swap) {
                                    to = 'tx' in w ? (w.tx as unknown as ISwap).coinOutMin.address : (w as unknown as ISwap).coinOutMin.address;
                                } else if (method === ERCMethodIds.automatedTransfer) {
                                    to = 'tx' in w ? (w.tx as unknown as IAutomationTransfer).to : (w as unknown as IAutomationTransfer).to;
                                }
                                return {
                                    'Method': action,
                                    "Provider": name,
                                    'Status': 'tx' in w ? w.tx.isError ? "Error" : w.isExecuted ? "Success" : w.rejection?.isExecuted ? "Rejected" : "Pending" : w.isError ? "Error" : "Success",
                                    'From:': from,
                                    'Amount': swapping ? `${swapping.amountIn} => ${swapping.amountOut}` : amountCoins.map(w => `${w.amount}`).join(',\n'),
                                    'Coin': swapping ? `${swapping.amountInCoin} => ${swapping.amountOut}` : amountCoins.map(w => `${w.coin}`).join(',\n'),
                                    'To:': to,
                                    'Date': method === ERCMethodIds.automatedTransfer ? `${startDate} - ${endDate}` : dateFormat(new Date(timestamp), "mediumDate"),
                                    "Label": w.tags.map(s => s.name).join(', '),
                                    "Gas": `${DecimalConverter(gas || "0", nativeToken?.decimals ?? 1).toFixed(3)} ${nativeToken?.symbol}`,
                                    "Block Number": blockNumber,
                                    "Transaction Hash": hash,
                                    "Block Hash": blockhash,
                                    "Input": data
                                }
                            })}>
                                <img className={`w-[0.875rem] h-[0.875rem] !m-0 `} src={darkMode ? '/icons/import_white.png' : '/icons/import.png'} alt='Import' />
                                <div className="text-xs">{txs.length !== historyTxLn ? "Export Filtered" : "Export All"}</div>
                            </CSVLink>
                        </div>}
                    </div>}
                    <div className="mt-5">
                        <table className="w-full" style={{
                            emptyCells: "hide"
                        }}>
                            <tr className="pl-5 grid grid-cols-[8.5%,14.5%,16%,repeat(3,minmax(0,1fr)),22%] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md">
                                <th className="py-2 self-center text-left">Date</th>
                                <th className="py-2 self-center text-left">Wallet | Chain</th>
                                <th className="py-2 self-center text-left">Type</th>
                                <th className="py-2 self-center text-left">Amount</th>
                                <th className="py-2 self-center text-left">Labels</th>
                                <th className="py-2 self-center text-left">Signatures</th>
                                <th className="py-1 flex justify-end pr-[3.25rem]">
                                    <div onClick={refresh} className="w-28 py-1 px-1 cursor-pointer border border-primary hover:bg-primary hover:bg-opacity-5 text-primary rounded-md flex items-center justify-center space-x-2">
                                        {!refreshLoading && <div>
                                            <img src="/icons/refresh_primary.png" alt="" className="w-3 h-3" />
                                        </div>}
                                        <div className="tracking-wider self-center leading-none">
                                            {refreshLoading ? <><Loader /></> : "Refresh"}
                                        </div>
                                    </div>
                                </th>
                                {/* <th></th> */}
                            </tr>
                            {txs.slice(pagination - STABLE_INDEX, pagination).map((tx, i) => {
                                const blockchain = Blockchains.find(b => b.name === tx.blockchain)!;
                                if ((tx as IFormattedTransaction)['hash']) {
                                    const address = (tx as IFormattedTransaction).address;
                                    const account = accountsRaw.find(s => s.address.toLowerCase() === address.toLowerCase())
                                    const txData = (tx as IFormattedTransaction)
                                    return <SingleTxContainer isDetailOpen={index !== undefined && Txs[+index] === tx} txIndexInRemoxData={tx.indexPlace ?? 0} tags={tags} blockchain={blockchain} key={`${txData.address}${txData.rawData.hash}`} selectedAccount={account} transaction={txData} accounts={accounts} color={"bg-white dark:bg-darkSecond"} />
                                } else {
                                    const txData = (tx as ITransactionMultisig)
                                    const account = accountsRaw.find(s => s.address.toLowerCase() === txData.contractAddress.toLowerCase())
                                    const isSafe = "safeTxHash" in txData
                                    let directionType = TransactionDirectionDeclare(txData, accounts);
                                    return <MultisigTx isDetailOpen={index !== undefined && Txs[+index] === tx} txPositionInRemoxData={tx.indexPlace ?? 0} tags={tags} blockchain={blockchain} direction={directionType} account={account} key={txData.contractAddress + txData.hashOrIndex} address={address} tx={tx as ITransactionMultisig} />
                                }
                            })}
                        </table>
                        <div className="flex justify-between">
                            <div></div>
                            <div>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[]}
                                    count={txs.length}
                                    page={(pagination / STABLE_INDEX) - 1}
                                    onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                                    rowsPerPage={STABLE_INDEX}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}


export default Transactions;

interface IProps { isDetailOpen?: boolean, transaction: IFormattedTransaction, accounts: string[], selectedAccount?: IAccountORM, color: string, tags: ITag[], blockchain: BlockchainType, txIndexInRemoxData: number }

export const SingleTxContainer = ({ transaction, accounts, selectedAccount, blockchain, tags, txIndexInRemoxData, isDetailOpen }: IProps) => {
    const isBatch = transaction.id === ERCMethodIds.batchRequest || transaction.id === ERCMethodIds.automatedBatchRequest
    const TXs: IFormattedTransaction[] = [];
    if (isBatch) {
        if (transaction.id === ERCMethodIds.batchRequest) {
            const groupBatch = _((transaction as IBatchRequest).payments).groupBy("to").value()
            Object.entries(groupBatch).forEach(([key, value]) => {
                let tx: IBatchRequest = {
                    timestamp: transaction.timestamp,
                    isError: transaction.isError,
                    method: transaction.method,
                    id: transaction.id,
                    blockchain: transaction.blockchain,
                    hash: transaction.hash,
                    rawData: transaction.rawData,
                    payments: value,
                    address: transaction.address,
                    tags: transaction.tags,
                    // budget: transaction.budget,
                }
                TXs.push(tx)
            })
        } else {
            const groupBatch = _((transaction as IAutomationBatchRequest).payments).groupBy("address").value()
            Object.entries(groupBatch).forEach(([key, value]) => {
                let tx: IAutomationBatchRequest = {
                    timestamp: transaction.timestamp,
                    isError: transaction.isError,
                    method: transaction.method,
                    id: transaction.id,
                    hash: transaction.hash,
                    blockchain: transaction.blockchain,
                    rawData: transaction.rawData,
                    payments: value,
                    address: transaction.address,
                    tags: transaction.tags,
                    // budget: transaction.budget,
                }
                TXs.push(tx)
            })
        }
    } else {
        TXs.push(transaction)
    }
    const transactionCount = transaction.id === ERCMethodIds.batchRequest ? TXs.length : 1
    let directionType = TransactionDirectionDeclare(transaction, accounts);

    return <>
        {isBatch && TXs.map((s, i) => <SingleTransactionItem isDetailOpen={isDetailOpen} txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}${i}`} date={transaction.rawData.timeStamp} transaction={s} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />)}
        {!isBatch && <SingleTransactionItem isDetailOpen={isDetailOpen} txPositionInRemoxData={txIndexInRemoxData} tags={tags} blockchain={blockchain} account={selectedAccount} key={`${transaction.address}${transaction.hash}`} date={transaction.rawData.timeStamp} transaction={transaction} direction={directionType} status={TransactionStatus.Completed} isMultiple={isBatch} />}
    </>
}

