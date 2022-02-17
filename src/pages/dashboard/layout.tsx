import { useRefetchData } from 'hooks';
import { useEffect, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { deleteBalance } from 'redux/reducers/currencies';
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { removeTransactions } from 'redux/reducers/transactions';
import { useIdleTimer } from 'react-idle-timer'
import { setUnlock } from 'redux/reducers/unlock';

export const DashboardContext = createContext({})


export default function Layout() {

    const [refetch] = useRefetchData()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(SelectSelectedAccount)

    useEffect(() => {
        dispatch(removeTransactions())
        dispatch(deleteBalance())
        refetch()
    }, [selectedAccount])

    useIdleTimer({
        timeout: 1000 * 60 * 5,
        onIdle: () => dispatch(setUnlock(false)),
    })

    return <>
        <DashboardContext.Provider value={{ refetch }}>
            <Outlet />
        </DashboardContext.Provider>
    </>;
}
