import { useEffect, useState, useRef } from "react";
import { IBalanceItem, SelectOrderBalance } from 'redux/reducers/currencies';
import CoinItem from './coinitem';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { Chart as ChartJs } from 'chart.js';
import useModalSideExit from 'hooks/useModalSideExit';
import { useSelector } from "react-redux";
import { SelectAccountStats, SelectRawStats } from "redux/reducers/accountstats";
import Loader from "components/Loader";
import LineChart from "components/general/Linechart";
import Button from "components/button";
import { AddressReducer } from "../../../utils";
import Modal from 'components/general/modal'
import EditWallet from "./editWallet";
import DeleteWallet from "./deleteWallet";
import NewWalletModal from "./newWalletModal";
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import useNextSelector from "hooks/useNextSelector";
import { selectStorage } from "redux/reducers/storage";


const Statistic = ({ transactions }: { transactions: IFormattedTransaction[] | undefined }) => {
    const selectedAccount = useNextSelector(SelectSelectedAccount)
    const orderBalance = useNextSelector(SelectOrderBalance)
    const dark = useNextSelector(selectDarkMode)
    const storage = useNextSelector(selectStorage)
    const stats = useNextSelector(SelectRawStats)

    const [modalVisible, setModalVisible] = useState(false)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [walletModal, setWalletModal] = useState(false)
    const [details, setDetails] = useState(false)
    const [orderBalance4, setOrderBalance] = useState<IBalanceItem[]>([])
    const [selectcoin, setSelectcoin] = useState<string>("")
    const [chartDate, setChartDate] = useState("")

    // const [data, setData] = useState({
    //     datasets: [{
    //         data: [0],
    //         backgroundColor: [""],
    //         borderWidth: 0,
    //         hoverOffset: 0,
    //     },
    //     ],
    //     labels: [
    //         ''
    //     ],
    // });

    const [data, setData] = useState({})

    const chartjs = useRef<ChartJs>(null)

    const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "")


    useEffect(() => {
        setOrderBalance(orderBalance?.slice(0, 3) ?? [])
    }, [orderBalance])

    const {
        isLoading,
        totalBalance: balance,
        TotalBalancePercentage: percent
    } = useSelector(SelectAccountStats)


    const UpdateChartAnimation = (index?: number) => {
        if (chartjs.current) {
            if (index || index === 0) {
                chartjs.current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                chartjs.current.setActiveElements([])
            }
            chartjs.current.update()
        }
    }

    useEffect(() => {
        if (!selectcoin) {
            UpdateChartAnimation()
        }
    }, [selectcoin])



    // useEffect(() => {
    //     if (orderBalance4 !== undefined) {
    //         const label: string[] = []
    //         const amount: number[] = []
    //         const color: string[] = []
    //         for (let i = 0; i < orderBalance4.length; i++) {
    //             if (parseFloat(((orderBalance4[i].tokenPrice ?? 0) * orderBalance4[i].amount).toFixed(2)) !== 0) {
    //                 label[i] = orderBalance4[i].coins.name
    //                 color[i] = orderBalance4[i].coins.color
    //                 amount[i] = parseFloat(((orderBalance4[i].tokenPrice ?? 0) * orderBalance4[i].amount).toFixed(2))
    //             }
    //         }
    //         setData(
    //             {
    //                 datasets: [{
    //                     data: amount.length > 0 ? amount : [100],
    //                     backgroundColor: amount.length > 0 ? color : ["#FF7348"],
    //                     borderWidth: 0,
    //                     hoverOffset: 15,
    //                 },
    //                 ],
    //                 labels: amount.length > 0 ? label : ['data'],
    //             },
    //         )
    //     }
    // }, [orderBalance4, selectedAccount])



    const datas = [
        {
            id: 0,
            walletName: "Treasury Vault 0",
            balance: `$${balance?.toFixed(2)}`,
        },
        {
            id: 1,
            walletName: "Treasury Vault 1",
            balance: `$${balance?.toFixed(2)}`,
        },
    ]

    return <>
        {
            modalEditVisible && <Modal onDisable={setModalEditVisible} disableX={true} className={'!pt-4 !w-[43%]'}>
                <EditWallet onDisable={setModalEditVisible} />
            </Modal>
        }
        {
            deleteModal && <Modal onDisable={setDeleteModal} disableX={true} className={'!pt-4'}>
                <DeleteWallet onDisable={setDeleteModal} />
            </Modal>
        }
        {
            walletModal && <Modal onDisable={setWalletModal} disableX={true} className={'!pt-4 !z-[99] !w-[43%]'}>
                <NewWalletModal onDisable={setWalletModal} />
            </Modal>
        }
        <div className="flex flex-col gap-5 h-full w-full ">
            <div className="text-4xl font-semibold text-left">Welcome, Orkhan</div>
            <div className="bg-white dark:bg-darkSecond rounded-lg shadow">
                <div className="w-full px-12 pt-5 flex justify-between">
                    <div className="  flex flex-col gap-1">
                        <div className=" font-medium text-lg text-greylish text-opacity-40 tracking-wide">Total Treasury Value</div>
                        <div className="text-4xl font-semibold">$500.000</div>
                    </div>
                    <div className="flex gap-3 pt-6">
                         <span className={` ${chartDate === "1w" && 'text-primary text-opacity-100'} hover:text-primary cursor-pointer text-greylish text-opacity-40 tracking-wide`} onClick={() =>setChartDate("1w")}>1W</span>
                         <span className={` ${chartDate === "1m" && 'text-primary text-opacity-100'}  hover:text-primary cursor-pointer text-greylish  text-opacity-40 tracking-wide`} onClick={() =>setChartDate("1m")}>1M</span>
                         <span className={` ${chartDate === "3m" && 'text-primary text-opacity-100'} text-greylish hover:text-primary cursor-pointer text-opacity-40 tracking-wide`} onClick={() =>setChartDate("3m")}>3M</span>
                         <span className={` ${chartDate === "1y" && 'text-primary text-opacity-100'}  hover:text-primary cursor-pointer text-greylish text-opacity-40 tracking-wide`} onClick={() =>setChartDate("1y")}>1Y</span>
                         </div>
                </div>
                {/* <div className="flex items-center justify-center h-[30%] w-[30%]"><Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} /></div> */}
                <div className="w-full h-full flex items-center justify-center"><LineChart data={data} type={'area'} /></div>
            </div>
            <div className=" flex flex-col gap-5 pt-6 xl:pt-0">
                <div className="flex justify-between w-full">
                    <div className="text-2xl font-semibold">Connected Wallets</div>
                    <Button className="text-xs sm:text-base !py-0 !px-8 rounded-xl" onClick={() => { setWalletModal(!walletModal) }}>+ Add Wallet</Button>
                </div>
                <div className="grid grid-cols-2 gap-32 xl:gap-10 pb-4">
                    {datas.map((item, id) => {
                        return <div key={id} className="w-full shadow-custom  pt-4  rounded-xl bg-white dark:bg-darkSecond min-w-[50%]">
                            <div className="w-full">
                                <div className="border-b dark:border-greylish pb-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 px-3">
                                            <div className="bg-greylish bg-opacity-40 w-9 h-9 rounded-full"></div>
                                            <div className="flex flex-col">
                                                <div className="font-semibold">{item.walletName}</div>
                                                <div className="text-sm text-greylish ">{AddressReducer(selectedAccount ?? "")}</div>
                                            </div>
                                        </div>
                                        <div onClick={() => { setDetails(!details) }} className="relative cursor-pointer  h-7 w-7  text-2xl m-0 font-bold text-greylish flex "><span className="rotate-90">...</span>
                                            {details && <div className="flex flex-col   bg-white absolute right-8  w-[8rem]  rounded-lg shadow-xl z-50 ">
                                                <div className="cursor-pointer  text-sm  items-start    w-full pl-3  py-2 gap-3" onClick={() => {
                                                    setModalEditVisible(true)
                                                    setModalVisible(false)
                                                }}>
                                                    <div className="flex w-full gap-2"><img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert  dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span></div>
                                                </div>
                                                <div className="cursor-pointer  text-sm flex w-full pl-3 pr-12 py-2 gap-3" onClick={() => {
                                                    setDeleteModal(true)
                                                    setModalVisible(false)
                                                }}>
                                                    <div className="flex w-full gap-2"> <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="w-4 h-4" alt="" /> <span>Delete</span></div>
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex ">
                                    <div className="border-r dark:border-greylish w-[25%] flex flex-col gap-3 pb-2 px-3">
                                        <div className="flex flex-col">
                                            <div className="text-greylish dark:text-white">Total Value</div>
                                            <div className="text-lg"> {!isLoading ? item.balance : <Loader />}</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-greylish dark:text-white">Signers</div>
                                            <div className="flex pl-3">
                                                <div className=" absolute z-[0] bg-greylish bg-opacity-80  w-5 h-5 rounded-full"></div>
                                                <div className="relative z-[3] right-[10px] bg-greylish bg-opacity-70 w-5 h-5 rounded-full"></div>
                                                <div className=" relative z-[5] -left-[5px] bg-greylish bg-opacity-60 w-5 h-5 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-[75%] ">
                                        {
                                            balance && orderBalance4 !== undefined ?
                                                <div className="flex flex-col  w-full" ref={customRef}>
                                                    {orderBalance4.map((item, index) => {
                                                        return <div className="border-b dark:border-greylish w-full" key={index} > <CoinItem key={item.coins.contractAddress + item.coins.name} setSelectcoin={setSelectcoin} onClick={() => {
                                                            if (item.amount) {
                                                                setSelectcoin(item.coins.name)
                                                                UpdateChartAnimation(index)
                                                            }
                                                        }}
                                                            selectcoin={selectcoin}
                                                            title={item.coins.name}
                                                            coin={item.amount.toFixed(2)}
                                                            usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)}
                                                            percent={(item.percent || 0).toFixed(1)}
                                                            rate={item.per_24}
                                                            img={item.coins.coinUrl} />
                                                        </div>
                                                    })}
                                                </div> : <Loader />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                    })}
                </div>

            </div>
        </div>

        {/* <div className="col-span-2 flex flex-col">
            <div className="flex justify-between pl-4 h-[1.875rem]">
                <div className="text-base text-greylish">Total Balance</div>
                <div className="text-base text-greylish opacity-70">24h</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-8">
                <div className="text-4xl">
                    {!isLoading ? `$${balance?.toFixed(2)}` : <Loader />}
                </div>
                <div className="flex items-center text-3xl text-greylish opacity-70" style={
                    balance !== undefined && balance !== 0 ? percent && percent > 0 ? { color: 'green' } : { color: 'red' } : { color: 'black' }
                }>
                    {!isLoading ? `${percent?.toFixed(2)}%` : <Loader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money in (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-xl sm:text-2xl opacity-80">
                    {lastIn !== undefined && transactions !== undefined && balance !== undefined ? `+ $${lastIn?.toFixed(2)}` : <Loader />}
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between sm:pl-4">
                <div className="text-greylish text-sm sm:text-base">Money out (c.m.)</div>
            </div>
            <div className="flex justify-between shadow-custom bg-white dark:bg-darkSecond rounded-xl px-8 py-4">
                <div className="text-greylish opacity-80 text-xl sm:text-2xl">
                    {lastOut !== undefined && transactions !== undefined && balance !== undefined ? `- $${lastOut?.toFixed(2)}` : <Loader />}
                </div>
            </div>
        </div>

        <div className="sm:flex flex-col hidden relative">
            <div>Asset</div>
            <div className=" flex flex-col">
                {/* <LineChart chartData={userData} /> */}
        {/* <Chartjs data={data} ref={chartjs} items={orderBalance4 as any} dispatch={setSelectcoin} />
            </div>
        </div>
        {
            balance && orderBalance4 !== undefined ?
                <div className="flex flex-col gap-9 overflow-hidden col-span-2 sm:col-span-1 px-4" ref={customRef}>
                    {orderBalance4.map((item, index) => {
                        return <CoinItem key={item.coins.contractAddress + item.coins.name} setSelectcoin={setSelectcoin} onClick={() => {
                            if (item.amount) {
                                setSelectcoin(item.coins.name)
                                UpdateChartAnimation(index)
                            }
                        }}
                            selectcoin={selectcoin}
                            title={item.coins.name}
                            coin={item.amount.toFixed(2)}
                            usd={((item.tokenPrice ?? 0) * item.amount).toFixed(2)}
                            percent={(item.percent || 0).toFixed(1)}
                            rate={item.per_24}
                            img={item.coins.coinUrl} />
                    })}
                </div> : <Loader />
        } */}
    </>
}


export default Statistic;