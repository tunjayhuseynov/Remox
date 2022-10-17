import axios from "axios";
import { accountCollectionName } from "crud/account";
import { organizationCollectionName } from "crud/organization";
import { IAccount, IIndividual, IOrganization } from "firebaseConfig";
import { adminApp } from "firebaseConfig/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Blockchains } from "types/blockchains";
import { BASE_URL } from "utils/api";
import { generatePriceCalculation } from "utils/const";
import { toChecksumAddress } from "web3-utils";
import { IRemoxAccountORM } from "../account/multiple.api";
import { IMultisigOwners } from "../multisig/owners.api";


const AllOrganizations = async (req: NextApiRequest, res: NextApiResponse<IOrganization[]>) => {
    try {
        const { address } = req.query;
        if (typeof address !== "string") throw new Error("Invalid address");

        const pendingListOrganization = await adminApp.firestore().collection(organizationCollectionName).where(
            "pendingMembers", "array-contains", toChecksumAddress(address as string)
        ).get()

        if (pendingListOrganization.docs.length > 0) {
            for (const { data } of pendingListOrganization.docs) {
                const organization = data() as IOrganization;
                for (const pendingMember of organization.pendingMembersObjects) {
                    const accountRef = await adminApp.firestore().collection("accounts").doc(pendingMember.accountId).get()
                    const account = accountRef.data() as IAccount;
                    const { data: owners } = await axios.get<IMultisigOwners>(BASE_URL + "/api/multisig/owners", {
                        params: {
                            blockchain: account.blockchain,
                            address: account.address,
                            providerName: account.provider,
                        }
                    })
                    if (owners.owners.includes(pendingMember.member) && !account.members.find(s => s.address.toLowerCase() === pendingMember.member.toLowerCase())) {
                        const newMembers = [...account.members, pendingMember.memberObject];
                        await adminApp.firestore().collection("accounts").doc(pendingMember.accountId).update({
                            members: newMembers
                        })
                        await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                            pendingMembersObjects: organization.pendingMembersObjects.filter(s => s.member !== pendingMember.member && s.accountId !== pendingMember.accountId),
                            pendingMember: organization.pendingMembers.filter(s => s.toLowerCase() !== pendingMember.member.toLowerCase()),
                            members: [...organization.members, pendingMember.member]
                        })
                    } else if (owners.owners.includes(pendingMember.member) && account.members.find(s => s.address.toLowerCase() === pendingMember.member.toLowerCase())) {
                        await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                            pendingMembersObjects: organization.pendingMembersObjects.filter(s => s.member !== pendingMember.member && s.accountId !== pendingMember.accountId),
                            pendingMember: organization.pendingMembers.filter(s => s.toLowerCase() !== pendingMember.member.toLowerCase()),
                            members: [...organization.members.filter(s => s.toLowerCase() !== pendingMember.member), pendingMember.member]
                        })
                    }
                }
            }
        }

        const removableListOrganization = await adminApp.firestore().collection(organizationCollectionName).where(
            "removableMembers", "array-contains", toChecksumAddress(address as string)
        ).get()

        if (removableListOrganization.docs.length > 0) {
            for (const { data } of removableListOrganization.docs) {
                const organization = data() as IOrganization;
                for (const removableMember of organization.removableMembersObjects) {
                    const accountRef = await adminApp.firestore().collection("accounts").doc(removableMember.accountId).get()
                    const account = accountRef.data() as IAccount;
                    const { data: owners } = await axios.get<IMultisigOwners>(BASE_URL + "/api/multisig/owners", {
                        params: {
                            blockchain: account.blockchain,
                            address: account.address,
                            providerName: account.provider,
                        }
                    })
                    if (!owners.owners.includes(removableMember.member) && account.members.find(s => s.address.toLowerCase() === removableMember.member.toLowerCase())) {
                        const newMembers = account.members.filter(s => s.address.toLowerCase() !== removableMember.member.toLowerCase());
                        await adminApp.firestore().collection("accounts").doc(removableMember.accountId).update({
                            members: newMembers
                        })
                        await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                            removableMembersObjects: organization.pendingMembersObjects.filter(s => s.member !== removableMember.member && s.accountId !== removableMember.accountId),
                            removableMembers: organization.pendingMembers.filter(s => s.toLowerCase() !== removableMember.member.toLowerCase()),
                            members: organization.members.filter(s => s.toLowerCase() !== removableMember.member.toLowerCase())
                        })
                    } else if (!owners.owners.includes(removableMember.member) && !account.members.find(s => s.address.toLowerCase() === removableMember.member.toLowerCase())) {
                        await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                            removableMembersObjects: organization.pendingMembersObjects.filter(s => s.member !== removableMember.member && s.accountId !== removableMember.accountId),
                            removableMembers: organization.pendingMembers.filter(s => s.toLowerCase() !== removableMember.member.toLowerCase()),
                            members: organization.members.filter(s => s.toLowerCase() !== removableMember.member.toLowerCase())
                        })
                    }
                }
            }
        }

        const organizationDocs = await adminApp.firestore().collection(organizationCollectionName).where(
            "members", "array-contains", toChecksumAddress(address as string)
        ).get()

        const organizations = organizationDocs.docs.map(s => s.data()) as IOrganization[]

        // for (const organization of organizations) {
        //     if (!organization?.notes) {
        //         await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
        //             notes: []
        //         })
        //         organization["notes"] = [];
        //     }
        //     organization.accounts = await Promise.all(organization.accounts.map(async (accountId) => {
        //         const { data } = await axios.get(BASE_URL + '/api/account', {
        //             params: {
        //                 id: accountId.id,
        //                 accountId: organization.id
        //             }
        //         })
        //         // const accountRef = await adminApp.firestore().collection("accounts").doc(accountId.id).get()
        //         // const account = accountRef.data() as IAccount;
        //         return data;
        //     }))

        // }
        const orgList = await Promise.all(organizations.map(async organization => {
            if (!organization?.notes) {
                await adminApp.firestore().collection(organizationCollectionName).doc(organization.id).update({
                    notes: []
                })
                organization["notes"] = [];
            }
            organization.accounts = await Promise.all(organization.accounts.map(async (accountId) => {
                const { data } = await axios.get(BASE_URL + '/api/account', {
                    params: {
                        id: accountId.id,
                        accountId: organization.id,
                        txDisabled: false
                    }
                })
                // const accountRef = await adminApp.firestore().collection("accounts").doc(accountId.id).get()
                // const account = accountRef.data() as IAccount;
                return data;
            }))
            return organization;
        }))

        return res.json(orgList);
    } catch (error) {
        throw error;
    }
}

export default AllOrganizations;