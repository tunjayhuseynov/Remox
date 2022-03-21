import { useContractKit } from '@celo-tools/use-contractkit'
import { AbiItem } from 'API/ABI/AbiItem'
import { useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { SelectPrivateToken } from 'redux/reducers/selectedAccount'
import { PoofCoinsName } from 'types'
const Poof = import('@poofcash/poof-v2-kit') //{ getProofDeps, PoofKit, getPastEvents }
const snarkjs = require('@poofcash/snarkjs')
const PoofArtifact = import("../API/ABI/Poof.json")

export default function usePoof(provingSystem: number, isPoof: boolean = true) {
    const { kit, address } = useContractKit()
    const Events = useRef<{ [name: string]: any[] }>({})
    const pk = useSelector(SelectPrivateToken)

    const poof = useMemo(async () => {
        if (isPoof) {
            const poofRes = await Poof;
            return new poofRes.PoofKit(kit.web3)
        }
    }, [kit])
    const relayers = [
        "https://poof.vercel.app",
        "https://adamaris.poofcash.dynv6.net",
        "https://maralago.poofcash.dynv6.net",
        "https://aarde.thkpool.com",
        "https://bellagio.poofcash.dynv6.net"
    ]

    useEffect(() => {
        (async () => {
            if (isPoof) {
                try {
                    const customPoof = await poof;
                    if (!customPoof) throw new Error("Poof is not initialized");
                    customPoof.initialize(() => snarkjs);
                    await init(provingSystem)
                } catch (error: any) {
                    console.error(error.message)
                    throw new Error(error.message)
                }
            }
        })()

    }, [kit])

    const transfer = async (currency: PoofCoinsName, amount: number | string, recipient: string) => {
        try {
            const customPoof = await poof;
            if (!customPoof) throw new Error("Poof is not initialized");
            const poolMatch = await customPoof.poolMatch(currency);

            const status = (await fetch("https://privatecelo.com/v1/status")).ok
            let mainRelayer;
            if (status) {
                mainRelayer = "https://privatecelo.com"
            } else {
                let done = false;
                while (!done) {
                    const selected = relayers[Math.floor(Math.random() * relayers.length)]
                    const status = (await fetch(`${selected}/v1/status`)).ok
                    if (status) {
                        mainRelayer = selected
                        done = true
                    }
                }
            }

            await init(poolMatch.provingSystem);
            const amountIn = kit.web3.utils.toBN(amount)
            const debt = kit.web3.utils.toBN(0)
            const res = await customPoof.withdraw(pk, currency, amountIn, debt, recipient, mainRelayer)

            // const txo = res;
            // const params = {
            //     from: address!,
            //     to: poolMatch.poolAddress,
            //     data: txo.encodeABI(),
            //     gasPrice: kit.web3.utils.toWei('0.5', 'gwei'),
            // };
            // // const gas = await web3.eth.estimateGas(params);
            // const tx = await kit.web3.eth.sendTransaction({ ...params, gas: 1.7e6 });
            // console.log(`Transaction: ${tx.transactionHash}`);

        } catch (error: any) {
            console.error(error.message)
            throw new Error(error.message)
        }
    }

    const balance = async (currency: "CELO_v2" | "cUSD_v2" | "cEUR_v2" | "cREAL_v2" | "CELO_v1" | "cUSD_v1" | "cEUR_v1" | "cREAL_v1") => {
        const customPoof = await poof;
        if (!customPoof) throw new Error("Poof is not initialized");
        const account = await customPoof.getLatestAccount(pk.toLowerCase(), currency, Events.current[currency])
        const unitPerUnderlying = await customPoof.unitPerUnderlying(currency);

        return account ? kit.web3.utils.fromWei(account.amount.div(unitPerUnderlying)) : "0"
    }

    const pastEvents = async (currency: "CELO_v2" | "cUSD_v2" | "cEUR_v2" | "cREAL_v2" | "CELO_v1" | "cUSD_v1" | "cEUR_v1" | "cREAL_v1") => {
        const customPoof = await poof;
        if (!customPoof) throw new Error("Poof is not initialized");
        const poolMatch = await customPoof.poolMatch(currency);
        const poofik = new kit.web3.eth.Contract(
            (await PoofArtifact).abi as AbiItem[],
            poolMatch.poolAddress
        ) as any;
        const events = await (await Poof).getPastEvents(poofik, "NewAccount", poolMatch.creationBlock, await kit.web3.eth.getBlockNumber())
        Events.current[currency] = events
        return events
    }

    const init = async (provingSystem: number) => {
        const customPoof = await poof;
        if (!customPoof) throw new Error("Poof is not initialized");
        const { getProofDeps } = await Poof;
        await getProofDeps([
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/Deposit2.wasm.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/Deposit.wasm.gz",
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/Deposit2_circuit_final.zkey.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/Deposit_circuit_final.zkey.gz",
        ]).then(async (deps) =>
            customPoof.initializeDeposit(
                async () => deps[0],
                async () => deps[1]
            )
        );
        await getProofDeps([
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/Withdraw2.wasm.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/Withdraw.wasm.gz",
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/Withdraw2_circuit_final.zkey.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/Withdraw_circuit_final.zkey.gz",
        ]).then(async (deps) =>
            customPoof.initializeWithdraw(
                async () => deps[0],
                async () => deps[1]
            )
        );
        await getProofDeps([
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/InputRoot.wasm.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/InputRoot.wasm.gz",
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/InputRoot_circuit_final.zkey.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/InputRoot_circuit_final.zkey.gz",
        ]).then(async (deps) =>
            customPoof.initializeInputRoot(
                async () => deps[0],
                async () => deps[1]
            )
        );
        await getProofDeps([
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/OutputRoot.wasm.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/OutputRoot.wasm.gz",
            provingSystem === 1
                ? "https://poof.nyc3.cdn.digitaloceanspaces.com/OutputRoot_circuit_final.zkey.gz"
                : "https://poofgroth.nyc3.cdn.digitaloceanspaces.com/OutputRoot_circuit_final.zkey.gz",
        ]).then(async (deps) =>
            customPoof.initializeOutputRoot(
                async () => deps[0],
                async () => deps[1]
            )
        );

    }

    return { transfer, balance, pastEvents }
}
