import Gelato from 'rpcHooks/ABI/Gelato.json'
import { AbiItem } from './ABI/AbiItem';
import { Contracts } from './Contracts/Contracts';
import { DateInterval } from 'types/dashboard/contributors';
import { IAccount } from 'firebaseConfig';
import Web3 from 'web3'
import useMultisig from 'hooks/walletSDK/useMultisig';
import { GetTime } from 'utils';
import { FirestoreWrite } from './useFirebase';
import { useAppSelector } from 'redux/hooks';
import { SelectID } from 'redux/slices/account/selector';
import { useCelo } from '@celo/react-celo';

export interface ITasking {
    accountId: string;
    taskId: string,
    sender: string,
    recipient: string,
    blockchain: string,
    protocol: string
}

export default function useTasking() {
    const { address } = useCelo()
    const { submitTransaction } = useMultisig()

    const cancelTask = async (taskId: string) => {
        try {
            const web3 = new Web3((window as any).celo)
            const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

            const command = await contract.methods.cancelTask(taskId).send({
                from: address!,
                gas: 300000,
                gasPrice: '50000000000'
            });

        } catch (error: any) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    const updateTime = async (taskId: string, startTime: number | string, interval: DateInterval | "instant") => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const startDate = Math.floor(new Date(startTime).getTime() / 1000)
        let timeInterval;
        if (interval === DateInterval.daily) {
            timeInterval = 60 * 60 * 24
        } else if (interval === DateInterval.weekly) {
            timeInterval = 60 * 60 * 24 * 7
        } else if (interval === "instant") {
            timeInterval = 1;
        }
        else {
            timeInterval = 60 * 60 * 24 * 30
        }
        const command = await contract.methods.updateTime(taskId, startDate, timeInterval).send({
            from: address!,
            gas: 300000,
            gasPrice: '50000000000'
        });

    }

    const updateAddress = async (taskId: string, address: string) => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const command = await contract.methods.updateAddress(taskId, address).send({
            from: address!,
            gas: 300000,
            gasPrice: '50000000000'
        });

    }

    const updateCommand = async (taskId: string, execCommand: string) => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const command = await contract.methods.updateCommand(taskId, execCommand).send({
            from: address!,
            gas: 300000,
            gasPrice: '50000000000'
        });

    }

    // CELO
    const createTask = async (account: IAccount, startDate: number, interval: DateInterval | "instant" | number, executionAddress: string, executionCommand: string) => {
        try {
            let timeInterval;
            if (interval === DateInterval.daily) {
                timeInterval = 60 * 60 * 24
            } else if (interval === DateInterval.weekly) {
                timeInterval = 60 * 60 * 24 * 7
            } else if (interval === "instant") {
                timeInterval = 1;
            } else if (typeof interval === "number") {
                const diff = interval - GetTime();
                if (diff < 0) throw new Error("Invalid interval")
                timeInterval = diff;
            }
            else {
                timeInterval = 60 * 60 * 24 * 30
            }

            const web3 = new Web3((window as any).celo)
            const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

            const createProcess = contract.methods.createTimedTask( // start date, interval, exec address, exec command, resolver address, resolver command, feeToken, _useTreasury
                startDate, timeInterval,
                executionAddress, executionCommand.slice(0, 10),
                executionCommand, address!, executionCommand,
                executionAddress, false
            )

            if (account.signerType === "multi") {
                const txHash = await submitTransaction(account.address, createProcess.encodeABI(), Contracts.Gelato.address)

                return txHash;
            }

            await createProcess.send({
                from: account.address,
                gas: 300000,
                gasPrice: '50000000000'
            })

            const resolverHash = await contract.methods.getResolverHash(address!, executionCommand).call()
            const taskIdHash = await contract.methods.getTaskId(address!, executionAddress, executionCommand.slice(0, 10), false, executionAddress, resolverHash).call()

            await FirestoreWrite<ITasking>().createDoc("recurring", taskIdHash, {
                accountId: account.id,
                taskId: taskIdHash,
                sender: account.address,
                recipient: executionAddress,
                blockchain: "celo",
                protocol: "gelato"
            })


            return taskIdHash as string;
        } catch (error: any) {
            console.error(error)
            throw new Error("You've already created a task with this command")
        }
    }

    const getTaskIDs = async (): Promise<string[]> => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const getTaskID = await contract.methods.getTaskIdsByUser(address!).call()

        return getTaskID;
    }

    const getTime = async (taskId: string) => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const command = await contract.methods.timedTask(taskId).call();

        const tx = await command.call({ from: address! });
        return tx;
    }
    const getDetails = async (taskId: string) => {
        const web3 = new Web3((window as any).celo)
        const contract = new web3.eth.Contract(Gelato as AbiItem[], Contracts.Gelato.address)

        const command = await contract.methods.getDetails(taskId).call();

        return command;
    }


    return { createTask, getTaskIDs, updateTime, updateCommand, updateAddress, getTime, getDetails, cancelTask };
}
