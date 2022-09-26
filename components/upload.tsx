import { Dispatch, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import makeBlockie from "ethereum-blockies-base64";
import { nanoid } from "@reduxjs/toolkit";
import { useAppSelector } from "redux/hooks";
import { SelectDarkMode } from "redux/slices/account/remoxData";

export default function Upload({
  setFile,
  className,
  className2,
  noProfilePhoto = true,
  photo,
}: {
  setFile: Dispatch<File>;
  className?: string;
  className2?: string;
  noProfilePhoto?: boolean;
  photo?: string | null;
}) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const isDark = useAppSelector(SelectDarkMode)
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setFile && setFile(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.name}>
      {file.name} - {(file.size / 1024).toPrecision(2)} mb
    </li>
  ));

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setFile && setFile(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  acceptedFiles.map((file) => (
    <li key={file.name}>{URL.createObjectURL(file)}</li>
  ));

  let url = acceptedFiles[0]
    ? URL.createObjectURL(acceptedFiles[0])
    : photo && photo !== null
    ? `${photo}`
    : "/icons/profilePhoto/pp25.png";

  return (
    <>
      {noProfilePhoto ? (
        <section className="request-form-image">
          <div
            {...getRootProps({
              className: `${className}  w-32 h-32 border bg-white dark:bg-darkSecond  rounded-full flex justify-center mx-auto items-center relative`,
            })}
          >
            <img
              src={url}
              alt=""
              className="w-full h-full rounded-full relative"
            />
            <div className="transition-all hover:transition-all  hover:overflow-hidden hover:bg-[#707070] hover:bg-opacity-60 w-full h-full absolute rounded-full"></div>
            <div
              className={`${className2}  w-9 h-9 rounded-full flex border-white dark:border-greylish items-center justify-center absolute bottom-0 right-0 bg-[#F0F0F0] transition-all hover:transition-all hover:bg-[#b6b6b6]`}
            >
              <input type="file" {...getInputProps()} className="w-9 h-9" />{" "}
              <img src="/icons/photo-add.png" alt="" className="w-4 h-4" />{" "}
            </div>
          </div>{" "}
        </section>
      ) : (
        <section className="request-form-image">
          <div
            {...getRootProps({
              className: ` ${className} h-[11.375rem] bg-white dark:bg-darkSecond rounded-md flex justify-center items-center request-form-image`,
            })}
          >
            <input type="file" {...getInputProps()} />
            {files.length > 0 ? (
              <aside>
                <ul>{files}</ul>
              </aside>
            ) : (
              <div>
                <div className="flex flex-col items-center
                 space-y-5">
                  {isDark ? 
                    <img src="/icons/RequestInputImage.png" alt="" /> :
                    <img src="/icons/RequestImageDark.png" alt="" />
                  
                }
                  
                  <p >Drag and drop files or <span className="text-primary">Browse your folder</span></p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
