import { useContractKit } from '@celo-tools/use-contractkit';
import { useRefetchData } from 'hooks';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { deleteBalance } from 'redux/reducers/currencies';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { removeTransactions } from 'redux/reducers/transactions';

export default function Layout() {
    const { kit } = useContractKit()

    const [refetch] = useRefetchData()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(SelectSelectedAccount)

    useEffect(() => {
        (async () => {
            console.log((await kit.contracts.getStableToken()).methodIds)
        })()
    }, [])

    useEffect(() => {
        dispatch(removeTransactions())
        dispatch(deleteBalance())
        refetch()
    }, [selectedAccount])

    return <>
        <Outlet />
    </>;
}
