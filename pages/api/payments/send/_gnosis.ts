import { Coins } from "types";
import { IPaymentInput, ISendTx } from "./index.api";
import { GenerateTx } from "./_celo";

export const CreateTransactionGnosis = async (requests: IPaymentInput[], fromAddress: string, coin: Coins): Promise<ISendTx | ISendTx[]> => {
    if (requests.length === 1) {
        return {
            data: await GenerateTx(requests[0], fromAddress, coin),
            value: 0,
            destination: coin[requests[0].coin].address
        }
    } else {
        return await Promise.all(requests.map(async s => {
            return {
                data: await GenerateTx(s, fromAddress, coin),
                value: 0,
                destination: coin[s.coin].address
            }
        }))
    }
}