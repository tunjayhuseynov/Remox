import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";

export interface ITxTag {
    id: string;
    address: string;
    hash: string;
}

export interface ITag {
    id: string;
    name: string;
    color: string;
    transactions: ITxTag[],
    isDefault: boolean;
}

export default async function FetchTags(
    req: NextApiRequest,
    res: NextApiResponse<ITag[]>
) {
    try {
        const id = req.query.id;
        if (!id) throw new Error("No id provided");

        const tagRefs = await adminApp.firestore().collection("tags").doc(id as string).get()

        const tagContainer = tagRefs.data() as { tags: ITag[] }

        const tags: ITag[] = []
        if (tagContainer) {
            tags.push(...tagContainer.tags)
        }

        return res.status(200).json(tags)
    } catch (error) {
        return res.status(500).json({ error: (error as any).message } as any)
    }
}