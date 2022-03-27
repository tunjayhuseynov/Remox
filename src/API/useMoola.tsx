import { useContractKit } from "@celo-tools/use-contractkit";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMoolaData, updateData } from "redux/reducers/moola";
import { AltCoins, Coins, TokenType } from "types";
import BigNumber from 'bignumber.js'
import { BN, etherSize, fromWei, print, printRay, printRayRate, printRayRateRaw, toWei } from "utils/ray";
import { AbiItem } from "./ABI/AbiItem";
import { Contracts } from "./Contracts/Contracts";
import useAllowance from "./useAllowance";
import { SelectCurrencies } from 'redux/reducers/currencies'
const MoolaProxy = import("./ABI/MoolaProxy.json")
const Moola = import("./ABI/Moola.json")
const MoolaData = import("./ABI/MoolaData.json")
const MoolaPriceOracle = import("./ABI/MoolaPriceOracle.json")

export enum InterestRateMode {
    Stable = "1",
    Variable = "2"
}

export const MoolaType = (type: string) => type === "withdraw" ? "Withdrawn" : type === "borrow" ? "Borrowed" : type === "repay" ? "Repaid" : "Deposited"


export default function useMoola() {
    const { kit, address } = useContractKit()
    const contractRef = useRef<string>()
    const priceOracleRef = useRef<string>()
    const { allow } = useAllowance()
    const [loading, setLaoding] = useState(false)
    const [initLoading, setInitLaoding] = useState(false)

    const dispatch = useDispatch()
    const MoolaUserData = useSelector(selectMoolaData)
    const moolaData = useSelector(selectMoolaData)
    const currencies = useSelector(SelectCurrencies)

    useEffect(() => {
        getContract().catch((error: any) => { console.error(error.message) })
    }, [])

    const getContract = async () => {
        try {
            setLaoding(true)
            const abi = await MoolaProxy
            const proxy = new kit.web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaProxy.address)

            const tx = await proxy.methods.getLendingPool()
            const address = await tx.call()
            const priceOracle = await proxy.methods.getPriceOracle().call()
            contractRef.current = address
            priceOracleRef.current = priceOracle
            setLaoding(false)
            return address;
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const getBorrowLimit = async (walletAddress?: string) => {
        try {
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)
            return (await moola.methods.getUserAccountData((walletAddress ?? address!)).call()).availableBorrowsETH
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const getPrice = async (asset: string) => {
        try {
            const abi = await MoolaPriceOracle
            const contract = new kit.web3.eth.Contract(abi.abi as AbiItem[], priceOracleRef.current)
            return await contract.methods.getAssetPrice(asset).call()
        } catch (error: any) {
            console.error("getPrice", error)
            throw new Error(error.message)
        }
    }

    const deposit = async (asset: string, amount: number | string, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const deposit = await moola.methods.deposit(asset, weiAmount, (to ?? address!), 0)
            await allow(asset, contractRef.current!, amount.toString())
            const res = await deposit.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

            setLaoding(false)

            return res.transactionHash
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const withdraw = async (asset: string, amount: number | string, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const withdraw = await moola.methods.withdraw(asset, weiAmount, (to ?? address!))
            await allow(asset, contractRef.current!, amount.toString())
            const res = await withdraw.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)

            return res.transactionHash
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const borrow = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const borrow = await moola.methods.borrow(asset, weiAmount, interestRateMode, 0, (to ?? address!))
            await allow(asset, contractRef.current!, amount.toString())
            const res = await borrow.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return res.transactionHash
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const repay = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const repay = await moola.methods.repay(asset, weiAmount, interestRateMode, (to ?? address!))
            await allow(asset, contractRef.current!, amount.toString())
            const res = await repay.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return res.transactionHash
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const getReserveData = async (asset: string): Promise<MoolaReserveData> => {
        try {
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await MoolaData
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaDataProxy.address)

            const data = await moola.methods.getReserveData(asset)
            const ltv = await moola.methods.getReserveConfigurationData(asset).call()
            const reserveData = await data.call()

            return {
                availableLiquidity: print(reserveData.availableLiquidity),
                rawAvailableLiquidity: reserveData.availableLiquidity,
                totalStableDebt: print(reserveData.totalStableDebt),
                totalVariableDebt: print(reserveData.totalVariableDebt),
                liquidityRate: printRayRateRaw(reserveData.liquidityRate),
                rawLiquidityRate: reserveData.liquidityRate,
                variableBorrowRate: printRayRate(reserveData.variableBorrowRate),
                stableBorrowRate: printRayRate(reserveData.stableBorrowRate),
                averageStableBorrowRate: printRayRate(reserveData.averageStableBorrowRate),
                liquidityIndex: printRay(reserveData.liquidityIndex),
                variableBorrowIndex: printRay(reserveData.variableBorrowIndex),
                coinReserveConfig: {
                    Decimals: BN(ltv.decimals).toNumber(),
                    LoanToValue: `${BN(ltv.ltv).div(BN(100))}%`,
                    LiquidationThreshold: `${BN(ltv.liquidationThreshold).div(BN(100))}%`,
                    LiquidationBonus: `${BN(ltv.liquidationBonus).div(BN(100)).minus(BN(100))}%`,
                    ReserveFactor: `${BN(ltv.reserveFactor).div(BN(100))}%`,
                    CollateralEnabled: ltv.usageAsCollateralEnabled,
                    BorrowingEnabled: ltv.borrowingEnabled,
                    StableEnabled: ltv.stableBorrowRateEnabled,
                    Active: ltv.isActive,
                    Frozen: ltv.isFrozen,
                },
                lastUpdateTimestamp: new Date(
                    BN(data.lastUpdateTimestamp).multipliedBy(1000).toNumber()
                ).toLocaleString(),
            };

        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const getUserAccountData = async (asset: string, walletAddress?: string): Promise<MoolaUserData> => {
        try {
            const MoolaDataAbi = await MoolaData

            const moola = new kit.web3.eth.Contract(MoolaDataAbi.abi as AbiItem[], Contracts.MoolaDataProxy.address)
            const data = await moola.methods.getUserReserveData(asset, (walletAddress ?? address!)) //(walletAddress ?? address!)

            const userData = await data.call()

            return userData

        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const refresh = async () => {
        await InitializeUser()
    }

    const getSingleInitialUserData = async (currency: AltCoins) => {
        try {
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const element = currency;
            const contract = await kit.contracts.getErc20(element.contractAddress)
            const weiBalance = await contract.balanceOf(address!)
            const balance = fromWei(weiBalance)
            const price = currencies[element.name].price
            const celoPerToken = await getPrice(element.contractAddress)
            const data = await getUserAccountData(element.contractAddress)
            const coinData = await getReserveData(element.contractAddress)
            const lendingBalance = fromWei(data.currentATokenBalance)
            const loanBalance = parseFloat(fromWei(data.currentStableDebt)) + parseFloat(fromWei(data.currentVariableDebt))
            const maxBorrow = await getBorrowLimit(address!)


            const maxCoin = BN(maxBorrow).multipliedBy(etherSize).dividedBy(celoPerToken)
            const maxBorrowValue = BigNumber.minimum(maxCoin, coinData.rawAvailableLiquidity).multipliedBy('0.99').div(etherSize).toString()


            return {
                currencyPrice: price.toString(),
                availableBorrow: maxBorrowValue,
                apy: parseFloat(coinData.liquidityRate),
                walletBalance: parseFloat(balance),
                lendingBalance: parseFloat(BN(lendingBalance).toFixed(2, 2)),
                loanBalance: parseFloat(BN(loanBalance).toFixed(2, 2)),
                currency: element,
                averageStableBorrowRate: parseFloat(coinData.averageStableBorrowRate),
                userData: data,
                coinData: coinData
            }
        } catch (error: any) {
            console.error(error.message)
            throw new Error(error.message)
        }
    }

    const getBorrowInfo = async (borrowAmount: number, currency: AltCoins): Promise<MoolaBorrowStatus> => {
        const collaterals = MoolaUserData.map((userData) => (
            {
                currency: userData.currency,
                usageAsCollateralEnabled: userData.userData.usageAsCollateralEnabled,
                debt: BN(userData.userData.currentStableDebt).plus(userData.userData.currentVariableDebt).plus(currency.name === userData.currency.name ? toWei(borrowAmount) : 0),
                deposit: BN(userData.userData.currentATokenBalance),
                lt: userData.coinData.liquidityRate
            }))
        console.log(collaterals)

        const debtList = collaterals.filter(d => !d.debt.eq(0)).map((c) => c.currency.name)
        const colList = collaterals.filter(d => !d.deposit.eq(0)).map((c) => c.currency.name)

        const debtSum = collaterals.reduce((acc, c) => acc.plus(c.debt), BN(0))
        const collateralSum = collaterals.reduce((acc, c) => acc.plus(c.deposit), BN(0))



        const celo = currencies.CELO;
        const bases = collaterals.map((item) => {
            const isCelo = item.currency.name === "CELO";
            const deposit = item.deposit.multipliedBy((isCelo ? 1 : currencies[item.currency.name].price)).div((isCelo ? 1 : celo.price))
            const debt = item.debt.multipliedBy((isCelo ? 1 : currencies[item.currency.name].price)).div((isCelo ? 1 : celo.price))
            return {
                celoBaseDeposit: deposit,
                celoBaseDebt: debt,
                lt: deposit.eq(0) ? 0 : BN(deposit).multipliedBy(item.lt)
            }
        })
        console.log("Bases: :", bases)

        const collateralLTSum = bases.reduce((acc, c) => acc.plus(c.lt), BN(0))
        const averageLiquidationThreshold = BN(collateralLTSum).dividedBy(collateralSum).multipliedBy(100)

        const totalDeposit = bases.reduce((a, c) => a.plus(c.celoBaseDeposit), BN(0))
        const totalDebt = bases.reduce((a, c) => a.plus(c.celoBaseDebt), BN(0))
        console.log("Total Deposit: ", totalDeposit.toString())
        console.log("Total Debt: ", totalDebt.toString())
        return {
            ltv: BN(totalDebt).dividedBy(totalDeposit).multipliedBy(100).toFixed(2, 2),
            debt: debtSum.div(etherSize).toFixed(4, 2),
            debtList: debtList,
            colList,
            healthFactor: BN(collateralSum).multipliedBy(averageLiquidationThreshold).dividedBy(debtSum).dividedBy(100).toFixed(2, 2)
        }
    }


    const InitializeUser = async () => {
        try {
            if (moolaData.length === 0) setInitLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const coinList: AltCoins[] = Object.values(Coins).filter((s: AltCoins) => s.type !== TokenType.Altcoin);
            const userData: MoolaUserComponentData[] = [];
            for (let index = 0; index < coinList.length; index++) {
                try {
                    const element = coinList[index];

                    const data = await getSingleInitialUserData(element)

                    userData.push(data)
                } catch (error: any) {
                    console.error(error.message)
                }
            }
            if (moolaData.length === 0) setInitLaoding(false)
            setTimeout(() => {
                dispatch(updateData(userData))
            }, 1000)
            return userData
        } catch (error: any) {
            console.error(error)
            setInitLaoding(false)
            throw new Error(error.message)
        }
    }

    return { getContract, deposit, getPrice, withdraw, borrow, repay, getReserveData, getUserAccountData, InitializeUser, refresh, loading, initLoading, getSingleInitialUserData, getBorrowInfo };
}

export interface MoolaUserData {
    currentATokenBalance: string,
    currentStableDebt: string,
    currentVariableDebt: string,
    principalStableDebt: string,
    scaledVariableDebt: string,
    stableBorrowRate: string,
    liquidityRate: string,
    stableRateLastUpdated: string,
    usageAsCollateralEnabled: boolean,
}

export interface MoolaReserveConfig {
    Decimals: number,
    LoanToValue: string,
    LiquidationThreshold: string,
    LiquidationBonus: string,
    ReserveFactor: string,
    CollateralEnabled: boolean,
    BorrowingEnabled: boolean,
    StableEnabled: boolean,
    Active: boolean,
    Frozen: boolean,
}

export interface MoolaReserveData {
    availableLiquidity: string,
    rawAvailableLiquidity: string,
    totalStableDebt: string,
    totalVariableDebt: string,
    liquidityRate: string,
    rawLiquidityRate: string,
    variableBorrowRate: string,
    stableBorrowRate: string,
    averageStableBorrowRate: string,
    liquidityIndex: string,
    variableBorrowIndex: string,
    lastUpdateTimestamp: string,
    coinReserveConfig: MoolaReserveConfig

}

export interface MoolaUserComponentData {
    walletBalance: number,
    lendingBalance: number,
    availableBorrow: string,
    loanBalance: number,
    currency: AltCoins,
    currencyPrice: string,
    apy: number,
    averageStableBorrowRate: number,
    userData: MoolaUserData,
    coinData: MoolaReserveData,
}

export interface MoolaBorrowStatus {
    ltv: string,
    debt: string;
    debtList: string[];
    colList: string[];
    healthFactor: string
}