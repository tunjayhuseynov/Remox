import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectUnlock } from 'redux/reducers/unlock'
import { useEffect } from 'react'
import { isUserAllowToSystem } from 'hooks/singingProcess/utils'

export default function Guard({ children }: { children: JSX.Element }) {
    // const isUnlock = useSelector(selectUnlock)
    const router = useRouter()

    useEffect(() => {
        if (!isUserAllowToSystem()) router.push("/choose-type")
    }, [])

    if (!isUserAllowToSystem()) return <></>
    return (
        <>{children}</>
    )
}
