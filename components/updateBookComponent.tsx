import React, { createContext, useContext, useEffect, useState } from "react";
import { useBookRequest, getAllToken } from "context/BooksContext";
import { createButtonContext, FilterButton, INTERFACE_FILTER_BUTTON, TYPE_BUTTON_CONTEXT } from "./FilterButton";
import { SearchOutlined } from "@mui/icons-material";
import { SubmitHandler, useForm } from "react-hook-form";
import { apiFetcher } from "@/pages/_app";
import { AxiosError } from "axios";
import Image from "next/image";

const FilterContext = createButtonContext();

interface INTERFACE_SEARCH_CONTEXT {
  title: string;
  // category?: string;
  // language?: string;
}
type TYPE_SEARCH_CONTEXT = [INTERFACE_SEARCH_CONTEXT, React.Dispatch<React.SetStateAction<INTERFACE_SEARCH_CONTEXT>>];
type BOOK_FORM_CONTEXT = [FORM_INPUT_FILED, React.Dispatch<React.SetStateAction<FORM_INPUT_FILED>>];
const SearchContext = createContext<TYPE_SEARCH_CONTEXT>([{ title: "" }, () => null]);
const BookContext = createContext<BOOK_FORM_CONTEXT>([{ AUTHOR: "", AVAILABILITY: "", CATEGORY: "", EDITION: "", ISBN: "", LANGUAGE: "", PUBLISHER: "", TITLE: "", YEAR: "" }, () => null]);

export default function UpdateBooks() {
  const { onLoading, filteredBooks, filter, searchBookTitle } = useBookRequest();
  const [button, setButton] = useState<INTERFACE_FILTER_BUTTON>({ onId: "0", filterTypeData: { categoryIs: "", languageIs: "" } });
  const [toSearch, setToSearch] = useState<INTERFACE_SEARCH_CONTEXT>({ title: "" });
  const [dataOfSelectedBooks, setDataOfSelectedBooks] = useState<FORM_INPUT_FILED>({
    AVAILABILITY: "0",
    ISBN: "",
    TITLE: "",
    AUTHOR: "",
    EDITION: "",
    YEAR: "",
    PUBLISHER: "",
    CATEGORY: "",
    LANGUAGE: "",
  });

  useEffect(() => {
    filter({ categories: "", languages: "" });
  }, []);

  useEffect(() => {
    searchBookTitle({ title: toSearch.title });
  }, [toSearch]);

  function onClicked(buttonId: string) {
    const updatedButton = { ...button };
    if (updatedButton.onId === buttonId) {
      updatedButton.onId = "0";
      setButton(updatedButton);
    } else {
      updatedButton.onId = buttonId;
      setTimeout(() => {
        setButton(updatedButton);
      }, 10);
    }
  }

  function onLeave() {
    const updatedButton = { ...button };
    if (updatedButton.onId !== "0") {
      console.log("onLeave: ", "onLeave is true");
      console.log("updatedButton.onId: ", updatedButton.onId);
      updatedButton.onId = "0";
      setButton(updatedButton);
    }
  }

  function onOptionSelected(optionType: string, selected: string) {
    const updatedButtonData = { ...button };
    if (optionType.toUpperCase() === "Category".toUpperCase()) updatedButtonData.filterTypeData.categoryIs = selected;
    else if (optionType.toUpperCase() === "language".toLocaleUpperCase()) updatedButtonData.filterTypeData.languageIs = selected;
    updatedButtonData.onId = "0";
    console.log("updatedButtonData: ", updatedButtonData);
    filter({ categories: updatedButtonData.filterTypeData.categoryIs, languages: updatedButtonData.filterTypeData.languageIs });
    setButton(updatedButtonData);
  }

  function onClear(optionType: string) {
    const updatedButtonData = { ...button };
    if (optionType.toUpperCase() === "Category".toUpperCase()) updatedButtonData.filterTypeData.categoryIs = "";
    else if (optionType.toUpperCase() === "language".toLocaleUpperCase()) updatedButtonData.filterTypeData.languageIs = "";
    setButton(updatedButtonData);
    filter({ categories: updatedButtonData.filterTypeData.categoryIs, languages: updatedButtonData.filterTypeData.languageIs });
  }
  const imageLoader = (isbn: string) => {
    const ip = process.env.API_BASE_URL;
    return `${ip}/book/getCover?isbn=${isbn}`;
  };
  return (
    <BookContext.Provider value={[dataOfSelectedBooks, setDataOfSelectedBooks]}>
      <SearchContext.Provider value={[toSearch, setToSearch]}>
        <FilterContext.Provider value={[button, { onClear, onOptionSelected, onClicked, onLeave }]}>
          <div className=" w-[97%] h-[88%] bg-white/0 relative top-8 flex gap-4 justify-center" onClick={() => onLeave()}>
            <div className="flex  flex-col w-[50%] h-full border border-blue-400/100 rounded-lg">
              <BookFilter />
              <div className="w-full h-[85%] bg-white/50 p-4 rounded-b-lg">
                <div className="w-full h-[100%]  border border-red-400 rounded-lg bg-black/60 flex flex-wrap p-4 gap-4 overflow-y-auto scrollbar-hide">
                  {onLoading ? (
                    <>
                      <h1 className="text-white text-3xl">Loading</h1>
                    </>
                  ) : (
                    <>
                      {filteredBooks.map((value, index: number) => (
                        <div
                          key={index}
                          onClick={(e) => {
                            setDataOfSelectedBooks({
                              AVAILABILITY: filteredBooks[index].availability,
                              ISBN: filteredBooks[index].isbn,
                              TITLE: filteredBooks[index].titles,
                              AUTHOR: filteredBooks[index].authors,
                              CATEGORY: filteredBooks[index].categories,
                              EDITION: filteredBooks[index].editions,
                              LANGUAGE: filteredBooks[index].languages,
                              PUBLISHER: filteredBooks[index].publishers,
                              YEAR: filteredBooks[index].year,
                            });
                          }}
                          id={index.toString()}
                          className="w-[230px] h-[300px] bg-slate-50/50 rounded-md hover:border-4 hover:border-yellow-300 mr-3 relative"
                        >
                          <Image loader={() => imageLoader(filteredBooks[index].isbn)} src={"tes.png"} fill alt={`cover book ${value.titles}.png`} />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className=" w-[45%] h-full border border-yellow-600/0 flex justify-center items-center">
              <FormEdit data={dataOfSelectedBooks} />
            </div>
          </div>
        </FilterContext.Provider>
      </SearchContext.Provider>
    </BookContext.Provider>
  );
}

export function BookFilter() {
  const { onLoading, books } = useBookRequest();
  const [filterContext, _] = useContext(FilterContext);
  const onPresEnter = (e: React.KeyboardEvent) => {
    // const isOnEnter = e.key === "Enter";
    // const value = (e.target as HTMLInputElement).value;
    // if (!isOnEnter || value === "") return;
    // const updatedSearchContextData = { ...searchContextData };
    // searchContextData.title = value;
    // searchContextData.category = filterContext.filterTypeData.categoryIs;
    // searchContextData.language = filterContext.filterTypeData.languageIs;
    // setSearchContextData(searchContextData);
  };
  return (
    <div className="w-full h-[15%] bg-gray-600/30 flex flex-col items-center justify-center gap-3 rounded-t-lg border-b border-b-red-500">
      <SearchBar className="w-4/5 h-[35%] relative" />

      <div className=" flex gap-3 h-[35%]">
        <FilterButton
          booksData={books}
          filterTypeLabel="Category"
          buttonTypeId="1"
          contextSub={FilterContext}
          className="pt-2 pb-2 h-full w-[150px] bg-black text-white  pr-1 rounded-lg relative active:bg-opacity-75 active:scale-105 duration-200 z-50"
        />
        <FilterButton
          booksData={books}
          filterTypeLabel="Language"
          buttonTypeId="2"
          contextSub={FilterContext}
          className="pt-2 pb-2 h-full w-[150px] bg-black text-white  pr-1 rounded-lg relative active:bg-opacity-75 active:scale-105 duration-200 z-50"
        />
      </div>
    </div>
  );
}

interface FORM_INPUT_FILED {
  AVAILABILITY: string;
  ISBN: string;
  TITLE: string;
  AUTHOR: string;
  EDITION: string;
  YEAR: string;
  PUBLISHER: string;
  CATEGORY: string;
  LANGUAGE: string;
  [key: string]: string | undefined;
}

interface SELECTED_DATA {
  data: FORM_INPUT_FILED;
}

interface IFormInput {
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

export function FormEdit(selectedData: SELECTED_DATA) {
  const { reloadBookData } = useBookRequest();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    clearErrors,
    formState,
    formState: { errors, isSubmitSuccessful, isValid },
  } = useForm<IFormInput>({
    defaultValues: {
      // UPLOADER: bookData.UPLOADER,
      // AVAILABILITY: "",
      // AUTHOR: "",
      // CATEGORY: "",
      // EDITION: "",
      // ISBN: "",
      // LANGUAGE: "",
      // PUBLISHER: "",
      // TITLE: "tes",
      // YEAR: "",
    },
  });

  useEffect(() => {
    if (Object.values(selectedData.data).includes("")) return;
    setValue("TITLE", selectedData.data.TITLE, { shouldValidate: true });
    setValue("AUTHOR", selectedData.data.AUTHOR, { shouldValidate: true });
    setValue("EDITION", selectedData.data.EDITION, { shouldValidate: true });
    setValue("YEAR", selectedData.data.YEAR, { shouldValidate: true });
    setValue("ISBN", selectedData.data.ISBN, { shouldValidate: true });
    setValue("AVAILABILITY", selectedData.data.AVAILABILITY, { shouldValidate: true });
    setValue("PUBLISHER", selectedData.data.PUBLISHER, { shouldValidate: true });
    setValue("CATEGORY", selectedData.data.CATEGORY, { shouldValidate: true });
    setValue("LANGUAGE", selectedData.data.LANGUAGE, { shouldValidate: true });
  }, [selectedData]);

  const onChangeHandler = (element: React.FormEvent<HTMLFormElement>) => {
    // const updatedBookData: FORM_INPUT_FILED = { ...bookData };
    // updatedBookData.TITLE = watch("TITLE");
    // updatedBookData.AUTHOR = watch("AUTHOR");
    // updatedBookData.CATEGORY = watch("CATEGORY");
    // updatedBookData.EDITION = watch("EDITION");
    // updatedBookData.PUBLISHER = watch("PUBLISHER");
    // updatedBookData.LANGUAGE = watch("LANGUAGE");
    // updatedBookData.CATEGORY = watch("CATEGORY");
    // updatedBookData.YEAR = watch("YEAR");
    // setBookData(updatedBookData);
    clearErrors();
  };

  const onSubmitHandler: SubmitHandler<IFormInput> = async (data) => {
    const formData = new FormData();
    // console.log("data: ", data);
    const { accessToken, refreshToken } = getAllToken();
    Object.keys(data).map((key) => {
      if (key === "bookFile" || key === "bookCoverFile") {
        if (data[`${key}`][0] !== undefined) formData.append(key, data[`${key}`][0]);
        console.log(`data[${key}][0]: `, data[`${key}`][0]);
      } else formData.append(key, data[`${key}`]);
    });
    formData.append("accessToken", accessToken);
    formData.append("refreshToken", refreshToken);
    try {
      const response = await apiFetcher.patch("book/updateBook", formData);
      console.log("response: ", response);
      reloadBookData();
      alert("Update buku berhasil!");
      setTimeout(() => {
        reset();
      }, 100);
    } catch (error) {
      if (error instanceof AxiosError) {
        // console.log("error.response.status: ", error.response?.status);
        // console.log("error.response.data.errorMsg: ", error.response?.data.errorMsg);
        alert(error.response?.data.errorMsg);
      }
    }
  };

  return (
    <form className="bg-black/50 w-[70%] h-[90%] border-2 border-red-500 rounded-xl " onChange={(e) => onChangeHandler(e)} onSubmit={handleSubmit(onSubmitHandler)}>
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
              {...register("ISBN", { required: true })}
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
        <div className="w-[70%] h-auto flex flex-wrap gap-2 bg-black/0 mb-3 items-center relative">
          <label className="text-white text-sm xl:text-base">COVER</label>
          <input type="file" {...register("bookCoverFile")} className="text-white ml-2" />
          <label className="text-white text-sm xl:text-base ">BRF File</label>
          <input type="file" id="file" {...register("bookFile")} className="text-white" />
          {errors.bookFile && <p className="absolute text-red-600 top-[2px] right-8">{("*" + errors.bookFile?.type) as string}</p>}
          {errors.bookFile && <p className="absolute text-red-600 top-10 right-8">{("*" + errors.bookFile?.type) as string}</p>}
        </div>

        <button type="submit" className=" w-auto h-auto p-1 pl-2 pr-2 bg-white rounded-md disabled:bg-white/20" disabled={!isValid}>
          Submit
        </button>
      </fieldset>
    </form>
  );
}

function SearchBar({ className }: any) {
  const [_, setToSearch] = useContext(SearchContext);
  // const [filterData, {}] = useContext(ButtonFilterContext);
  const [title, setTitle] = useState("");
  function onEnterHandler(e: React.KeyboardEvent) {
    const onEnter = e.key === "Enter";
    if (onEnter) {
      setToSearch({ title: title });
      console.log("title: ", title);
    }
  }

  function onClickHandler() {
    if (title === "") return;
    setToSearch({ title: title });
  }

  return (
    <>
      <div className={`${className} w-full h-[35%] flex justify-center relative gap-3`}>
        <div className="w-[60%] h-full relative">
          <input
            className="w-full h-full bg-white bg-opacity-80 rounded-xl  border border-red-500 pl-3 focus:outline-blue-400"
            type="text"
            placeholder="Find..."
            value={title}
            onChange={(e) => {
              // if ((e.target as HTMLInputElement).value === "") setToSearch({ title: "", categories: filterData.filterTypeData.categoryIs, languages: filterData.filterTypeData.languageIs });
              setToSearch({ title: "" });
              setTitle(e.target.value);
            }}
            onKeyDown={(e) => onEnterHandler(e)}
          />
          <div
            className="absolute -right-14 top-0  h-11 w-11 bg-blue-500 text-white  rounded-lg flex items-center justify-center  active:bg-slate-500 hover:scale-105 duration-200"
            onClick={() => onClickHandler()}
          >
            <SearchOutlined className="" fontSize="small" />
          </div>
        </div>
      </div>
    </>
  );
}
