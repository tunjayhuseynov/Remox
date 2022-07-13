import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { IRequest, RequestStatus } from "rpcHooks/useRequest"
import { arrayRemove, arrayUnion, FieldValue } from "firebase/firestore"
import { useState } from "react"

export default function useRequest() {

    const [loading, isLoading] = useState(false)
    const [genLoading, setGenLoading] = useState(false)
    
    const approveRequest = async (id: string, request: IRequest) => {
        isLoading(true)
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayRemove(request)
        })
        const req = { ...request, status: RequestStatus.approved }
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayUnion(req)
        })
        isLoading(false)
    }

    const rejectRequest = async (id: string, request: IRequest) => {
        isLoading(true)
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayRemove(request)
        })
        const req = { ...request, status: RequestStatus.rejected }
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayUnion(req)
        })
        isLoading(false)
    }

    const addRequest = async (documentId: string, request : IRequest) => {
        isLoading(true)
        
        if (request.secondaryAmount && request.secondaryCurrency) {
            request.secondaryAmount = request.secondaryAmount
            request.secondaryCurrency = request.secondaryCurrency
        }
        if (request.attachLink) {
            request.attachLink = request.attachLink
        }
        if (request.uploadedLink) {
            request.uploadedLink = request.uploadedLink
        }

        try {
            const data = await FirestoreRead<{ requests: IRequest[] }>("requests", documentId)
            if (data) {
                await FirestoreWrite<{ requests: FieldValue }>().updateDoc("requests", documentId, {
                    requests: arrayUnion(request)
                })
            } else {
                await FirestoreWrite<{ requests: IRequest[] }>().createDoc("requests", documentId, {
                    requests: [request]
                })
            }
            isLoading(false)
        } catch (error) {
            console.error(error)
            isLoading(false)
            throw new Error("Something went wrong")
        }
    }

    return { loading, genLoading, setGenLoading, addRequest, approveRequest, rejectRequest };
}