import useTags, { Tag } from "API/useTags";
import Button from "components/button";
import Modal from "components/general/modal";
import { useModalSideExit } from "hooks";
import { useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { AiOutlineDown } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import Delete from "subpages/dashboard/contributors/buttons/delete";

export default function TagItem({ tag }: { tag: Tag }) {

    const [deleteModal, setDeleteModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [colorPicker, setColorPicker] = useState(false)
    const [color, setColor] = useState(tag.color)
    const dispatch = useDispatch()

    const inputRef = useRef<HTMLInputElement>(null)
    const [ref, exceptRef] = useModalSideExit<boolean>(colorPicker, setColorPicker,false)

    const colorHandler = (color: { hex: string }) => {
        setColor(color.hex)
    }

    const { deleteTag, updateTag, isLoading } = useTags()

    const DeleteTag = async () => {
        try {
            await deleteTag(tag)
            //setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    const UpdateTag = async () => {
        try {
            await updateTag(tag, {
                color,
                id: tag.id,
                name: inputRef.current?.value ?? "",
                transactions: tag.transactions,
                isDefault: tag.isDefault
            })
            dispatch(changeSuccess({ activate: true, text: "Successfully updated tag" }))
        } catch (error) {
            console.error(error)
            dispatch(changeError({ activate: true, text: "Failed to update tag" }))
        }
    }

    return (
        <>
            <div className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[60%,35%,1fr] border-b border-black py-3 px-5" >
                <div className="flex space-x-3 items-center">
                    <div className="w-[1.125rem] h-[1.125rem] rounded-full" style={{
                        backgroundColor: tag.color,
                    }}></div>
                    <div>
                        {tag.name}
                    </div>
                </div>
                <div className="text-primary text-semibold">
                    {tag.transactions.length} {tag.transactions.length > 1 ? "Transactions" : "Transaction"}
                </div>
                {!tag.isDefault && <div className="flex space-x-3 justify-end">
                    <div className="cursor-pointer" onClick={() => {
                        setEditModal(true)
                    }}>
                        <img src="/icons/editSetting.svg" alt="" className="dark:invert dark:brightness-0" />
                    </div>
                    <div className="cursor-pointer" onClick={() => {
                        setDeleteModal(true)
                    }}>
                        <img src="/icons/trashSetting.svg" alt="" />
                    </div>
                </div>}
            </div>
            {editModal &&
                <Modal onDisable={setEditModal} className="lg:min-w-[auto] overflow-visible">
                    <div className="flex flex-col space-y-12">
                        <div className="font-semibold tracking-wider text-2xl">
                            Edit tag
                        </div>
                        <div className="flex items-end space-x-24">
                            <div className="flex flex-col space-y-3">
                                <label className="text-greylish bg-opacity-50">Tag name</label>
                                <input type="text" className="rounded-xl border border-greylish dark:bg-darkSecond px-5 py-1" ref={inputRef} defaultValue={tag.name} />
                            </div>
                            <div className="flex flex-col space-y-3 ">
                                <label className="text-greylish bg-opacity-50"></label>
                                <div className="flex space-x-3 border border-greylish rounded-md items-center justify-center cursor-pointer relative" onClick={() => setColorPicker(true)}>
                                    <div className="py-2 pl-3">
                                        <div className="w-[1.125rem] h-[1.125rem] rounded-full" style={{
                                            backgroundColor: color,
                                        }}>

                                        </div>
                                    </div>
                                    <div className="border-l border-greylish px-2 py-2 " ref={exceptRef}>
                                        <AiOutlineDown />
                                    </div>
                                        {colorPicker &&
                                            <div className="absolute -bottom-3 left-0 translate-y-full z-50" ref={ref}>
                                                <TwitterPicker onChange={colorHandler} />
                                            </div>
                                        }
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-16">
                            <Button type="submit" version="second" onClick={() => setEditModal(false)} className="!px-8">
                                Go back
                            </Button>
                            <Button type="submit" onClick={UpdateTag} className="!px-8 !py-3" isLoading={isLoading} >
                                Save
                            </Button>
                        </div>
                    </div>
                </Modal>
            }
            {deleteModal &&
                <Modal onDisable={setDeleteModal}>
                    <Delete name={`${tag.name} tag`} onCurrentModal={setDeleteModal} onDelete={DeleteTag} />
                </Modal>}
        </>
    )
}
