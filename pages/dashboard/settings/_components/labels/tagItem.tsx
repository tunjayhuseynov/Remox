import Button from "components/button";
import Modal from "components/general/modal";
import { useModalSideExit } from "hooks";
import { useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { AiOutlineDown } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from 'redux/hooks';

import { useForm, SubmitHandler } from "react-hook-form";
import { ITag } from "pages/api/tags/index.api";
import { DeleteTag, UpdateTag } from "redux/slices/account/thunks/tags";
import { SelectDarkMode, SelectID } from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import Delete from "pages/dashboard/contributors/_components/buttons/delete";

export interface IFormInput {
    name: string;
    color: string;
}

export default function TagItem({ tag }: { tag: ITag }) {
    const id = useAppSelector(SelectID)
    const { register, handleSubmit } = useForm<IFormInput>();
    const [modalVisible, setModalVisible] = useState(false)
    const [details, setDetails] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [colorPicker, setColorPicker] = useState(false)
    const [color, setColor] = useState(tag.color)
    const dispatch = useAppDispatch()
    const dark = useAppSelector(SelectDarkMode)
    const inputRef = useRef<HTMLInputElement>(null)
    const [ref, exceptRef] = useModalSideExit<boolean>(colorPicker, setColorPicker, false)

    const colorHandler = (color: { hex: string }) => {
        setColor(color.hex)
    }


    const deleteTag = async () => {
        try {
            if(!id) return
            dispatch(DeleteTag({
                id: id,
                tag: tag
            }))
            setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }


    const [divRef2, exceptRef2] = useModalSideExit(details, setDetails, false)

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        const Color = color
        console.log(data, Color)
        if (!id) return
        dispatch(UpdateTag({
            id,
            newTag: {
                color,
                id: tag.id,
                name: inputRef.current?.value ?? "",
                transactions: tag.transactions,
                isDefault: tag.isDefault
            },
            oldTag: tag
        }))
    }

    const [isLoading, OnSubmit] = useLoading(onSubmit)

    return (
        <>
            {editModal &&
                <Modal onDisable={setEditModal} animatedModal={false} disableX={true} className=" !pt-5 overflow-visible ">
                    <form onSubmit={handleSubmit(OnSubmit)} className="flex flex-col space-y-12 items-center">
                        <div className="font-semibold tracking-wider text-2xl">
                            Edit tag
                        </div>
                        <div className="flex items-end space-x-12">
                            <div className="flex flex-col space-y-3 items">
                                <label className="text-greylish bg-opacity-50">Tag name</label>
                                <input type="text" {...register("name", { required: true })} className="rounded-xl border  dark:bg-darkSecond px-5 py-2" defaultValue={tag.name} />
                            </div>
                            <div className="flex flex-col  ">
                                <label className="text-greylish bg-opacity-50"></label>
                                <div className="flex space-x-3 border  rounded-md items-center justify-center cursor-pointer relative" onClick={() => setColorPicker(true)}>
                                    <div className="py-3 pl-3">
                                        <div className="w-[1.125rem] h-[1.125rem] rounded-full" style={{
                                            backgroundColor: color,
                                        }}>

                                        </div>
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
                        </div>
                        <div className="flex justify-center gap-16">
                            <Button type="submit" version="second" onClick={() => setEditModal(false)} className="!px-10 !py-2 !rounded-xl">
                                Back
                            </Button>
                            <Button type="submit" className="!px-10 !py-2 !rounded-xl" isLoading={isLoading} >
                                Save
                            </Button>
                        </div>
                    </form>
                </Modal>
            }
            {deleteModal &&
                <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true}>
                    <Delete name={`${tag.name} tag`} onCurrentModal={setDeleteModal} onDelete={deleteTag} />
                </Modal>}
            <div className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[60%,35%,1fr] border-b  py-6 px-10 relative" >
                <div className="flex space-x-3 items-center">
                    <div className="w-[1.125rem] h-[1.125rem] rounded-full" style={{
                        backgroundColor: tag.color,
                    }}></div>
                    <div className="font-semibold">
                        {tag.name}
                    </div>
                </div>
                <div className="flex space-x-3 justify-end">
                    <span ref={exceptRef2} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                        {details && <div ref={divRef2} className="flex flex-col items-center  w-[8rem]  bg-white dark:bg-darkSecond absolute right-24 -bottom-7  rounded-lg shadow-xl z-50 ">
                            <div className="cursor-pointer  hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm border-b border-greylish border-opacity-20 flex w-full px-2  py-2 gap-3" onClick={() => {
                                setEditModal(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                            </div>
                            <div className="cursor-pointer  hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                                setDeleteModal(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                            </div>
                        </div>}
                    </span>

                </div>
            </div>

        </>
    )
}
