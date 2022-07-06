import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectUnlock } from 'redux/slices/unlock'
import { useEffect } from 'react'
import { isUserAllowToSystem } from 'hooks/singingProcess/utils'
import { useWalletKit } from 'hooks'

export default function Guard({ children }: { children: JSX.Element }) {
    // const isUnlock = useSelector(selectUnlock)
    // const router = useRouter()
    // const { Connected } = useWalletKit()

    // useEffect(() => {
    //     if (!isUserAllowToSystem() && !Connected) router.push("/")
    // }, [])

    // if (!isUserAllowToSystem()) return <></>
    return (
        <>{children}</>
    )
}
