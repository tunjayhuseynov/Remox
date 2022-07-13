import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Tag } from "rpcHooks/useTags";


export default async function FetchTags(
    req: NextApiRequest,
    res: NextApiResponse<Tag[]>
) {
    try {
        const id = req.query.id;
        if (!id) throw new Error("No id provided");

        const tagRefs = await adminApp.firestore().collection("tags").doc(id as string).get()

        const tagContainer = tagRefs.data() as { tags: Tag[] }

        const tags: Tag[] = []
        if (tagContainer) {
            tags.push(...tagContainer.tags)
        }

        return res.status(200).json(tags)
    } catch (error) {
        return res.status(500).json({ error: (error as any).message } as any)
    }
}