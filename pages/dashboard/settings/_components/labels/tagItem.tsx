import Modal from "components/general/modal";
import { useModalSideExit } from "hooks";
import { useState } from "react";
import { TwitterPicker } from "react-color";
import { AiOutlineDown } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from 'redux/hooks';

import { ITag } from "pages/api/tags/index.api";
import { DeleteTag, UpdateTag } from "redux/slices/account/thunks/tags";
import { SelectID } from "redux/slices/account/remoxData";
import Delete from "pages/dashboard/contributors/_components/buttons/delete";
import EditableTextInput from "components/general/EditableTextInput";
import { IoTrashOutline } from "react-icons/io5"
export interface IFormInput {
    name: string;
    color: string;
}

export default function TagItem({ tag }: { tag: ITag }) {
    const id = useAppSelector(SelectID)
    const [deleteModal, setDeleteModal] = useState(false)
    const [colorPicker, setColorPicker] = useState(false)
    const [color, setColor] = useState(tag.color)
    const dispatch = useAppDispatch()
    const [ref, exceptRef] = useModalSideExit<boolean>(colorPicker, setColorPicker, false)

    const colorHandler = (color: { hex: string }) => {
        setColor(color.hex)
        updateColor(color.hex)
    }


    const deleteTag = async () => {
        try {
            if (!id) return
            dispatch(DeleteTag({
                id: id,
                tag: tag
            }))
            setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }


    const updateName = async (name: string) => {
        if (!id) return
        dispatch(UpdateTag({
            id,
            newTag: {
                ...tag,
                name: name,
            },
            oldTag: tag
        }))
    }

    const updateColor = async (color: string) => {
        if (!id) return
        dispatch(UpdateTag({
            id,
            newTag: {
                ...tag,
                color: color,
            },
            oldTag: tag
        }))
    }

    return (
        <>
            {deleteModal &&
                <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true}>
                    <Delete name={`"${tag.name}" tag`} onCurrentModal={setDeleteModal} onDelete={deleteTag} />
                </Modal>}
            <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom flex items-center gap-[23.6rem] py-6  px-5 relative" >
                <div className="flex space-x-3 items-center">
                    <div className="flex flex-col  ">
                        <label className="text-greylish bg-opacity-50"></label>
                        <div className="flex space-x-3 border  rounded-md items-center justify-center cursor-pointer relative" onClick={() => setColorPicker(true)}>
                        <div className="py-1 pl-3">
                            <div
                              className="w-1 h-4"
                              style={{
                                backgroundColor: color,
                              }}
                            />
                            </div>
                            <div className="border-l  px-2 py-2 " ref={exceptRef}>
                                <AiOutlineDown />
                            </div>
                            {colorPicker &&
                                <div className="absolute -bottom-3 left-0 translate-y-full z-50" ref={ref}>
                                    <TwitterPicker onChange={colorHandler} />
                                </div>
                            }
                        </div>
                    </div>
                    <div className="font-semibold">
                        <EditableTextInput
                            defaultValue={tag.name}
                            placeholder="Tag name"
                            letterLimit={15}
                            onSubmit={async (val) => {
                                updateName(val)
                            }}
                        />
                    </div>
                    <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                        <IoTrashOutline size={20} className="hover:text-red-500" />
                    </div>
                </div>
            </div>
        </>
    )
}
