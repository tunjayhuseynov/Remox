import { useEffect } from "react"

export default function useAsyncEffect(callback: () => Promise<void>, listen: any[] = []) {
    useEffect(() => {
        callback()
    }, [...listen])
}
