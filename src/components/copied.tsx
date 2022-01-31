import React, { useEffect } from 'react'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';


export default function Copied({ tooltip, triggerRef }: { tooltip: boolean, triggerRef: React.SetStateAction<HTMLElement | null> }) {

    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible
    } = usePopperTooltip();

    useEffect(() => {
        setTriggerRef(triggerRef)
    }, [triggerRef])

    return (
        <>
            {tooltip && (
                <div
                    ref={setTooltipRef}
                    {...getTooltipProps({ className: '!rounded-sm tooltip-container' })}
                >
                    <div {...getArrowProps({ className: 'tooltip-arrow ' })} />
                    <div className="text-sm -m-2 px-2 py-1 rounded-xl">
                        Copied!
                    </div>
                </div>
            )}
        </>
    )
}
