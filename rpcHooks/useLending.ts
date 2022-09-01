import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMoolaData, updateData } from "redux/slices/lending";
import { AltCoins, Coins, SolanaCoins, TokenType } from "types";
import BigNumber from 'bignumber.js'
import { BN, etherSize, print, printRay, printRayRate, printRayRateRaw, toWei } from "utils/ray";
import { AbiItem } from "./ABI/AbiItem";
import { Contracts } from "./Contracts/Contracts";
import useAllowance from "./useAllowance";
import { useWalletKit } from "hooks";
import { VaultClient, VaultConfig } from '@castlefinance/vault-sdk'
import useSolanaProvider from "hooks/walletSDK/useSolanaProvider";
import { PublicKey } from "@solana/web3.js";
import { IAccount } from "firebaseConfig";
import { useCelo } from "@celo/react-celo";
import Web3 from "web3";
import { SelectCurrencies } from "redux/slices/account/selector";


const MoolaProxy = import("./ABI/MoolaProxy.json")
const Moola = import("./ABI/Moola.json")
const MoolaData = import("./ABI/MoolaData.json")
const MoolaPriceOracle = import("./ABI/MoolaPriceOracle.json")
const ERC20 = import("./ABI/erc20.json")

export enum InterestRateMode {
    Stable = "1",
    Variable = "2"
}


export const LendingType = (type: string) => type === "withdraw" ? "Withdrawn" : type === "borrow" ? "Borrowed" : type === "repay" ? "Repaid" : "Deposited"


export default function useLending(account: IAccount) {
    const { kit } = useCelo()
    const contractRef = useRef<string>()
    const priceOracleRef = useRef<string>()
    const { allow } = useAllowance()
    const [loading, setLaoding] = useState(false)
    const [initLoading, setInitLaoding] = useState(false)
    const { GetCoins, fromMinScale, blockchain } = useWalletKit()
    const { Provider } = useSolanaProvider()


    const dispatch = useDispatch()
    const MoolaUserData = useSelector(selectMoolaData)
    const currencies = useSelector(SelectCurrencies)

    useEffect(() => {
        getContract().catch((error: any) => { console.error(error.message) })
    }, [])

    const getContract = async () => {
        try {
            setLaoding(true)
            const abi = await MoolaProxy

            const web3 = new Web3((window as any).celo)

            const proxy = new web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaProxy.address)

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

    const getBorrowLimit = async () => {
        try {
            const abi = await Moola

            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)
            return (await moola.methods.getUserAccountData(account.address).call()).availableBorrowsETH
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const getPrice = async (asset: string) => {
        try {
            const abi = await MoolaPriceOracle
            const web3 = new Web3((window as any).celo)
            const contract = new web3.eth.Contract(abi.abi as AbiItem[], priceOracleRef.current)
            return await contract.methods.getAssetPrice(asset).call()
        } catch (error: any) {
            console.error("getPrice", error)
            throw new Error(error.message)
        }
    }

    const deposit = async (asset: string, amount: number | string, to?: string) => {
        try {
            if (blockchain.name === 'solana') {
                if (!Provider) throw new Error("No provider")

                const configResponse = await fetch('https://api.castle.finance/configs')
                const vaults = (await configResponse.json()) as any
                const vault = vaults.find(
                    (v: any) => v.deploymentEnv == 'mainnet' && v.token_label == 'USDC'
                )

                const vaultClient = await VaultClient.load(
                    Provider as any,
                    vault.vault_id,
                    vault.deploymentEnv
                )
                const reserve = await vaultClient.getUserReserveTokenAccount(new PublicKey(account.address));
                await vaultClient.deposit(Provider.wallet as any, typeof amount === "string" ? parseFloat(amount) : amount, reserve)

                return
            }

            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const deposit = await moola.methods.deposit(asset, weiAmount, (account.address), 0)
            await allow(account.address, asset, contractRef.current!, amount.toString())
            const res = await deposit.send({ from: account.address, gas: 300000, gasPrice: web3.utils.toWei('0.5', 'gwei') })

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
            if (blockchain.name === 'solana') {
                if (!Provider) throw new Error("No provider")

                const configResponse = await fetch('https://api.castle.finance/configs')
                const vaults = (await configResponse.json()) as any
                const vault = vaults.find(
                    (v: any) => v.deploymentEnv == 'mainnet' && v.token_label == 'USDC'
                )

                const vaultClient = await VaultClient.load(
                    Provider as any,
                    vault.vault_id,
                    vault.deploymentEnv
                )

                await vaultClient.withdraw(Provider.wallet as any, typeof amount === "string" ? parseFloat(amount) : amount)

                return
            }
            setLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await Moola
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const withdraw = await moola.methods.withdraw(asset, weiAmount, account.address)
            await allow(account.address, asset, contractRef.current!, amount.toString())
            const res = await withdraw.send({ from: account.address, gas: 300000, gasPrice: web3.utils.toWei("0.5", 'Gwei') })
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
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const borrow = await moola.methods.borrow(asset, weiAmount, interestRateMode, 0, account.address)
            await allow(account.address, asset, contractRef.current!, amount.toString())
            const res = await borrow.send({ from: account.address, gas: 300000, gasPrice: web3.utils.toWei("0.5", 'Gwei') })
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
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

            const weiAmount = toWei(amount)
            const repay = await moola.methods.repay(asset, weiAmount, interestRateMode, account.address)
            await allow(account.address, asset, contractRef.current!, amount.toString())
            const res = await repay.send({ from: account.address, gas: 300000, gasPrice: web3.utils.toWei("0.5", 'Gwei') })
            setLaoding(false)
            return res.transactionHash
        } catch (error: any) {
            console.error(error)
            setLaoding(false)
            throw new Error(error.message)
        }
    }

    const getReserveData = async (asset: string): Promise<LendingReserveData> => {
        try {
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const abi = await MoolaData
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaDataProxy.address)

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

    const getUserAccountData = async (asset: string): Promise<LendingUserData> => {
        try {
            const MoolaDataAbi = await MoolaData
            const web3 = new Web3((window as any).celo)
            const moola = new web3.eth.Contract(MoolaDataAbi.abi as AbiItem[], Contracts.MoolaDataProxy.address)
            const data = await moola.methods.getUserReserveData(asset, account.address) //(walletAddress ?? address!)

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
            if (blockchain.name === 'solana') {
                if (!Provider) throw new Error("No provider")

                const configResponse = await fetch('https://api.castle.finance/configs')
                const vaults = (await configResponse.json()) as any
                const vault = vaults.find(
                    (v: any) => v.deploymentEnv == 'mainnet' && v.token_label == 'USDC'
                )

                const vaultClient = await VaultClient.load(
                    Provider as any,
                    vault.vault_id,
                    vault.deploymentEnv
                )

                let lendingUserData: LendingUserComponentData = {
                    apy: (await vaultClient.getApy()).toNumber() * 100,
                    availableBorrow: "0",
                    averageStableBorrowRate: 0,
                    currency: SolanaCoins.USDC,
                    currencyPrice: currencies["USDC"].priceUSD.toString(),
                    lendingBalance: (await vaultClient.getUserValue(new PublicKey(account.address))).getAmount(),
                    loanBalance: 0,
                    walletBalance: 0,
                    userData: {
                        currentATokenBalance: "0",
                        currentStableDebt: "0",
                        currentVariableDebt: "0",
                        liquidityRate: "0",
                        principalStableDebt: "0",
                        scaledVariableDebt: "0",
                        stableBorrowRate: "0",
                        stableRateLastUpdated: "0",
                        usageAsCollateralEnabled: false,
                    },
                    coinData: {
                        availableLiquidity: "0",
                        rawAvailableLiquidity: "0",
                        totalStableDebt: "0",
                        totalVariableDebt: "0",
                        liquidityRate: "0",
                        rawLiquidityRate: "0",
                        variableBorrowRate: "0",
                        stableBorrowRate: "0",
                        averageStableBorrowRate: "0",
                        liquidityIndex: "0",
                        variableBorrowIndex: "0",
                        lastUpdateTimestamp: "0",
                        coinReserveConfig: {
                            Decimals: 0,
                            LoanToValue: "0",
                            LiquidationThreshold: "0",
                            LiquidationBonus: "0",
                            ReserveFactor: "0",
                            CollateralEnabled: false,
                            BorrowingEnabled: false,
                            StableEnabled: false,
                            Active: false,
                            Frozen: false,
                        },
                    }
                };


                return lendingUserData
            }
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            const web3 = new Web3((window as any).celo)

            const erc20 = await ERC20
            const element = currency;
            const contract = new web3.eth.Contract(erc20 as AbiItem[], element.contractAddress)
            const weiBalance = await contract.methods.balanceOf(account.address).call()
            const balance = fromMinScale(weiBalance)
            const price = currencies[element.name].priceUSD
            const celoPerToken = await getPrice(element.contractAddress)
            const data = await getUserAccountData(element.contractAddress)
            const coinData = await getReserveData(element.contractAddress)
            const lendingBalance = fromMinScale(data.currentATokenBalance)
            const loanBalance = parseFloat(fromMinScale(data.currentStableDebt)) + parseFloat(fromMinScale(data.currentVariableDebt))
            const maxBorrow = await getBorrowLimit()


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

    const getBorrowInfo = async (borrowAmount: number, currency: AltCoins): Promise<LendingBorrowStatus | null> => {
        if (blockchain.name === 'solana') return null;

        const collaterals = MoolaUserData.map((userData) => (
            {
                currency: userData.currency,
                usageAsCollateralEnabled: userData.userData.usageAsCollateralEnabled,
                debt: BN(userData.userData.currentStableDebt).plus(userData.userData.currentVariableDebt).plus(currency.name === userData.currency.name ? toWei(borrowAmount) : 0),
                deposit: BN(userData.userData.currentATokenBalance),
                lt: userData.coinData.liquidityRate
            }))

        const debtList = collaterals.filter(d => !d.debt.eq(0)).map((c) => c.currency.name)
        const colList = collaterals.filter(d => !d.deposit.eq(0)).map((c) => c.currency.name)

        const debtSum = collaterals.reduce((acc, c) => acc.plus(c.debt), BN(0))
        const collateralSum = collaterals.reduce((acc, c) => acc.plus(c.deposit), BN(0))



        const celo = currencies.CELO;
        const bases = collaterals.map((item) => {
            const isCelo = item.currency.name === "CELO";
            const deposit = item.deposit.multipliedBy((isCelo ? 1 : currencies[item.currency.name].priceUSD)).div((isCelo ? 1 : celo.priceUSD))
            const debt = item.debt.multipliedBy((isCelo ? 1 : currencies[item.currency.name].priceUSD)).div((isCelo ? 1 : celo.priceUSD))
            return {
                celoBaseDeposit: deposit,
                celoBaseDebt: debt,
                lt: deposit.eq(0) ? 0 : BN(deposit).multipliedBy(item.lt)
            }
        })

        const collateralLTSum = bases.reduce((acc, c) => acc.plus(c.lt), BN(0))
        const averageLiquidationThreshold = BN(collateralLTSum).dividedBy(collateralSum).multipliedBy(100)

        const totalDeposit = bases.reduce((a, c) => a.plus(c.celoBaseDeposit), BN(0))
        const totalDebt = bases.reduce((a, c) => a.plus(c.celoBaseDebt), BN(0))
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
            if (blockchain.name === 'solana') {
                setInitLaoding(true)

                const data = await getSingleInitialUserData(SolanaCoins.USDC)
                setTimeout(() => {
                    dispatch(updateData([data]))
                }, 1000)
                setInitLaoding(false)
                return [data];
            }

            if (MoolaUserData.length === 0) setInitLaoding(true)
            if (!contractRef.current || !priceOracleRef.current) {
                await getContract()
            }
            if (!GetCoins) return
            const coinList: AltCoins[] = Object.values(GetCoins).filter((s: AltCoins) => s.type !== TokenType.Altcoin);
            const userData: LendingUserComponentData[] = [];
            for (let index = 0; index < coinList.length; index++) {
                try {
                    const element = coinList[index];

                    const data = await getSingleInitialUserData(element)

                    userData.push(data)
                } catch (error: any) {
                    console.error(error.message)
                }
            }
            if (MoolaUserData.length === 0) setInitLaoding(false)
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

export interface LendingUserData {
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

export interface LendingReserveConfig {
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

export interface LendingReserveData {
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
    coinReserveConfig: LendingReserveConfig

}

export interface LendingUserComponentData {
    walletBalance: number,
    lendingBalance: number,
    availableBorrow: string,
    loanBalance: number,
    currency: AltCoins,
    currencyPrice: string,
    apy: number,
    averageStableBorrowRate: number,
    userData: LendingUserData,
    coinData: LendingReserveData,
}

export interface LendingBorrowStatus {
    ltv: string,
    debt: string;
    debtList: string[];
    colList: string[];
    healthFactor: string
}