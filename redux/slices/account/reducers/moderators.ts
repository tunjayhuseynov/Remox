import { Image, IModerator } from "firebaseConfig";
import { IRemoxData } from "../remoxData";


export default {
    AddModerator: (state: IRemoxData, action: { payload: IModerator }) => {
        if (state.storage?.organization) {
            state.storage.organization.moderators = [...state.storage.organization.moderators, action.payload]
        } else if (state.storage?.individual) {
            state.storage.individual.moderators = [...state.storage.individual.moderators, action.payload]
        }
    },
    RemoveModerator: (state: IRemoxData, action: { payload: string }) => {
        if (state.storage?.organization) {
            state.storage.organization.moderators = state.storage.organization.moderators.filter(s => s.id === action.payload)
        } else if (state.storage?.individual) {
            state.storage.individual.moderators = state.storage.individual.moderators.filter(s => s.id === action.payload)
        }
    },
    UpdateModeratorName: (state: IRemoxData, action: { payload: { id: string, name: string } }) => {
        if (state.storage?.organization) {
            const id = state.storage.organization.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.organization.moderators[id].name = action.payload.name
            }
        } else if (state.storage?.individual) {
            const id = state.storage.individual.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.individual.moderators[id].name = action.payload.name
            }
        }
    },
    UpdateModeratorEmail: (state: IRemoxData, action: { payload: { id: string, email: string } }) => {
        if (state.storage?.organization) {
            const id = state.storage.organization.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.organization.moderators[id].mail = action.payload.email
            }
        } else if (state.storage?.individual) {
            const id = state.storage.individual.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.individual.moderators[id].mail = action.payload.email
            }
        }
    },
    UpdateModeratorImage: (state: IRemoxData, action: { payload: { id: string, image: Image } }) => {
        if (state.storage?.organization) {
            const id = state.storage.organization.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.organization.moderators[id].image = action.payload.image
            }
        } else if (state.storage?.individual) {
            const id = state.storage.individual.moderators.findIndex(s => s.id === action.payload.id)
            if (id !== -1) {
                state.storage.individual.moderators[id].image = action.payload.image
            }
        }
    },
}