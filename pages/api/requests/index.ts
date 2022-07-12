import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IRequest } from "rpcHooks/useRequest";


export default async function fetchRequests(req: NextApiRequest, res: NextApiResponse<IRequest[]>) {
    try {
        const id = req.query.id;
        if (!id) throw new Error("No id provided");

        const requests: IRequest[] = []
        const requestRefs = await adminApp.firestore().collection("requests").doc(id as string).get();

        if (requestRefs.exists) {
            const request = requestRefs.data() as { requests: IRequest[] }
            if (request) {
                requests.push(...request.requests);
            }
        };

        res.status(200).json(requests);
    }
    catch (error) {
        res.status(500).json({ error: (error as any).message } as any);
    }
}