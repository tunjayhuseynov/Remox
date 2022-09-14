import Button from "components/button";
import { IIndividual, IOrganization } from "firebaseConfig";
import useLoading from "hooks/useLoading";
import { IAccountORM } from "pages/api/account/index.api";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccountType, SelectRemoxAccount } from "redux/slices/account/selector";
import { Remove_Account_From_Individual, Remove_Account_From_Organization } from "redux/slices/account/thunks/account";

const DeleteWallet = ({ name, onDisable, account }: { name?: string, account: IAccountORM, onDisable: React.Dispatch<boolean> }) => {

    const dispatch = useAppDispatch()
    const accountType = useAppSelector(SelectAccountType)
    const getAccount = useAppSelector(SelectRemoxAccount)

    const deleteAccount = async () => {
        if (accountType === "individual" && getAccount) {
            await dispatch(Remove_Account_From_Individual({
                account: account,
                individual: getAccount as IIndividual,
                userId: getAccount.id
            }))
        } else if (getAccount) {
            await dispatch(Remove_Account_From_Organization({
                account: account,
                organization: getAccount as IOrganization,
                userId: getAccount.id
            }))
        }
    }

    const [isLoading, Delete] = useLoading(deleteAccount)

    return <div className="flex flex-col space-y-8 items-center">
        <div className="text-2xl text-primary">Are You Sure?</div>
        <div className="flex items-center justify-center text-xl">
            Your are about to delete this wallet.
        </div>
        <div className="flex justify-center items-center space-x-3">
            <Button version="second" className="border-2  w-[7rem] h-[3rem] !px-4 !py-0" onClick={() => { onDisable(false) }}>No</Button>
            <Button className="  w-[7rem] h-[3rem] !px-4 !py-0" onClick={Delete} isLoading={isLoading}>Yes</Button>
        </div>
    </div>
}

export default DeleteWallet;