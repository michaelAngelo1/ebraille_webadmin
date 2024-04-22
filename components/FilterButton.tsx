import { ClearRounded, ExpandMoreOutlined } from "@mui/icons-material";
import { BOOK_RESPONSE, useBookRequest } from "context/BooksContext";
import { createContext, useContext, useEffect, useState } from "react";

export interface INTERFACE_FILTER_BUTTON {
  onId: string;
  filterTypeData: { categoryIs: string; languageIs: string };
}

export interface INTERFACE_FILTER_BUTTON_HOOKS {
  onClicked: (buttonId: string) => void;
  onLeave: () => void;
  onOptionSelected: (optionType: string, selected: string) => void;
  onClear: (optionType: string) => void;
}

export type TYPE_BUTTON_CONTEXT = [INTERFACE_FILTER_BUTTON, INTERFACE_FILTER_BUTTON_HOOKS];

export function createButtonContext() {
  return createContext<TYPE_BUTTON_CONTEXT>([
    { onId: "0", filterTypeData: { categoryIs: "", languageIs: "" } },
    {
      onClicked: (buttonId: string) => null,
      onLeave: () => null,
      onOptionSelected: (optionType: string, selected: string) => null,
      onClear: (optionType: string) => null,
    },
  ]);
}

interface INTERFACE_BUTTON_COMPONENT {
  booksData: BOOK_RESPONSE[];
  buttonTypeId: string;
  filterTypeLabel: string;
  className?: string;
  contextSub: React.Context<TYPE_BUTTON_CONTEXT>;
}
export function FilterButton({ buttonTypeId, filterTypeLabel, className, contextSub, booksData }: INTERFACE_BUTTON_COMPONENT) {
  const { onLoading } = useBookRequest();
  const [selected, setSelected] = useState("");
  const [buttonData, { onClicked, onOptionSelected, onClear, onLeave }] = useContext(contextSub);
  const options = filterOption(filterTypeLabel, booksData);

  return (
    <div className="h-full w-auto">
      {selected !== "" && (
        <button
          className="h-auto w-auto bg-red-600 text-white p-1 rounded-lg relative active:bg-opacity-75 hover:scale-105 duration-200 mr-1"
          onClick={() => {
            setSelected("");
            onClear(filterTypeLabel);
          }}
        >
          <ClearRounded />
        </button>
      )}
      <button type="button" onClick={() => onClicked(buttonTypeId)} className={`relative ${className} ${onLoading && "active:scale-100 bg-slate-800 cursor-wait"}`} disabled={onLoading}>
        {selected === "" ? filterTypeLabel : selected}
        <ExpandMoreOutlined className="ml-2" />
        {buttonData.onId === buttonTypeId && (
          <div
            className={`absolute  w-[150px] ${options.length < 5 ? "h-auto" : "h-[140px]"}  bg-black  top-[52px] rounded-md pt-1 pb-3 flex flex-col items-center overflow-y-auto scrollbar-hide `}
            // onMouseLeave={() => onLeave(buttonTypeId)}
          >
            {options.map((v) => (
              <>
                <input
                  type="button"
                  className=" hover:bg-slate-800 w-full cursor-pointer"
                  value={v}
                  onClick={() => {
                    setSelected(v);
                    onOptionSelected(filterTypeLabel, v);
                  }}
                />
                <hr className="w-[80%] h-1" />
              </>
            ))}
          </div>
        )}
      </button>
    </div>
  );
}

function filterOption(filterTypeIs: string, data: BOOK_RESPONSE[]): string[] {
  let Options: Array<string> = [];
  if (filterTypeIs === "Category") {
    Options = data
      .map((book) => book.categories)
      .reduce((accumulator: any, currentValue) => {
        if (!accumulator.includes(currentValue)) {
          return [...accumulator, currentValue];
        }
        return accumulator;
      }, []);
  } else {
    Options = data
      .map((book) => book.languages)
      .reduce((accumulator: any, currentValue) => {
        if (!accumulator.includes(currentValue)) {
          return [...accumulator, currentValue];
        }
        return accumulator;
      }, []);
  }
  return Options;
}
