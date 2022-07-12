import { FirestoreRead, FirestoreWrite } from "../rpcHooks/useFirebase";
import { v4 as uuidv4 } from 'uuid'
import { IMember, IContributor } from "rpcHooks/useContributors";
import { auth } from "firebaseConfig";
import { useState } from "react";
import { arrayRemove, arrayUnion, FieldValue } from "firebase/firestore";

export default function useContributors() {
    const [isLoading, setLoading] = useState(false)

    const addTeam = async (team: IContributor) => {
        setLoading(true)
        await FirestoreWrite<IContributor>().createDoc("contributors", team.id, team)
        setLoading(false)
    }

    const removeTeam = async (id: string) => {
        setLoading(true)
        await FirestoreWrite<IContributor>().deleteDocument("contributors", id)
        setLoading(false)
    }


    const editTeam = async (id: string, name: string) => {
        setLoading(true)
        await FirestoreWrite<{ name: string }>().updateDoc("contributors", id, {
            name: name,
        })
        setLoading(false)
    }

    const getMember = async (teamId: string, memberId: string) => {
        try {
            setLoading(true)
            const doc = await FirestoreRead<IContributor>("contributors", teamId)
            setLoading(false)
            return doc?.members.find(m => m.id === memberId)
        } catch (error) {
            console.error(error)
        }
    }

    const addMember = async (id: string, member: IMember) => {
        setLoading(true)
        await FirestoreWrite<{ members: FieldValue }>().updateDoc("contributors", id, {
            members: arrayUnion(member),
        })
        setLoading(false)
    }

    const removeMember = async (teamId: string, memberId: string) => {
        setLoading(true)
        await FirestoreRead<IContributor>("contributors", teamId).then(async (team) => {
            if (team) {
                const member = team.members.find(m => m.id === memberId)
                if (member) {
                    await FirestoreWrite<{ members: FieldValue }>().updateDoc("contributors", teamId, {
                        members: arrayRemove(member),
                    })
                }
            }
        })
        setLoading(false)
    }

    const editMember = async (teamId: string, memberId: string, updatedMember: IMember) => {
        setLoading(true)
        await FirestoreRead<IContributor>("contributors", teamId).then(async (team) => {
            if (team) {
                const member = team.members.find(m => m.id === memberId)
                if (member) {
                    await FirestoreWrite<{ members: FieldValue }>().updateDoc("contributors", teamId, {
                        members: arrayRemove(member),
                    })
                    await FirestoreWrite<{ members: FieldValue }>().updateDoc("contributors", updatedMember.teamId, {
                        members: arrayUnion(updatedMember),
                    })
                }
            }
        })
        setLoading(false)
    }

    return { addTeam, removeTeam, editTeam, addMember, removeMember, editMember, getMember, isLoading };
}
