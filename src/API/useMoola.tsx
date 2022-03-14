import { useContractKit } from "@celo-tools/use-contractkit";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updateData } from "redux/reducers/moola";
import { AltCoins, Coins, TokenType } from "types";
import { BN, etherSize, print, printRay, printRayRate, toWei } from "utils/ray";
import { AbiItem } from "./ABI/AbiItem";
import { Contracts } from "./Contracts/Contracts";
import useAllowance from "./useAllowance";
const MoolaProxy = import("./ABI/MoolaProxy.json")
const Moola = import("./ABI/Moola.json")
const MoolaData = import("./ABI/MoolaData.json")

export enum InterestRateMode {
    Stable = "1",
    Variable = "2"
}

export default function useMoola() {
    const { kit, address } = useContractKit()
    const contractRef = useRef<string>()
    const { allow } = useAllowance()
    const [loading, setLaoding] = useState(false)
    const [initLoading, setInitLaoding] = useState(false)

    const dispatch = useDispatch()

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
            contractRef.current = address
            setLaoding(false)
            return address;
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const deposit = async (asset: string, amount: number | string, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const deposit = await moola.methods.deposit(asset, weiAmount, (to ?? address!), 0)
            await allow(asset, contractRef.current!, amount.toString())
            await deposit.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

            setLaoding(false)

            return true
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const withdraw = async (asset: string, amount: number | string, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const withdraw = await moola.methods.withdraw(asset, weiAmount, (to ?? address!))

            await withdraw.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return true

        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const borrow = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const borrow = await moola.methods.borrow(asset, weiAmount, interestRateMode, 0, (to ?? address!))

            await borrow.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return true
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const repay = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            setLaoding(true)
            if (!contractRef.current) {
                await getContract()
            }
            const abi = await Moola
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const repay = await moola.methods.repay(asset, weiAmount, interestRateMode, (to ?? address!))
            await allow(asset, contractRef.current!, amount.toString())
            await repay.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return true
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const getReserveData = async (asset: string): Promise<MoolaReserveData> => {
        try {
            if (!contractRef.current) {
                await getContract()
            }
            const abi = await MoolaData
            const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaDataProxy.address)

            const data = await moola.methods.getReserveData(asset)
            const ltv = await moola.methods.getReserveConfigurationData(asset).call()
            const reserveData = await data.call()

            return {
                availableLiquidity: print(reserveData.availableLiquidity),
                totalStableDebt: print(reserveData.totalStableDebt),
                totalVariableDebt: print(reserveData.totalVariableDebt),
                liquidityRate: printRayRate(reserveData.liquidityRate),
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
        let data = await InitializeUser()
        setTimeout(() => {
            dispatch(updateData(data))
        }, 1000)
    }


    const InitializeUser = async () => {
        try {
            setInitLaoding(true)
            const coinList: AltCoins[] = Object.values(Coins).filter((s: AltCoins) => s.type !== TokenType.Altcoin);
            const userData: MoolaUserComponentData[] = [];
            for (let index = 0; index < coinList.length; index++) {
                try {
                    const element = coinList[index];
                    const contract = await kit.contracts.getErc20(element.contractAddress)
                    const weiBalance = await contract.balanceOf(address!)
                    const balance = kit.web3.utils.fromWei(weiBalance.toString(), "ether")
                    const data = await getUserAccountData(element.contractAddress)
                    const coinData = await getReserveData(element.contractAddress)
                    const lendingBalance = kit.web3.utils.fromWei(data.currentATokenBalance, "ether")
                    const loanBalance = parseFloat(kit.web3.utils.fromWei(data.currentStableDebt, "ether")) + parseFloat(kit.web3.utils.fromWei(data.currentVariableDebt, "ether"))
                    userData.push({
                        apy: parseFloat(coinData.liquidityRate),
                        walletBalance: parseFloat(balance),
                        lendingBalance: parseFloat(BN(lendingBalance).toFixed(2, 2)),
                        loanBalance: parseFloat(BN(loanBalance).toFixed(2, 2)),
                        currency: element,
                        averageStableBorrowRate: parseFloat(coinData.averageStableBorrowRate),
                        userData: data,
                        coinData: coinData
                    })
                } catch (error: any) {
                    console.error(error.message)
                }
            }
            setInitLaoding(false)
            return userData
        } catch (error: any) {
            console.error(error)
            setInitLaoding(false)
            throw new Error(error.message)
        }
    }

    return { getContract, deposit, withdraw, borrow, repay, getReserveData, getUserAccountData, InitializeUser, refresh, loading, initLoading };
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
    totalStableDebt: string,
    totalVariableDebt: string,
    liquidityRate: string,
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
    loanBalance: number,
    currency: AltCoins,
    apy: number,
    averageStableBorrowRate: number,
    userData: MoolaUserData,
    coinData: MoolaReserveData,
}