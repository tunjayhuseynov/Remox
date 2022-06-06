import { useState } from 'react'

export default function useLoading(callback: Function): [boolean, (...type: any) => void] {
    const [isLoading, setLoading] = useState(false)

    const handleLoading = async (...params: any[]) => {
        try {
            setLoading(true)
            await callback(...params)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error(error)
        }
    }

    return [isLoading, handleLoading]
}
