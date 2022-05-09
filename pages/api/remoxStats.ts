import { FirestoreRead, FirestoreReadMultiple } from "apiHooks/useFirebase";
import axios from "axios";
import { IUser } from "firebaseConfig";
import { Balance } from "hooks/useCalculation";
import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL, BlockchainType, Collection } from "utils/api";
import { IPriceResponse } from "./calculation/price";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {

        let allCeloAddresses : string[] = []

        const users = await FirestoreReadMultiple<IUser>("users", [
            { condition: ">", firstQuery: "timestamp", secondQuery: 0 }
        ])


        for (const user of users) {
            if(typeof user.address === "string" && (user.address as string).startsWith("0x")){
                allCeloAddresses.push(user.address as string)
            }else if(typeof user.address === "object"){
                for (const address of user.address) {
                    if(address.startsWith("0x")){
                        allCeloAddresses.push(address)
                    }
                }
            }
        }

        const prices = await axios.get<IPriceResponse>(BASE_URL + "/api/calculation/price", {
            params: {
                addresses: allCeloAddresses,
                blockchain: "celo"
            }
        })


        res.status(200).json({
            TotalBalance: prices.data.TotalBalance
        })
    } catch (error) {
        res.json(error as any)
        res.status(405).end()
    }
}