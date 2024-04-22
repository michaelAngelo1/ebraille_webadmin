import React, { useState, createContext, useContext, useEffect } from "react";
import { SearchOutlined } from "@mui/icons-material";
import { FILTER_CONTENT_INTERFACE, useBookRequest } from "context/BooksContext";
import { FilterButton, INTERFACE_FILTER_BUTTON, createButtonContext } from "./FilterButton";
import Image from "next/image";

interface INTERFACE_SEARCH_CONTEXT {
  title: string;
}
type TYPE_SEARCH_CONTEXT = [INTERFACE_SEARCH_CONTEXT, React.Dispatch<React.SetStateAction<INTERFACE_SEARCH_CONTEXT>>];
const SearchContext = createContext<TYPE_SEARCH_CONTEXT>([{ title: "" }, () => null]);

const ButtonFilterContext = createButtonContext();

export function ListBook() {
  const { onLoading, books, filteredBooks, filter, searchBookTitle } = useBookRequest();
  // console.log("filteredBooks: ", filteredBooks);
  const [button, setButton] = useState<INTERFACE_FILTER_BUTTON>({ onId: "0", filterTypeData: { categoryIs: "", languageIs: "" } });
  const [toSearch, setToSearch] = useState<INTERFACE_SEARCH_CONTEXT>({ title: "" });

  useEffect(() => {
    filter({ categories: "", languages: "" });
    setToSearch({ title: "" });
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
    filter({ categories: updatedButtonData.filterTypeData.categoryIs, languages: updatedButtonData.filterTypeData.languageIs });
    setButton(updatedButtonData);
  }

  const imageLoader = (isbn: string) => {
    const ip = process.env.API_BASE_URL;
    return `${ip}/book/getCover?isbn=${isbn}`;
  };

  return (
    <div className={`w-5/6 h-[85%] relative top-8 border-yellow-500 border-4 bg-black rounded-2xl flex flex-col items-center`} onClick={() => onLeave()}>
      <SearchContext.Provider value={[toSearch, setToSearch]}>
        <ButtonFilterContext.Provider value={[button, { onClear, onOptionSelected, onClicked, onLeave }]}>
          <SearchBar className="mb-2 mt-5 relative" />
          <div className={`w-full h-[5%] flex justify-center bg-white/0 mt-3 items-center relative z-10 gap-6`}>
            <FilterButton
              booksData={books}
              buttonTypeId="1"
              filterTypeLabel="Category"
              contextSub={ButtonFilterContext}
              className=" z-20 h-full w-[150px] bg-black text-white  pr-1 rounded-lg relative active:bg-opacity-75 active:scale-105 duration-200"
            />
            <FilterButton
              booksData={books}
              buttonTypeId="2"
              filterTypeLabel="Language"
              contextSub={ButtonFilterContext}
              className="z-20 h-full w-[150px] bg-black text-white  pr-1 rounded-lg relative active:bg-opacity-75 active:scale-105 duration-200"
            />
          </div>
        </ButtonFilterContext.Provider>
      </SearchContext.Provider>

      <hr className="w-[80%] h-1 mt-4" />
      <div
        className={`w-[95%] h-[68%] flex flex-wrap ${
          onLoading ? " items-center justify-center" : "justify-start"
        }   border-4 border-yellow-500 rounded-xl bg-black/70 overflow-y-auto absolute top-[165px] scrollbar-hide pl-10 pt-6`}
      >
        {onLoading ? (
          <>
            <h1 className="text-white text-3xl">Loading</h1>
          </>
        ) : (
          <>
            {filteredBooks.map((value, index) => (
              <div
                key={index}
                onClick={() => {
                  console.log("index: ", index);
                  console.log("booksData: ", filteredBooks);
                  console.log("booksData: ", filteredBooks[index]);
                }}
                id={index.toString()}
                className="w-[230px] h-[300px] bg-slate-50/50 rounded-md hover:border-4 hover:border-yellow-300 mr-3 relative mb-3"
              >
                <Image loader={() => imageLoader(`${filteredBooks[index].isbn}`)} src={"tes.png"} fill alt={`cover book ${value.titles}.png`} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
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
      <div className={`${className} w-full h-[7%] flex justify-center relative gap-3`}>
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
