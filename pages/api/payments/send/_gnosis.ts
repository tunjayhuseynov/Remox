import { Coins } from "types";
import { IPaymentInput, ISendTx } from "./index.api";
import { GenerateTx } from "./_celo";

export const CreateTransactionGnosis = async (requests: IPaymentInput[], fromAddress: string, coin: Coins): Promise<ISendTx | ISendTx[]> => {
    if (requests.length === 1) {
        if (coin[requests[0].coin].address === "0x0000000000000000000000000000000000000000") {
            return {
                data: "0x",
                destination: requests[0].recipient,
                value: requests[0].amount
            }
        }
        return {
            data: await GenerateTx(requests[0], fromAddress, coin),
            value: 0,
            destination: coin[requests[0].coin].address
        }
    } else {
        return await Promise.all(requests.map(async s => {
            if (coin[s.coin].address === "0x0000000000000000000000000000000000000000") {
                return {
                    data: "0x",
                    destination: s.recipient,
                    value: s.amount
                }
            }
            return {
                data: await GenerateTx(s, fromAddress, coin),
                value: 0,
                destination: coin[s.coin].address
            }
        }))
    }
}