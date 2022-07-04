import { useEffect } from "react"

export default function useAsyncEffect(callback: () => Promise<any>, listen: any[] = []) {
    useEffect(() => {
        callback()
    }, [...listen])
}
