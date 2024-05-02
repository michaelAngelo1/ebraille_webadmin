import React, { createContext, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler, FormProvider, useFormContext } from "react-hook-form";
import { object } from "yup";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { apiFetcher } from "@/pages/_app";
import { AxiosError } from "axios";
import Image from "next/image";
interface addBookInterface {
  role: string | undefined;
}

// interface BookPreviewField {
//   TITLE: string;
//   AUTHOR: string;
//   EDITION: string;
//   YEAR: undefined | string;
//   PUBLISHER: string;
//   CATEGORY: string;
//   LANGUAGE: string;
//   UPLOADER: string;
//   [key: string]: string | undefined;
// }

interface FormInputField {
  UPLOADER: string;
  AVAILABILITY: string;
  ISBN: string;
  TITLE: string;
  AUTHOR: string;
  EDITION: string;
  YEAR: string;
  PUBLISHER: string;
  CATEGORY: string;
  LANGUAGE: string;
  bookCoverFile: any;
  bookFile: any;
  [key: string]: string | Blob;
}

export function AddBook({ role }: addBookInterface) {
  const addBookFormMethod = useForm<FormInputField>({ defaultValues: { UPLOADER: role } });
  return (
    <>
      <FormProvider {...addBookFormMethod}>
        <div className=" w-[97%] h-[88%] bg-white/0 relative top-8 flex gap-4 justify-center">
          <div className="flex  flex-col w-[50%] h-full border border-blue-400/0 rounded-lg justify-center items-center">
            <BookPreview />
          </div>
          <div className=" w-[45%] h-full border border-yellow-600/0 flex justify-center items-center">
            <FormAdd />
          </div>
        </div>
      </FormProvider>
    </>
  );
}

export function BookPreview() {
  const { watch, getValues, getFieldState } = useFormContext<FormInputField>();
  const [coverPreview, setCoverPreview] = useState();
  // console.log(URL.createObjectURL(watch("bookCoverFile")[0]));
  // console.log('watch("bookCoverFile"): ', watch("bookCoverFile").files.length);
  const imageLoader = ({}: any) => {
    return `https://edit.org/images/cat/book-covers-big-2019101610.jpg`;
    // return `https://example.com/${src}?w=${width}&q=${quality || 75}`;
  };
  useEffect(() => {
    try {
      if (getValues("bookCoverFile").length === 1) setCoverPreview(getValues("bookCoverFile")[0]);
      else throw new Error("bookCoverFile Undefined");
    } catch (error) {
      setCoverPreview(undefined);
    }
  }, [watch("bookCoverFile")]);

  return (
    <div className="w-[80%] h-[90%] bg-black/80 rounded-lg border-2 border-red-500 relative flex items-center flex-col pt-9">
      <div className="h-80 w-60 border-[3px] border-red-600/60 rounded-r-md rounded-l-3xl  relative flex">
        <div className="h-full w-[20%] bg-black/70 border-red rounded-l-[21px] relative" />
        <div className="h-full w-full bg-black/10 border-red  relative">
          {coverPreview !== undefined ? (
            <Image src={URL.createObjectURL(coverPreview)} fill alt={`cover book ${watch("TITLE")}.png`} />
          ) : (
            <div className="w-full h-full bg-white/25 flex justify-center items-center text-white">Cover Book Not Selected!</div>
          )}
        </div>
      </div>
      <hr className="w-full h-px border-red-600 mt-9" />
      <div className=" w-full h-[280px] flex flex-wrap justify-center items-center text-white bg-white/30  gap-3 pt-2 overflow-y-auto scrollbar-hide pb-2">
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Title:</h1>
          <p>{watch("TITLE")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Author:</h1>
          <p>{watch("AUTHOR")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Edition:</h1>
          <p>{watch("EDITION")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Publisher:</h1>
          <p>{watch("PUBLISHER")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Language:</h1>
          <p>{watch("LANGUAGE")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Categories:</h1>
          <p>{watch("CATEGORY")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Year:</h1>
          <p>{watch("YEAR")}</p>
        </div>
        <div className="w-44 h-20 bg-black/30 border rounded-md flex flex-col justify-center items-center">
          <h1>Uploader:</h1>
          <p>{watch("UPLOADER")}</p>
        </div>
      </div>
      <hr className="w-full h-px border-red-600 " />
      <h1 className=" w-auto h-auto p-1 pl-2 pr-2 rounded-lg bg-red-600/70  border border-red-400 text-white mt-6">Preview</h1>
    </div>
  );
}

export function FormAdd() {
  const [uploadStatus, setUploadStatus] = useState<{ code: undefined | number; message?: string; errorType?: string }>({ code: undefined });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState,
    formState: { errors, isSubmitSuccessful, isValid },
  } = useFormContext<FormInputField>();

  useEffect(() => {
    // if (isSubmitSuccessful) {
    //   setBookData({ AUTHOR: "", CATEGORY: "", EDITION: "", LANGUAGE: "", PUBLISHER: "", TITLE: "", YEAR: "" });
    //   // reset();
    // }
  }, [formState, reset]);

  const onChangeHandler = (element: React.FormEvent<HTMLFormElement>) => {
    clearErrors();
  };

  const onSubmitHandler: SubmitHandler<FormInputField> = async (data) => {
    const formData = new FormData();
    Object.keys(data).map((key) => {
      if (key === "bookFile" || key === "bookCoverFile") formData.append(key, data[`${key}`]["0"]);
      else formData.append(key, data[`${key}`]);
    });
    try {
      console.log("data: ", data);
      const response = await apiFetcher.postForm("book/uploadBook", formData);
      console.log("response: ", response);
      setUploadStatus({ code: response.status });
      setTimeout(() => {
        setUploadStatus({ code: undefined });
        reset();
      }, 3500);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("error.response.status: ", error.response?.status);
        console.log("error.response.data.errorMsg: ", error.response?.data.errorMsg);
        setUploadStatus({ code: error.response?.status, message: error.response?.data.errorMsg, errorType: error.response?.data.errorType });
        setTimeout(() => {
          setUploadStatus({ code: undefined });
        }, 3500);
      }
    }
  };
  return (
    <form
      className="bg-black/50 w-[70%] h-[100%] border-2 border-red-500 rounded-xl relative"
      onChange={(e) => onChangeHandler(e)}
      onSubmit={handleSubmit(onSubmitHandler)}
      encType="multipart/form-data"
    >
      <fieldset className="flex flex-col items-center   w-full h-full  pt-3 pb-3 justify-around">
        <label className="text-white text-sm xl:text-base">TITLE</label>
        <input
          autoComplete="off"
          {...register("TITLE", {
            required: true,
          })}
          placeholder={errors.TITLE?.type}
          className=" text-center mb-3 rounded-lg w-[70%] h-[5%] border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
        />
        <label className="text-white text-sm xl:text-base">AUTHOR</label>
        <input
          autoComplete="off"
          {...register("AUTHOR", { required: true })}
          type="text"
          className=" text-center mb-4 rounded-lg w-[70%] h-[5%] border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
          placeholder={errors.AUTHOR?.type}
        />

        <div className="flex h-10  w-4/5 gap-5 mt-4 justify-evenly">
          <div className="flex flex-col h-full w-1/3 relative  justify-center items-center">
            <label className="text-white text-sm xl:text-base absolute -top-6">EDITION</label>
            <input
              autoComplete="off"
              {...register("EDITION", { required: true })}
              type="text"
              className="w-full h-full  text-center  rounded-lg  border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
              placeholder={errors.EDITION?.type}
            />
          </div>
          <div className="flex flex-col h-full w-1/3 relative  justify-center items-center">
            <label className="text-white text-sm xl:text-base absolute -top-6">ISBN</label>
            <input
              autoComplete="off"
              {...register("ISBN", { required: true, minLength: 10 })}
              type="text"
              className="w-full h-full  text-center  rounded-lg  border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
              placeholder={errors.ISBN?.type}
            />
          </div>
        </div>

        <div className="flex h-10  w-4/5  mt-4  justify-evenly gap-3">
          <div className="flex flex-col h-full w-1/3 relative  justify-center items-center ">
            <label className="text-white text-sm xl:text-base absolute -top-6">YEAR</label>
            <input
              autoComplete="off"
              {...register("YEAR", { required: true, min: 2000 })}
              min={2000}
              type="number"
              placeholder={errors.YEAR?.type}
              className="w-full h-full  text-center  rounded-lg  border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
            />
          </div>

          <div className="flex flex-col h-full w-1/3 relative  justify-center items-center">
            <label className="text-white text-sm xl:text-base absolute -top-6">AVAILABILITY</label>
            <input
              autoComplete="off"
              {...register("AVAILABILITY", { required: true, min: 1 })}
              min={1}
              type="number"
              placeholder={errors.AVAILABILITY?.type}
              className="w-full h-full  text-center  rounded-lg  border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
            />
          </div>
        </div>

        <label className="text-white text-sm xl:text-base">PUBLISHER</label>
        <input
          autoComplete="off"
          {...register("PUBLISHER", { required: true })}
          className=" text-center mb-3 rounded-lg w-[70%] h-[5%] border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
          placeholder={errors.PUBLISHER?.type}
        />

        <label className="text-white text-sm xl:text-base">CATEGORY</label>
        <input
          autoComplete="off"
          {...register("CATEGORY", { required: true })}
          className=" text-center mb-3 rounded-lg w-[70%] h-[5%] border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
          placeholder={errors.CATEGORY?.type}
        />

        <label className="text-white text-sm xl:text-base">LANGUAGE</label>
        <input
          autoComplete="off"
          {...register("LANGUAGE", { required: true })}
          className=" text-center mb-3 rounded-lg w-[70%] h-[5%] border-2 border-blue-800 focus:outline-blue-400 pl-1 placeholder-red-600"
          placeholder={errors.LANGUAGE?.type}
        />
        <div className="w-[70%] h-auto flex flex-col gap-2 bg-black/0 mb-3 items-center relative">
          <label className="text-white text-sm xl:text-base">COVER</label>
          <input type="file" {...register("bookCoverFile", { required: true })} className="text-white ml-2" />
          <label className="text-white text-sm xl:text-base ">BRF File</label>
          <input type="file" id="file" {...register("bookFile", { required: true })} className="text-white" />

          {/* EPUB UPLOAD  */}
          <label className="text-white text-sm xl:text-base ">ePub File</label>
          <input type="file" id="file"  className="text-orange-300" />

          {errors.bookFile && <p className="absolute text-red-600 top-[2px] right-8">{("*" + errors.bookFile?.type) as string}</p>}
          {errors.bookFile && <p className="absolute text-red-600 top-10 right-8">{("*" + errors.bookFile?.type) as string}</p>}
        </div>

        <button type="submit" className=" w-auto h-auto p-1 pl-2 pr-2 bg-white rounded-md disabled:bg-white/20" disabled={!isValid}>
          Submit
        </button>
      </fieldset>
      {uploadStatus.code !== undefined && (
        <div className="w-full h-full bg-black/80 absolute top-0 rounded-xl flex justify-center items-center">
          <div className=" bg-black w-4/5 h-[115px]  border border-red-500 flex justify-center items-center rounded-xl gap-3">
            {uploadStatus.code === 200 && (
              <>
                <p className="text-white font-bold text-xl">Penambahan buku berhasil!</p>
                <CheckRoundedIcon color="primary" sx={{ fontSize: "40px" }} className="relative -top-[1px] rounded-full border-2 border-blue-500 animate-bounce " />
              </>
            )}
            {uploadStatus.code !== 200 && (
              <div className="flex justify-center items-center gap-3  -top-3 flex-col">
                <p className="text-white font-bold text-xl">
                  Penambahan buku gagal! <ClearRoundedIcon color="error" sx={{ fontSize: "40px" }} className="relative -top-[1px] ml-3 rounded-full border-2 border-red-500  " />
                </p>
                <p className="text-white relative  w-auto ">{uploadStatus.message ? uploadStatus.message : uploadStatus.errorType}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
