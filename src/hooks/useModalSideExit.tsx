import { Dispatch, useCallback, useEffect, useRef } from "react"


const useModalSideExit = (isSetting: boolean, setSetting: Dispatch<boolean>) => {
    const settingRef = useRef<HTMLDivElement>(null)
    const click = useCallback((e) => {
        if (isSetting && settingRef.current && !settingRef.current.contains(e.target)) {
            setSetting(false)
        }
    }, [isSetting])

    useEffect(() => {
        window.addEventListener('click', click)

        return () => window.removeEventListener('click', click)
    }, [click, settingRef])

    return settingRef;
}

export default useModalSideExit;