import { auth } from "firebaseConfig";
import useNextSelector from "hooks/useNextSelector";
import { useMemo } from "react";
import { selectStorage } from "redux/reducers/storage";

export default function useStorage() {
    const storage = useNextSelector(selectStorage)
    const isOrg = !(!storage?.organization)

    const getName = useMemo(() => isOrg ? storage.organization?.name : storage?.individual?.name, [storage]);
    const getId = useMemo(() => isOrg ? storage.organization?.id : storage?.individual?.id, [storage]);
    const getAccounts = useMemo(() => isOrg ? storage.organization?.accounts : storage?.individual?.accounts, [storage]);
    const getSeenTime = useMemo(() => storage?.individual?.seenTime, [storage])
    const getMembers = useMemo(() => isOrg ? storage.organization?.members : storage?.individual.members, [storage])
    

    return {
        getName,
        getId,
        getAccounts,
        getSeenTime,
        getMembers
    }


}
