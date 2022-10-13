import Button from "components/button";
import Modal from "components/general/modal";
import { useModalSideExit } from "hooks";
import { useEffect, useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { AiOutlineDown } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { selectTags } from "redux/slices/tags";
import TagItem from "pages/dashboard/settings/_components/labels/tagItem";
import { useForm, SubmitHandler } from "react-hook-form";
import useLoading from "hooks/useLoading";
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
import CreateButton from "components/general/CreateButton";
import { BsPlusLg } from "react-icons/bs";

export interface IFormInput {
  name: string;
  color: string;
}

export default function TagsSetting() {
  const { register, handleSubmit, reset } = useForm<IFormInput>();
  const tags = useSelector(SelectTags);
  const [stateTags, setStateTags] = useState<ITag[]>([]);

  useEffect(() => {
    setStateTags(tags)
  }, [tags])

  const id = useAppSelector(SelectID);
  const dispatch = useAppDispatch();

  const [showModal, setShowModal] = useState(false);
  const [colorPicker, setColorPicker] = useState(false);
  const [color, setColor] = useState("");

  const colorHandler = (color: { hex: string }) => {
    setColor(color.hex);
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const Color = color;
    if (!id) return;
    if (Color && data.name) {
      await dispatch(
        CreateTag({
          color: Color,
          id: id,
          name: data.name,
        })
      ).unwrap();
    }
    reset({ name: "" });
    setShowModal(false);
  };

  const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === "") {
      setStateTags(tags);
    } else {
      const filteredCoins = tags.filter((tag) =>
        tag.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setStateTags(filteredCoins);
    }
  };

  const [isLoading, OnSubmit] = useLoading(onSubmit);

  return (
    <>
      <div>
        {/* <div className="flex justify-between items-center py-5 px-[1rem] relative">
                    <div className="absolute -top-[7.7rem] right-0">
                        <Button onClick={() => setShowModal(true)} className="!py-1">
                            Create Tag
                        </Button>
                    </div>
                </div> */}
        <div className="flex items-center mt-8 mb-10">
          <FormControl className="w-[30%]">
            <TextField
              placeholder="Search"
              inputProps={{ style: { width: "100%" } }}
              onChange={searching}
              className="bg-white !border-[#dad8d8] !text-[#dad8d8] dark:bg-darkSecond"
              InputProps={{
                style: {
                  fontSize: "0.875rem",
                  width: "100%",
                  height: "35px",
                  borderColor: "#D6D6D6",
                  color: "#D6D6D6"
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
            {tags.length > 0 &&
              stateTags.map((tag, index) => <TagItem key={tag.id} tag={tag} />)}
            {tags.length === 0 && (
              <div className="text-2xl text-center py-10 font-semibold tracking-wide">
                No tag yet. Create a tag to track what you care about.
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          onDisable={setShowModal}
          openNotify={showModal}
          animatedModal={false}
          disableX={true}
          className="!pt-5 !overflow-visible  !w-80"
        >
          <form
            onSubmit={handleSubmit(OnSubmit)}
            className="flex flex-col space-y-12 items-center"
          >
            <div className="flex  font-semibold tracking-wider text-2xl">
              Create a New Tag
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="">
                <TextField type={"text"} {...register("name", { required: true })} label="Tag Name" placeholder="E.g: Marketing"  />
              </div>
              <div
                className="flex space-x-3 border border-gray-500 rounded-md items-center justify-center cursor-pointer relative"
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
                <div className="border-l px-2 py-1">
                  <AiOutlineDown size={"0.5rem"} />
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
            </div>
            <div className="flex items-center w-full justify-between">
              <Button
                type="submit"
                version="second"
                onClick={() => setShowModal(false)}
                className="w-[40%] !py-2 flex justify-center"
              >
                Back
              </Button>
              <Button type="submit"  className="!py-2 w-[40%] flex justify-center" isLoading={isLoading} >
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
