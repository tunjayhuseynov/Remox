import { Dispatch, useCallback, useEffect, useRef } from "react"


const useModalSideExit = <Type extends {}>(isSetting: Type, setSetting: Dispatch<Type>, defaultValue: Type) => {
    const settingRef = useRef<HTMLDivElement>(null)
    const exceptionRef = useRef<HTMLDivElement>(null)
    const click = useCallback((e: any) => {
        if (isSetting && settingRef.current && !settingRef.current.contains(e.target) && ((exceptionRef.current && !exceptionRef.current?.contains(e.target)) || (!exceptionRef.current))) {
            setSetting(defaultValue)
        }
    }, [isSetting])

    useEffect(() => {
        window.addEventListener('click', click)

        return () => window.removeEventListener('click', click)
    }, [click, settingRef])

    return [settingRef, exceptionRef];
}

export default useModalSideExit;