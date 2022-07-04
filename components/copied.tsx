import React, { useEffect } from 'react'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { useSelector } from 'react-redux';
import { selectDarkMode } from 'redux/slices/notificationSlice';


export default function Copied({ tooltip, triggerRef }: { tooltip: boolean, triggerRef: React.SetStateAction<HTMLElement | null> }) {

    const darkMode = useSelector(selectDarkMode)


    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
    } = usePopperTooltip();

    useEffect(() => {
        setTriggerRef(triggerRef)
    }, [triggerRef])

    return (
        <>
            {tooltip && (
                <div
                    ref={setTooltipRef}
                    {...getTooltipProps({ className: '!rounded-sm tooltip-container dark:bg-darkSecond dark:!border-darkSecond' })}
                >
                    <div {...getArrowProps({ className: `tooltip-arrow ${darkMode && 'copiedDark'}` })} />
                    <div className="text-sm -m-2 px-2 py-1 rounded-xl dark:bg-darkSecond dark:text-white ">
                        Copied!
                    </div>
                </div>
            )}
        </>
    )
}
