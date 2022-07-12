import { IContributor } from "rpcHooks/useContributors";
import useContributors from "hooks/useContributors";
import { Dispatch, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Button from "../../../../components/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { IFormInput } from "./addTeam";
import {
  SelectContributors,
  updateContributor,
} from "redux/slices/account/remoxData";
import { GetTime } from "utils";

const EditTeam = (
  props: IContributor & { onCurrentModal: Dispatch<boolean> }
) => {
  const { register, handleSubmit } = useForm<IFormInput>();
  const { editTeam, isLoading } = useContributors();
  const [error, setError] = useState(false);
  const [input, setInput] = useState<string>("");
  const dispatch = useAppDispatch();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (data.name.trim()) {
      try {
        setError(false);

        await editTeam(props.id, data.name.trim());
        dispatch(updateContributor({ name: data.name.trim(), id: props.id }));
      } catch (error) {
        console.error(error);
        setError(true);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center space-y-10"
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
          defaultValue={props.name}
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
            props.onCurrentModal(false);
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
  );
};

export default EditTeam;
