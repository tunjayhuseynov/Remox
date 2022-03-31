import useTags from 'API/useTags'
import Button from 'components/button'
import Error from 'components/general/error'
import Modal from 'components/general/modal'
import Success from 'components/general/success'
import { useModalSideExit } from 'hooks'
import { useRef, useState } from 'react'
import { TwitterPicker } from 'react-color'
import { AiOutlineDown } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import { selectTags } from 'redux/reducers/tags'
import TagItem from 'subpages/dashboard/settings/tags/tagItem'

export default function TagsSetting() {

    const tags = useSelector(selectTags)
    const isSuccess = useSelector(selectSuccess)
    const isError = useSelector(selectError)
    const dispatch = useDispatch()

    const [showModal, setShowModal] = useState(false)
    const [colorPicker, setColorPicker] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [color, setColor] = useState('')
    const ref = useModalSideExit<boolean>(colorPicker, setColorPicker,false)

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

    return (
        <>
            <div className="">
                <div className="flex justify-between items-center py-5 px-[1rem]">
                    <div className="font-bold text-3xl">
                        Tags
                    </div>
                    <div>
                        <Button onClick={() => setShowModal(true)}>
                            + Add Tag
                        </Button>
                    </div>
                </div>
                <div className="w-full pt-12 pb-6 rounded-xl">
                    <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[60%,35%,1fr] border-b border-black sm:pb-5 px-5" >
                        <div className="font-normal">Tag Name</div>
                        <div className="font-normal hidden lg:block">Transactions</div>
                        <div className="font-normal"></div>
                    </div>
                    <div>
                        {tags.length > 0 && tags.map((tag, index) => <TagItem key={tag.id} tag={tag} />)}
                        {tags.length === 0 && <div className="text-2xl text-center py-10 font-semibold tracking-wide">No tag yet. Create a tag to track what you care about.</div>}
                    </div>
                </div>
            </div>
            {showModal &&
                <Modal onDisable={setShowModal} className="lg:min-w-[auto] overflow-visible">
                    <div className="flex flex-col space-y-12">
                        <div className="font-semibold tracking-wider text-2xl">
                            Add new tag
                        </div>
                        <div className="flex items-end space-x-24">
                            <div className="flex flex-col space-y-3">
                                <label className="text-greylish bg-opacity-50">Tag name</label>
                                <input type="text" className="rounded-xl border border-greylish dark:bg-darkSecond px-5 py-1" ref={inputRef} />
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
                                    <div className="border-l border-greylish px-2 py-2 ">
                                        <AiOutlineDown />
                                        {colorPicker &&
                                            <div className="absolute -bottom-3 left-0 translate-y-full z-50" ref={ref}>
                                                <TwitterPicker onChange={colorHandler} />
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-16">
                            <Button type="submit" version="second" onClick={() => setShowModal(false)} className="px-8">
                                Go back
                            </Button>
                            <Button type="submit" onClick={create} className="px-8 py-3" isLoading={isLoading} >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </Modal>
            }
        </>
    )
}
