import { useContractKit } from "@celo-tools/use-contractkit";
import { GoldTokenWrapper } from "@celo/contractkit/lib/wrappers/GoldTokenWrapper";
import { toTransactionBatch } from "@celo/contractkit/lib/wrappers/MetaTransactionWallet";
import { StableTokenWrapper } from "@celo/contractkit/lib/wrappers/StableTokenWrapper";
import { useSelector } from "react-redux";
import { selectStorage } from "redux/slices/account/storage";
import { AltCoins, CeloCoins, Coins, PoofAltCoins, PoofCoins, PoofCoinsName } from "types";
import _ from 'lodash'
import { DashboardContext } from "layouts/dashboard";
import { useContext } from "react";
import { Contracts } from "./Contracts/Contracts";
import { AbiItem } from "./ABI/AbiItem";
import useGelato from "./useGelato";
import BatchRequestABI from 'rpcHooks/ABI/BatchRequest.json'
import { DateInterval } from "./useContributors";
import useAllowance from './useAllowance'
import useTags, { Tag } from "./useTags";
import usePoof from "hooks/usePoof";
import { fromWei, toWei } from "utils/ray";

const Ether = import("ethers");
const nomAbi = import("rpcHooks/ABI/nom.json")

export interface PaymentInput {
    coin: AltCoins | PoofAltCoins,
    amount: string,
    recipient: string,
    comment?: string,
    from?: boolean
}

export interface Task {
    interval: DateInterval | "instant",
}

export default function useCeloPay() {
    const { kit, address, walletType } = useContractKit()
    const { createTask, getTaskIDs } = useGelato()
    const { allow } = useAllowance()
    const { addTransaction } = useTags()
    const Poof = usePoof(2, walletType === "PrivateKey")

    const { refetch } = useContext(DashboardContext) as { refetch: () => Promise<void> }

    const storage = useSelector(selectStorage)

    const BatchPay = async (inputArr: PaymentInput[], task?: Task, tags?: Tag[]) => {

        if (Object.values(PoofCoins).find((s: AltCoins) => (s.name as string) === (inputArr[0].coin.name as string))) {
            for (let index = 0; index < inputArr.length; index++) {
                const amountWei = toWei(inputArr[index].amount)
                if(Poof){
                    await Poof.transfer(inputArr[index].coin.name as PoofCoinsName, amountWei, inputArr[index].recipient)
                }
            }
            return
        }

        const approveArr = await GroupCoinsForApprove(inputArr)

        for (let index = 0; index < approveArr.length; index++) {
            await allow(approveArr[index].coin.contractAddress, Contracts.BatchRequest.address, approveArr[index].amount.toString())
        }

        const exeTran = await GenerateBatchPay(inputArr)

        const res = await exeTran.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

        if (task) {
            const abi = exeTran.encodeABI()
            for (let index = 0; index < approveArr.length; index++) {
                await allow(approveArr[index].coin.contractAddress, Contracts.Gelato.address, approveArr[index].amount.toString())
            }
            await createTask(Math.floor(new Date().getTime() / 1e3), task.interval, Contracts.BatchRequest.address, abi);
        }
        if (tags && tags.length > 0) {
            for (const tag of tags) {
                await addTransaction(tag.id, res.transactionHash.toLowerCase())
            }
        }

        await refetch()
    }

    const GenerateBatchPay = async (inputArr: PaymentInput[]) => {
        const arr = []

        for (let i = 0; i < inputArr.length; i++) {
            const tx = await GenerateTx(inputArr[i])
            arr.push(tx.txo)
        }

        const input = toTransactionBatch(arr)

        const router = new kit.connection.web3.eth.Contract(
            BatchRequestABI.abi as unknown as AbiItem[], Contracts.BatchRequest.address)

        return await router.methods.executeTransactions(input.destinations, input.values, input.callData, input.callDataLengths)

    }

    const Pay = async ({ coin, amount, recipient, comment }: PaymentInput, task?: Task, tags?: Tag[]) => {
        try {
            if (Object.values(PoofCoins).find((s: AltCoins) => s.name === coin.name)) {
                const amountWei = toWei(amount.toString());
                if(Poof){
                    await Poof.transfer(coin.name as unknown as PoofCoinsName, amountWei, recipient)
                }
                return
            }

            let celotx = await GenerateTx({ coin, amount, recipient, comment });

            let txSend = await celotx.send({ from: address!, gasPrice: toWei("0.5"), gas: 300000 })
            let celoReceipt = await txSend.waitReceipt();
            if (task) {
                let celotx = await GenerateTx({ coin, amount, recipient, comment });
                const abi = celotx.txo.encodeABI()
                await allow((coin as AltCoins).contractAddress, Contracts.Gelato.address, toWei(amount.toString()))
                await createTask(Math.floor(new Date().getTime() / 1e3), task.interval, coin.contractAddress, abi);
            }
            await refetch()

            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    await addTransaction(tag.id, celoReceipt.transactionHash.toLowerCase())
                }
            }
            return {
                from: address!,
                to: recipient,
                value: amount,
                transactionHash: celoReceipt.transactionHash
            };
        } catch (error: any) {
            throw new Error(error)
        }
    }

    const GenerateTx = async ({ coin, amount, recipient, comment, from = false }: PaymentInput) => {
        const amountWei = toWei(amount.toString());

        let nomContract = new kit.web3.eth.Contract(
            (await nomAbi).abi as AbiItem[],
            "0xABf8faBbC071F320F222A526A2e1fBE26429344d"
        )
        const isAddressExist = kit.web3.utils.isAddress(recipient);
        if (!isAddressExist) {
            if (recipient.slice(0, 2) != "0x") {
                recipient = recipient.slice(recipient.length - 4) == ".nom" ? recipient.slice(0, recipient.length - 4) : recipient
                const bytes = (await Ether).utils.formatBytes32String(recipient);
                recipient = await nomContract.methods.resolve(bytes).call();

                if (recipient.slice(0, 7) == "0x00000") throw new Error('There is not any wallet belong this address');
            }
            else throw new Error('There is not any wallet belong this address');
        }

        let token = await (
            async () => {
                if (coin === CeloCoins.CELO) {
                    return await kit.contracts.getGoldToken()
                } else if (coin === CeloCoins.cUSD || coin === CeloCoins.cEUR || coin === CeloCoins.cREAL) {
                    return await kit.contracts.getStableToken((coin.name as unknown) as any)
                } else {
                    if (!comment) {
                        return await kit.contracts.getErc20(coin.contractAddress)
                    }
                    throw Error("If you want to send an altToken, you must not specify a comment")
                }
            }
        )();
        let currentBalance = await token.balanceOf(address!);
        let celoBalance = fromWei(currentBalance)

        if (amount.toString() >= celoBalance)
            throw new Error('Amount exceeds balance');

        return comment
            ? await (token as unknown as GoldTokenWrapper | StableTokenWrapper)
                .transferWithComment(recipient, amountWei, comment)
            : from ? await token.transferFrom(address!, recipient, amountWei) : await token.transfer(recipient, amountWei);
    }

    return { Pay, BatchPay, GenerateTx, GenerateBatchPay };
}


const GroupCoinsForApprove = async (inputArr: PaymentInput[]) => {
    const approveArr: { coin: AltCoins, amount: number }[] = []

    for (let index = 0; index < inputArr.length; index++) {
        const element = inputArr[index];
        if (!approveArr.some(e => e.coin.name === element.coin.name)) {
            approveArr.push({ coin: element.coin as AltCoins, amount: parseFloat(element.amount) })
        } else {
            approveArr.find(e => e.coin.name === element.coin.name)!.amount += parseFloat(element.amount)
        }
    }

    return approveArr;
}