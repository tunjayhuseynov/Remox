import { useContractKit } from '@celo-tools/use-contractkit';
import Gelato from 'API/ABI/Gelato.json'
import { useState } from 'react';
import { AbiItem } from './ABI/AbiItem';
import { Contracts } from './Contracts/Contracts';
import { DateInterval } from './useContributors';

export default function useGelato() {
    const { kit, address } = useContractKit()
    const [loading, setLoading] = useState(false)

    const router = new kit.connection.web3.eth.Contract(
        Gelato as unknown as AbiItem[],
        Contracts.Gelato.address
    );


    const cancelTask = async (taskId: string) => {
        setLoading(true)
        const command = router.methods.cancelTask(taskId);

        try {
            const tx = await command.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            console.error(error)
            throw new Error(error.message)
        }
    }

    const updateTime = async (taskId: string, startTime: number | string, interval: DateInterval | "instant") => {
        setLoading(true)
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
        const command = router.methods.updateTime(taskId, startDate, timeInterval);

        const tx = await command.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
        setLoading(false)
    }
    const updateAddress = async (taskId: string, address: string) => {
        setLoading(true)
        const command = router.methods.updateAddress(taskId, address);

        const tx = await command.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
        setLoading(false)
    }
    const updateCommand = async (taskId: string, execCommand: string) => {
        setLoading(true)
        const command = router.methods.updateCommand(taskId, execCommand);

        const tx = await command.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
        setLoading(false)
    }

    const createTask = async (startDate: number, interval: DateInterval | "instant", executionAddress: string, executionCommand: string) => {
        setLoading(true)
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

        const timeTask = router.methods.createTimedTask( // start date, interval, exec address, exec command, resolver address, resolver command, feeToken, _useTreasury
            startDate, timeInterval,
            executionAddress, executionCommand.slice(0, 10),
            executionCommand, address!, executionCommand,
            executionAddress, false
        )

        try {
            const resolver = router.methods.getResolverHash(address!, executionCommand)
            const resolverHash = await resolver.call({ from: address! })
            const taskId = router.methods.getTaskId(address!, executionAddress, executionCommand.slice(0, 10), false, executionAddress, resolverHash)
            const taskIdHash = await taskId.call({ from: address! })

            const res = await timeTask.send({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei'), gas: 5000000 })
            setLoading(false)
            return taskIdHash;
        } catch (error: any) {
            setLoading(false)
            console.error(error)
            throw new Error("You've already created a task with this command")
        }
    }

    const getTaskIDs = async (): Promise<string[]> => {
        setLoading(true)
        const getTaskIDs = router.methods.getTaskIdsByUser(address!)

        const res = await getTaskIDs.call({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei'), gas: 300000 })
        setLoading(false)
        return res;
    }

    const getTime = async (taskId: string) => {
        setLoading(true)
        const command = router.methods.timedTask(taskId);

        const tx = await command.call({ from: address! });
        setLoading(false)
        return tx;
    }
    const getDetails = async (taskId: string) => {
        setLoading(true)
        const command = router.methods.getDetails(taskId);

        const tx = await command.call({ from: address! });
        setLoading(false)
        return tx;
    }


    return { createTask, getTaskIDs, updateTime, updateCommand, updateAddress, getTime, getDetails, cancelTask, loading };
}
