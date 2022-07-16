import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IContributor } from "types/dashboard/contributors";

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse<IContributor[]>
) {
    try {
        const id = req.query.id;

        if (!id) throw new Error("No id provided")

        const list: IContributor[] = []
        const collection = await adminApp.firestore().collection("contributors").where("userId", "==", id).get()

        for (const doc of collection.docs) {
            const contributor = doc.data() as IContributor
            if (!contributor) continue
            list.push(contributor);
        }

        res.status(200).json(list);
    } catch (error) {
        console.log((error as any).message)
        res.status(500).json({ error: (error as any).message } as any);
    }
}
