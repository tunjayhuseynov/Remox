import { FirestoreRead, FirestoreWrite } from "API/useFirebase"
import { IRequest, RequestStatus } from "API/useRequest"
import { arrayRemove, arrayUnion, FieldValue } from "firebase/firestore"
import { useState } from "react"
import { generate } from "shortid"

export default function useRequest() {

    const [loading, isLoading] = useState(false)
    const [genLoading, setGenLoading] = useState(false)

    const approveRequest = async (id: string, request: IRequest) => {
        isLoading(true)
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayRemove(request)
        })
        const req = {...request, status: RequestStatus.approved}
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
        const req = {...request, status: RequestStatus.rejected}
        await FirestoreWrite<{ requests: FieldValue }>().updateDoc('requests', id, {
            requests: arrayUnion(req)
        })
        isLoading(false)
    }

    const addRequest = async (documentId: string, params: Omit<Omit<Omit<IRequest, "id">, "status">, "timestamp">) => {
        isLoading(true)
        const request: IRequest = {
            id: generate(),
            usdBase: params.usdBase,
            name: params.name,
            address: params.address,
            amount: params.amount,
            currency: params.currency,

            requestType: params.requestType,
            nameOfService: params.nameOfService,
            serviceDate: params.serviceDate,

            timestamp: new Date().getTime(),
            status: RequestStatus.pending,
        }
        if (params.secondaryAmount && params.secondaryCurrency) {
            request.secondaryAmount = params.secondaryAmount
            request.secondaryCurrency = params.secondaryCurrency
        }
        if (params.attachLink) {
            request.attachLink = params.attachLink
        }
        if (params.uploadedLink) {
            request.uploadedLink = params.uploadedLink
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