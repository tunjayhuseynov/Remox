import { IAccount, IIndividual, IOrganization } from "firebaseConfig"
import { IRemoxData } from "../remoxData"
import { IStorage } from "../storage"

export default {
    setOrganization: (state: IRemoxData, action: { payload: IOrganization }) => {
        if (state.storage) {
            state.storage.organization = action.payload
            state.storage.signType = "organization"
            const val = localStorage.getItem("remoxUser")
            if (val) {
                const data: IStorage = JSON.parse(val)
                data.organization = action.payload
                data.signType = "organization"
                localStorage.setItem("remoxUser", JSON.stringify(data))
            }
        }
    },
    setIndividual: (state: IRemoxData, action: { payload: IIndividual }) => {
        if (state.storage) {
            state.storage.individual = action.payload
            state.storage.signType = "individual"
            const val = localStorage.getItem("remoxUser")
            if (val) {
                const data: IStorage = JSON.parse(val)
                data.individual = action.payload
                data.signType = "individual"
                localStorage.setItem("remoxUser", JSON.stringify(data))
            }
        } else {
            state.storage = {
                individual: action.payload,
                signType: "individual",
                lastSignedProviderAddress: "",
                organization: null,
                uid: "",
            }
            localStorage.setItem("remoxUser", JSON.stringify(state.storage))
        }
    },
    setStorage: (state: IRemoxData, action: { payload: IStorage }) => {
        localStorage.setItem("remoxUser", JSON.stringify(action.payload))
        const data: IStorage = action.payload
        state.storage = data
    },
    removeStorage: (state: IRemoxData) => {
        localStorage.removeItem("remoxUser")
        state.storage = null;
    }
}