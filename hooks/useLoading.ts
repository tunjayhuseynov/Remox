import { useCallback, useState } from 'react'

export default function useLoading(callback: Function): [boolean, (...type: any) => void] {
    const [isLoading, setLoading] = useState(false)

    const handleLoading = useCallback(async (...params: any[]) => {
        try {
            setLoading(true)
            await callback(...params)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error(error)
        }
    }, [callback])

    return [isLoading, handleLoading]
}
