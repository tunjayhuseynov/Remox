import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectUnlock } from 'redux/reducers/unlock'
import { useEffect } from 'react'

export default function Guard({ children }: { children: JSX.Element }) {
    const isUnlock = useSelector(selectUnlock)
    const router = useRouter()

    useEffect(() => {
        if (isUnlock === false) router.push("/unlock")
    }, [])

    if(isUnlock === false) return <></>
    return (
        <>{children}</>
    )
}
