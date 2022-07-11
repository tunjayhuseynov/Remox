import useTags from 'rpcHooks/useTags'
import Button from 'components/button'
import Error from 'components/general/error'
import Modal from 'components/general/modal'
import Success from 'components/general/success'
import { useModalSideExit } from 'hooks'
import { useRef, useState } from 'react'
import { TwitterPicker } from 'react-color'
import { AiOutlineDown } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/slices/notificationSlice'
import { selectTags } from 'redux/slices/tags'
import TagItem from 'subpages/dashboard/settings/labels/tagItem'
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {
    name:string;
    color:string;
  }

export default function TagsSetting() {
  const { register, handleSubmit } = useForm<IFormInput>();
    const tags = useSelector(selectTags)
    const isSuccess = useSelector(selectSuccess)
    const isError = useSelector(selectError)
    const dispatch = useDispatch()

    const [showModal, setShowModal] = useState(false)
    const [colorPicker, setColorPicker] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [color, setColor] = useState('')
    const [ref, exceptRef] = useModalSideExit<boolean>(colorPicker, setColorPicker,false)

    const { createTag, isLoading } = useTags()

    const create = async () => {
        const name = inputRef.current?.value
        if (color && name) {
            await createTag(name, color)
        }
        setShowModal(false)
    }

    const colorHandler = (color: { hex: string }) => {
        setColor(color.hex)
    }

    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Color = color
        console.log(data,Color)
    }

    return (
        <>
            <div >
                <div className="flex justify-between items-center py-5 px-[1rem] relative">
                    <div className="absolute -top-[7.7rem] right-0">
                        <Button onClick={() => setShowModal(true)} className="!py-1">
                            Create Tag
                        </Button>
                    </div>
                </div>
                <div className="w-full pt-2 pb-2 border-t ">
                    <div>
                        {tags.length > 0 && tags.map((tag, index) => <TagItem key={tag.id} tag={tag} />)}
                        {tags.length === 0 && <div className="text-2xl text-center py-10 font-semibold tracking-wide">No tag yet. Create a tag to track what you care about.</div>}
                    </div>
                </div>
            </div>
            {showModal &&
                <Modal onDisable={setShowModal} animatedModal={false} disableX={true} className="!pt-5 overflow-visible">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-12 items-center">
                        <div className="flex  font-semibold tracking-wider text-2xl">
                            Create a New Tag
                        </div>
                        <div className="flex items-end space-x-12">
                            <div className="flex flex-col space-y-3">
                                <label className="text-greylish bg-opacity-50">Tag name</label>
                                <input type="text" {...register("name", { required: true })} className="rounded-xl border border-greylish dark:bg-darkSecond px-5 py-2" placeholder="Marketing" ref={inputRef} />
                            </div>
                            <div className="flex flex-col space-y-3 ">
                                <label className="text-greylish bg-opacity-50"></label>
                                <div className="flex space-x-3 border border-greylish rounded-md items-center justify-center cursor-pointer relative" onClick={() => setColorPicker(true)}>
                                    <div className="py-2 pl-3">
                                        <div className="w-[18px] h-[18px] rounded-full" style={{
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
                            <Button type="submit" version="second" onClick={() => setShowModal(false)} className="px-8 !py-2">
                                Back
                            </Button>
                            <Button type="submit" onClick={create}  className=" !py-2 " isLoading={isLoading} >
                                Create
                            </Button>
                        </div>
                    </form>
                </Modal>
            }
        </>
    )
}
