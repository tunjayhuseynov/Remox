import { useEffect, useState } from "react";
import { TwitterPicker } from "react-color";
import { AiOutlineDown } from "react-icons/ai";
import { useSelector } from "react-redux";
import TagItem from "pages/dashboard/settings/_components/labels/tagItem";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { CreateTag } from "redux/slices/account/thunks/tags";
import { SelectID, SelectTags } from "redux/slices/account/remoxData";
import {
  ClickAwayListener,
  FormControl,
  InputAdornment,
  TextField,
} from "@mui/material";
import { BiSearch } from "react-icons/bi";
import { ITag } from "pages/api/tags/index.api";
import { BsPlusLg } from "react-icons/bs";
import EditableTextInput from "components/general/EditableTextInput";
import { IoTrashOutline } from "react-icons/io5";
import { ToastRun } from "utils/toast";

export default function TagsSetting() {
  const tags = useSelector(SelectTags);
  const [stateTags, setStateTags] = useState<ITag[]>([]);

  useEffect(() => {
    setStateTags(tags);
  }, [tags]);

  const id = useAppSelector(SelectID);
  const dispatch = useAppDispatch();

  const [showModal, setShowModal] = useState(false);
  const [colorPicker, setColorPicker] = useState(false);
  const [color, setColor] = useState("");

  const colorHandler = (color: { hex: string }) => {
    setColor(color.hex);
  };

  const onSubmit = async (value: string) => {
    const Color = color;
    if (!id) return;
    if (Color && value) {
      const dateNow = new Date().getTime()
      await dispatch(
        CreateTag({
          color: Color,
          id: id,
          name: value,
          createdDate: dateNow
        })
      ).unwrap();
      setShowModal(false);
    } else {
      ToastRun(<>please fill in all cells</>, "warning" )
    }

    setColor("")
  };

  const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === "") {
      setStateTags(tags);
    } else {
      const filteredCoins = tags.filter((tag) =>
        tag.name.toLowerCase().startsWith(e.target.value.toLowerCase())
      );
      setStateTags(filteredCoins);
    }
  };


  return (
    <>
      <div>
        <div className="flex items-center mt-8 mb-10">
          <FormControl className="w-[30%]">
            <TextField
              placeholder="Search"
              inputProps={{ style: { width: "100%" } }}
              onChange={searching}
              className="bg-white text-dark !border-[#dad8d8] dark:!text-[#dad8d8] dark:bg-darkSecond"
              InputProps={{
                style: {
                  fontSize: "0.875rem",
                  width: "100%",
                  height: "35px",
                  borderColor: "#D6D6D6",
                  // color: "#D6D6D6",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <BiSearch className="!text-[#dad8d8]" size={20} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </FormControl>
          <div
            className={`w-[4.62rem] h-[2.5rem] border-[1px] border-[#CCCCCC] rounded-[40px] flex items-center justify-center cursor-pointer bg-white dark:bg-darkSecond
     dark:hover:border-white hover:dark:bg-white dark:hover:bg-opacity-5 hover:bg-opacity-5 hover:bg-black ml-4
    `}
            onClick={() => setShowModal(true)}
          >
            <BsPlusLg color="#CCCCCC" size={15} />
          </div>
        </div>
        <div className="w-full pb-2">
          <div>
            {showModal && (
              <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom flex items-center gap-[23.6rem] py-6  px-5 relative">
                <div className="flex space-x-3 items-center">
                  <div className="flex flex-col  ">
                    <label className="text-greylish bg-opacity-50"></label>
                  </div>
                  <div
                    className="flex space-x-3 border !ml-0  rounded-md items-center justify-center cursor-pointer relative"
                    onClick={() => setColorPicker(true)}
                  >
                    <div className="py-1 pl-3">
                      <div
                        className="w-1 h-4"
                        style={{
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="border-l  px-2 py-2 " >
                      <AiOutlineDown />
                    </div>
                    {colorPicker && (
                      <ClickAwayListener
                        onClickAway={() => {
                          setColorPicker(false);
                        }}
                      >
                        <div className="absolute -bottom-3 left-0 translate-y-full z-[99999]">
                          <TwitterPicker onChange={colorHandler} />
                        </div>
                      </ClickAwayListener>
                    )}
                  </div>
                  <div className="font-semibold">
                    <EditableTextInput
                      defaultValue=""
                      letterLimit={15}
                      placeholder="Tag name"
                      onSubmit={async (val) => {
                        onSubmit(val);
                      }}
                    />
                  </div>
                  <div className="cursor-pointer" onClick={() => setShowModal(false)}>
                        <IoTrashOutline size={20} className="hover:text-red-500" />
                    </div>
                </div>
              </div>
            )}
            {tags.length > 0 &&
              stateTags.map((tag) => <TagItem key={tag.id} tag={tag} />)}
            {tags.length === 0 && (
              <div className="text-2xl text-center py-10 font-semibold tracking-wide">
                No tag yet. Create a tag to track what you care about.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
