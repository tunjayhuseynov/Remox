import { ClickAwayListener } from "@mui/material"
import { nanoid } from "@reduxjs/toolkit"
import Button from "components/button"
import EditableTextInput from "components/general/EditableTextInput"
import Modal from "components/general/modal"
import useLoading from "hooks/useLoading"
import { ITag } from "pages/api/tags/index.api"
import { Dispatch, useState } from "react"
import { TwitterPicker } from "react-color"
import { AiOutlineDown } from "react-icons/ai"
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { SelectID } from "redux/slices/account/selector"
import { CreateTag } from "redux/slices/account/thunks/tags"
import { ToastRun } from "utils/toast"

interface IProps {
    setAddLabelModal: Dispatch<boolean>,
    onSubmit: (val: ITag) => Promise<void>
}

const AddLabel = ({ setAddLabelModal, onSubmit }: IProps) => {
    const id = useAppSelector(SelectID)

    const [color, setColor] = useState<string>()
    const [colorPicker, setColorPicker] = useState(false)
    const [name, setName] = useState<string>()

    const dispatch = useAppDispatch()

    const colorHandler = (color: { hex: string }) => {
        setColor(color.hex)
    }

    const addLabelHandler = async () => {
        if (!name) return ToastRun("Please enter a name for the label", "error")
        if (!color) return ToastRun("Please select a color for the label", "error")
        if (!id) return ToastRun("Please login to create a label", "error")
        const newTag = await dispatch(CreateTag({
            color: color,
            id: id,
            name: name
        })).unwrap()
        await onSubmit(newTag)
        setAddLabelModal(false)
    }
    const [isAdding, AddLabelFN] = useLoading(addLabelHandler)

    return <Modal onDisable={setAddLabelModal} animatedModal={false} disableX={true} className={'!pt-6 !w-[30%]'}>
        <div className="text-xl font-semibold text-center pb-10">New Label</div>
        <div className="flex flex-col space-y-8 items-center px-3">
            <div className="flex">
                <div className="flex space-x-3 border border-gray-500 rounded-md items-center justify-center cursor-pointer relative" onClick={() => setColorPicker(true)}>
                    <div className="py-1 pl-3">
                        <div className="w-1 h-4" style={{
                            backgroundColor: color,
                        }} />
                    </div>
                    <div className="border-l px-2 py-1">
                        <AiOutlineDown size={"0.75rem"} />
                    </div>
                    {colorPicker &&
                        <ClickAwayListener onClickAway={() => { setColorPicker(false) }}>
                            <div className="absolute -bottom-3 left-0 translate-y-full z-[99999]">
                                <TwitterPicker onChange={colorHandler} />
                            </div>
                        </ClickAwayListener>
                    }
                </div>
                <div>
                    <EditableTextInput
                        defaultValue=""
                        placeholder="Tag name"
                        onSubmit={async (val) => {
                            setName(val)
                        }}
                    />
                </div>
            </div>
            <div className="flex justify-center items-center space-x-4">
                <Button version="second" className="border-2  w-[7rem] !px-1 !py-1 text-sm" onClick={() => { setAddLabelModal(false) }}>Cancel</Button>
                <Button className="w-[7rem] !px-1 !py-1 text-sm" onClick={AddLabelFN} isLoading={isAdding}>Create</Button>
            </div>
        </div>
    </Modal>
}

export default AddLabel;