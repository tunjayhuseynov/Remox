import { useContractKit } from "@celo-tools/use-contractkit";
import { useEffect, useRef, useState } from "react";
import { AbiItem } from "./ABI/AbiItem";
import { Contracts } from "./Contracts/Contracts";
const MoolaProxy = import("./ABI/MoolaProxy.json")
const Moola = import("./ABI/Moola.json")

export enum InterestRateMode {
    Stable = "1",
    Variable = "2"
}

export default function useMoola() {
    const { kit, address } = useContractKit()
    const contractRef = useRef<string>()

    useEffect(() => {
        getContract().catch((error: any) => { console.error(error.message) })
    }, [])


    const getContract = async () => {
        try {
            const abi = await MoolaProxy
            const proxy = new kit.web3.eth.Contract(abi.abi as AbiItem[], Contracts.MoolaProxy.address)

            const tx = await proxy.methods.getLendingPool()
            const address = await tx.call()
            contractRef.current = address

            return address;
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const deposit = async (asset: string, amount: number | string, to?: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const weiAmount = kit.web3.utils.toWei(kit.web3.utils.toBN(amount), "ether")
                const deposit = await moola.methods.deposit(asset, weiAmount, (to ?? address!), 0)

                await deposit.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

                return true

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const withdraw = async (asset: string, amount: number | string, to?: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const weiAmount = kit.web3.utils.toWei(kit.web3.utils.toBN(amount), "ether")
                const withdraw = await moola.methods.withdraw(asset, weiAmount, (to ?? address!))

                await withdraw.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

                return true

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const borrow = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const weiAmount = kit.web3.utils.toWei(kit.web3.utils.toBN(amount), "ether")
                const borrow = await moola.methods.borrow(asset, weiAmount, interestRateMode, 0, (to ?? address!))

                await borrow.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

                return true

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const repay = async (asset: string, amount: number | string, interestRateMode: InterestRateMode, to?: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const weiAmount = kit.web3.utils.toWei(kit.web3.utils.toBN(amount), "ether")
                const repay = await moola.methods.repay(asset, weiAmount, interestRateMode, (to ?? address!))

                await repay.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

                return true

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const getReserveData = async (asset: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const data = await moola.methods.getReserveData(asset)

                const reserveData = await data.call()

                return reserveData

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const getUserAccountData = async (walletAddress?: string) => {
        try {
            if (contractRef.current) {
                const abi = await Moola
                const moola = new kit.web3.eth.Contract(abi.abi as AbiItem[], contractRef.current)

                const data = await moola.methods.getUserAccountData((walletAddress ?? address!))

                const userData = await data.call()

                return userData

            } else throw new Error("Contract not found")
        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    return { getContract, deposit, withdraw, borrow, repay, getReserveData, getUserAccountData };
}
