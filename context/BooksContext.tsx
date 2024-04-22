import { apiFetcher } from "@/pages/_app";
import { Search } from "@mui/icons-material";
import { title } from "process";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { string } from "yup";
import { useAuth } from "./authContext";
import { promises } from "dns";

type Props = {
  children: ReactNode;
};

type listTokenType = { accessToken: string; refreshToken: string };

export interface BOOK_RESPONSE {
  isbn: string;
  availability: string;
  titles: string;
  languages: string;
  authors: string;
  year: string;
  categories: string;
  editions: string;
  publishers: string;
}

export interface FILTER_CONTENT_INTERFACE {
  languages: string;
  categories: string;
}

export interface SEARCH_INTERFACE {
  title: string;
}

interface BOOKS_CONTEXT {
  onLoading: boolean;
  isError: boolean;
  books: BOOK_RESPONSE[] | [];
  filteredBooks: BOOK_RESPONSE[] | [];
  filter: ({ categories, languages }: FILTER_CONTENT_INTERFACE) => void;
  reloadBookData: () => Promise<void>;
  searchBookTitle: ({ title }: SEARCH_INTERFACE) => void;
}

const BooksContextDefaultValues: BOOKS_CONTEXT = {
  isError: false,
  onLoading: true,
  filteredBooks: [],
  books: [],
  filter: ({ categories, languages }) => {},
  searchBookTitle: ({}) => {},
  reloadBookData: async () => {},
};

export function useBookRequest() {
  return useContext(BooksContext);
}
const BooksContext = createContext<BOOKS_CONTEXT>(BooksContextDefaultValues);

export function BookContextProvider({ children }: Props) {
  const [booksData, setBooksData] = useState<BOOK_RESPONSE[] | []>([]);
  const [booksDataBackup, setBooksDataBackup] = useState<BOOK_RESPONSE[] | []>([]);
  const [filteredBookData, setFilteredData] = useState<BOOK_RESPONSE[] | []>([]);
  const [onLoading, setOnLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { logout, setUserContext } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { accessToken, refreshToken } = getAllToken();
        if (accessToken === null || refreshToken === null) {
          setUserContext(undefined, undefined);
          logout();
        }
        const data = await getBookList();
        if (data instanceof Error) throw data as Error;
        setBooksData(data);
        setFilteredData(data);
        setBooksDataBackup(data);
      } catch (error: any) {
        setError(true);
        console.log("error+>: ", error.message);
      }
      setOnLoading(false);
    })();
  }, []);

  const reloadBookData = async () => {
    try {
      const data = await getBookList();
      // console.log("data: ", data);
      if (data instanceof Error) throw data as Error;
      setBooksData(data);
      setFilteredData(data);
      setBooksDataBackup(data);
      console.log("data: ", data);
    } catch (error: any) {
      setError(true);
      console.log("error+>: ", error.message);
    }
    setOnLoading(false);
  };

  const filter = ({ categories, languages }: FILTER_CONTENT_INTERFACE) => {
    // console.log("categories, languages: ", categories, languages);
    let bookFiltered = [];
    if (categories === "" && languages === "") {
      setFilteredData(booksData);
      return;
    } else if (categories !== "" && languages === "") {
      bookFiltered = [...booksData].filter((book) => book.categories === categories);
    } else if (categories === "" && languages !== "") {
      bookFiltered = [...booksData].filter((book) => book.languages === languages);
    } else {
      bookFiltered = [...booksData].filter((book) => book.languages === languages && book.categories === categories);
    }
    setFilteredData(bookFiltered);
    console.log("bookFiltered: ", bookFiltered);
  };

  const searchBookTitle = ({ title }: SEARCH_INTERFACE) => {
    if (title === "") {
      setBooksData(booksDataBackup);
      setFilteredData(booksDataBackup);
      return;
    }

    let bookOption = [];
    // bookOption = [...booksData].filter((book) => book.titles === title);
    bookOption = [...booksData].filter((book) => book.titles.toLowerCase().includes(title.toLocaleLowerCase()));
    setBooksData(bookOption);

    let bookFiltered = [];
    bookFiltered = [...booksData].filter((book) => book.titles.toLowerCase().includes(title.toLocaleLowerCase()));
    setFilteredData(bookFiltered);
  };
  const value: BOOKS_CONTEXT = { isError: error, onLoading, books: booksData, filteredBooks: filteredBookData, filter, searchBookTitle, reloadBookData };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

async function getBookList(): Promise<BOOK_RESPONSE[] | Error> {
  return await new Promise(async (resolve, reject): Promise<void | BOOK_RESPONSE[] | string | Error> => {
    const { accessToken, refreshToken } = getAllToken();
    try {
      const response = await apiFetcher.get("/book/website/getBook", { params: { accessToken, refreshToken } });
      console.log("response: ", response.data?.data);
      resolve(response.data?.data);
    } catch (error) {
      console.log("error: ", error);
    }
  });
}

export const getAllToken = (): listTokenType => {
  if (localStorage.getItem("_USER_INFORMATION") !== null) {
    const { username } = JSON.parse(localStorage.getItem("_USER_INFORMATION")!);
    const { accessToken, refreshToken } = JSON.parse(sessionStorage.getItem(username)!);
    return { accessToken, refreshToken };
  }
  return { accessToken: "", refreshToken: "" };
};
