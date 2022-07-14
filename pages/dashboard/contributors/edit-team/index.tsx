import { IContributor } from "rpcHooks/useContributors";
import useContributors from "hooks/useContributors";
import { Dispatch, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Button from "../../../../components/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { IFormInput } from "../add-team";
import {
  SelectContributors,
  updateContributor,
} from "redux/slices/account/remoxData";
import { GetTime } from "utils";
import { useRouter } from "next/router";

const EditTeam = () => {
  const { id, name } = useRouter().query as { id : string, name: string }
  console.log(id);
  
  const { register, handleSubmit } = useForm<IFormInput>();
  const { editTeam, isLoading } = useContributors();
  const [error, setError] = useState(false);
  const [input, setInput] = useState<string>("");
  const dispatch = useAppDispatch();
  const navigate = useRouter()
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (data.name.trim()) {
      try {
        setError(false);
        await editTeam(id, data.name.trim());
        dispatch(updateContributor({ name: data.name.trim(), id: id }));
        navigate.back()
      } catch (error) {
        console.error(error);
        setError(true);
      }
    }
  };

  return (<div className="w-full mx-auto relative">
    <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
      {/* <img src="/icons/cross_greylish.png" alt="" /> */}
      <span className="text-4xl pb-1">&#171;</span> Back
    </button>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-[35%] mx-auto  pt-24 items-center justify-center space-y-10"
    >
      <div className="flex items-center justify-center text-xl">
        <div className="text-2xl self-center pt-2 font-semibold ">
          Edit Team
        </div>
      </div>

      <div className="flex flex-col w-[85%] ">
        <div className="">Team Name</div>
        <input
          type="text"
          {...register("name", { required: true })}
          defaultValue={name}
          onChange={(e) => setInput(e.target.value)}
          className="border pl-3 w-full rounded-xl h-10 py-6 text-lg outline-none dark:bg-darkSecond"
          required
        />
      </div>
      <div className="flex  gap-x-10 justify-center w-full">
        <Button
          version="second"
          className="px-14 !py-2 font-light"
          onClick={() => {
            navigate.back()
          }}
        >
          Close
        </Button>
        <Button
          className="px-14 !py-2 font-light"
          isLoading={isLoading}
          type="submit"
        >
          Save
        </Button>
      </div>
    </form>
  </div>
  );
};

export default EditTeam;
