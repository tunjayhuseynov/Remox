import { useContractKit } from "@celo-tools/use-contractkit";
import { StableToken } from "@celo/contractkit";
import { stringToSolidityBytes } from "@celo/contractkit/lib/wrappers/BaseWrapper";
import { GoldTokenWrapper } from "@celo/contractkit/lib/wrappers/GoldTokenWrapper";
import { toTransactionBatch } from "@celo/contractkit/lib/wrappers/MetaTransactionWallet";
import { StableTokenWrapper } from "@celo/contractkit/lib/wrappers/StableTokenWrapper";
import { useSelector } from "react-redux";
import { selectStorage } from "redux/reducers/storage";
import { AltCoins, Coins } from "types";
import _ from 'lodash'

const Ether = import("ethers");
const nomAbi = import("API/ABI/nom.json")

export interface PaymentInput {
    coin: AltCoins,
    amount: string,
    recipient: string,
    comment?: string
}

export default function usePay() {
    const { kit, address, performActions } = useContractKit()
    const storage = useSelector(selectStorage)

    const BatchPay = async (inputArr: PaymentInput[]) => {
        const arr = []
        const approveArr: { coin: AltCoins, amount: number }[] = []

        for (let index = 0; index < inputArr.length; index++) {
            const element = inputArr[index];
            if (!approveArr.some(e => e.coin.name === element.coin.name)) {
                approveArr.push({ coin: element.coin, amount: parseFloat(element.amount) })
            } else {
                approveArr.find(e => e.coin.name === element.coin.name)!.amount += parseFloat(element.amount)
            }
        }

        for (let index = 0; index < approveArr.length; index++) {
            const token = await kit.contracts.getErc20(approveArr[index].coin.contractAddress);
            const approve = token.approve(storage!.contractAddress!, kit.web3.utils.toWei(approveArr[index].amount.toString(), 'ether'))
            await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
        }
        

        for (let i = 0; i < inputArr.length; i++) {
            const tx = await GenerateTx(inputArr[i])
            arr.push(tx.txo)
        }

        const input = toTransactionBatch(arr)

        const router = new kit.connection.web3.eth.Contract(
            [
                {
                    "inputs": [],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                        "indexed": true,
                        "internalType": "address",
                        "name": "destination",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                    },
                    {
                        "indexed": false,
                        "internalType": "bytes",
                        "name": "returnData",
                        "type": "bytes"
                    }
                    ],
                    "name": "TransactionExecution",
                    "type": "event"
                },
                {
                    "constant": false,
                    "inputs": [{
                        "internalType": "address",
                        "name": "destination",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                    }
                    ],
                    "name": "executeTransaction",
                    "outputs": [{
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    }],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "constant": false,
                    "inputs": [{
                        "internalType": "address[]",
                        "name": "destinations",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "values",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "data",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "dataLengths",
                        "type": "uint256[]"
                    }
                    ],
                    "name": "executeTransactions",
                    "outputs": [{
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "",
                        "type": "uint256[]"
                    }
                    ],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                }], storage!.contractAddress!)



        const sender = await router.methods.executeTransactions(input.destinations, input.values, input.callData, input.callDataLengths).send({ from: address!, gas: 210000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
        console.log(sender.transactionHash)
    }

    const Pay = async ({ coin, amount, recipient, comment }: PaymentInput) => {
        try {
            return await performActions(async (kit) => {
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


                let celotx = await GenerateTx({ coin, amount, recipient, comment });
                console.log(celotx.txo.encodeABI())
                let txSend = await celotx.send({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
                let celoReceipt = await txSend.waitReceipt();

                return {
                    from: address!,
                    to: recipient,
                    value: amount,
                    transactionHash: celoReceipt.transactionHash
                };
            })

        } catch (error: any) {
            throw new Error(error)
        }
    }

    const GenerateTx = async ({ coin, amount, recipient, comment }: PaymentInput) => {
        const amountWei = kit.web3.utils.toWei(amount.toString(), 'ether');

        let token = await (
            async () => {
                if (coin === Coins.CELO) {
                    return await kit.contracts.getGoldToken()
                } else if (coin === Coins.cUSD || coin === Coins.cEUR || coin === Coins.cREAL) {
                    return await kit.contracts.getStableToken((coin.name as unknown) as StableToken)
                } else {
                    if (!comment) {
                        return await kit.contracts.getErc20(coin.contractAddress)
                    }
                    throw Error("If you want to send an altToken, you must not specify a comment")
                }
            }
        )();
        let currentBalance = await token.balanceOf(address!);
        let bnBalance = kit.web3.utils.toBN(currentBalance.toString());
        let celoBalance = kit.web3.utils.fromWei(bnBalance.toString(), 'ether');

        if (amount.toString() >= celoBalance)
            throw new Error('Amount exceeds balance');

        return comment
            ? await (token as unknown as GoldTokenWrapper | StableTokenWrapper)
                .transferWithComment(recipient, amountWei, comment)
            : await token.transferFrom(address!, recipient, amountWei);
    }

    return { Pay, BatchPay };
}


export type AbiType = 'function' | 'constructor' | 'event' | 'fallback';
export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable';

export interface AbiItem {
    anonymous?: boolean;
    constant?: boolean;
    inputs?: AbiInput[];
    name?: string;
    outputs?: AbiOutput[];
    payable?: boolean;
    stateMutability?: StateMutabilityType;
    type: AbiType;
    gas?: number;
}

export interface AbiInput {
    name: string;
    type: string;
    indexed?: boolean;
    components?: AbiInput[];
    internalType?: string;
}

export interface AbiOutput {
    name: string;
    type: string;
    components?: AbiOutput[];
    internalType?: string;
}