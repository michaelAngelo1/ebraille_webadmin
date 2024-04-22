import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { apiFetcher } from "./_app";
import { useAuth } from "context/authContext";
import { LoadingAnimation, LoadingPage } from "components/Loading";

interface formDataSchema {
  username: string;
  password: string;
}

interface errorDataSchema {
  code?: unknown;
  message?: string;
}

function instanceOfErrorDataSchema(data: any): data is errorDataSchema {
  return "code" in data;
}

export default function Index() {
  const { status } = useRouter().query;
  if (status === "false") {
    console.log("status: ", status);
    sessionStorage.clear();
  }

  const { authenticated, login, logout, loadingPage, UserContext, setUserContext } = useAuth();
  const [formData, setFormData] = useState<formDataSchema>({ username: "", password: "" });
  const [errorState, setErrorState] = useState({ username: "", password: "", unexpected: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  function onChangeHandel(data: React.ChangeEvent<HTMLInputElement>) {
    const updatedData = { ...formData };
    const updatedError = { ...errorState };

    if (data.target.id === "username") {
      updatedError.username = "";
      updatedData.username = data.target.value;
    } else {
      updatedData.password = data.target.value;
      updatedError.password = "";
    }

    setFormData(updatedData);
    setErrorState(updatedError);
  }

  async function onLoginHandler() {
    setTimeout(async () => {
      setLoading(true);
      try {
        const { accessToken, refreshToken, role } = await requestLogin(formData);
        const localStorageData = {
          username: formData.username,
          role,
          expiration: Date.now() + 1000 * 60 * 180,
        };
        const sessionStorageData = {
          accessToken,
          refreshToken,
        };
        setUserContext(formData.username, role);
        login();
        localStorage.setItem("_USER_INFORMATION", JSON.stringify(localStorageData));
        sessionStorage.setItem(localStorageData.username, JSON.stringify(sessionStorageData));
        router.replace(
          {
            pathname: "/dashboard",
            query: {
              username: formData.username,
              accessToken,
              refreshToken,
            },
          },
          "/dashboard"
        );
      } catch (error) {
        setLoading(false);
        if (error instanceof Error) {
          return console.log("error: ", error.message);
        }
        if (instanceOfErrorDataSchema(error)) {
          const updatedData = { ...formData };
          switch (error.code) {
            case 1:
              updatedData.username = "";
              setErrorState({ username: error.message!, password: "", unexpected: "" });
              setFormData(updatedData);
              break;
            case 2:
              updatedData.password = "";
              setErrorState({ username: "", password: error.message!, unexpected: "" });
              setFormData(updatedData);
              break;
            case 3:
              updatedData.username = "";
              updatedData.password = "";
              setErrorState({ username: "Username tidak boleh kosong!", password: "Password tidak boleh kosong!", unexpected: "" });
              setFormData(updatedData);
              break;
            case 4:
              updatedData.username = "";
              updatedData.password = "";
              setErrorState({ username: "", password: "", unexpected: error.message! });
              setFormData(updatedData);
              break;
          }
        }
        console.log("error: ", error);
      }
    }, 200);
  }

  useEffect(() => {
    try {
      if (authenticated) {
        router.replace(
          {
            pathname: "/dashboard",
          },
          "/dashboard"
        );
      } else if (!authenticated) {
        logout();
        if (localStorage.getItem("_USER_INFORMATION") !== null) {
          const updatedData = { ...formData };
          updatedData.username = JSON.parse(localStorage.getItem("_USER_INFORMATION")!).username;
          setFormData(updatedData);
        }
      }
    } catch (error) {
      localStorage.clear();
      sessionStorage.clear();
      logout();
    }

    // console.log('localStorage.getItem("_USER_INFORMATION"): ', localStorage.getItem("_USER_INFORMATION"));
  }, [authenticated, loadingPage]);
  if (authenticated || loadingPage) return <LoadingPage />;

  return (
    <main className={`h-screen w-screen flex justify-center items-center relative`}>
      <form className="w-[493px] h-[561px] bg-black bg-opacity-90 rounded-2xl flex flex-col items-center justify-around pb-10 pt-10">
        <h1 className="text-white text-center text-5xl font-roboto font-bold">LOGIN</h1>
        <hr className="w-4/6" />
        <h2 className="text-white font-bold text-2xl">Username</h2>
        <input
          autoFocus
          autoComplete="off"
          className={`w-[370px] h-[43px] rounded-2xl  bg-white bg-opacity-0 border  focus:border-none outline-[#1EA987] outline-2 focus:outline text-center text-white ${
            errorState.username !== "" ? "border-red-700" : formData.username === "" ? "border-white" : "border-[#1EA987]"
          }`}
          placeholder={errorState.username}
          id="username"
          type="text"
          onChange={(username) => onChangeHandel(username)}
          value={formData.username}
        />
        <h2 className="text-white font-bold text-2xl">Password</h2>

        <input
          className={`w-[370px] h-[43px] rounded-2xl  bg-white bg-opacity-0 border  focus:border-none outline-[#1EA987] outline-2 focus:outline text-center text-white ${
            errorState.password !== "" ? "border-red-700" : formData.password === "" ? "border-white" : "border-[#1EA987]"
          }`}
          id="password"
          type="password"
          placeholder={errorState.password}
          value={formData.password}
          onChange={(password) => onChangeHandel(password)}
          autoComplete={"current-password"}
        />
        <button
          type="button"
          onClick={() => {
            onLoginHandler();
          }}
          className="text-white w-48 h-14 border border-[#C9FF9F] rounded-3xl mt-1 mb-1 text-xl font-bold hover:drop-shadow hover:shadow-[#50d71e] hover:shadow-md hover:scale-[1.02] duration-200 flex justify-center items-center"
        >
          {loading ? "Loading" : "Login"}
          {loading ? <LoadingAnimation className="h-7 w-7 fill-[#50d71e] ml-2 antialiased" /> : <></>}
        </button>
        <hr className="w-4/6" />
        <div className=" w-full bg-slate-100/10 text-center pt-1 pb-1">
          <p className="text-white relative bottom-[1px]">
            {"Don't have an account?"} Click,
            <Link href={"registration"} className="font-bold text-white underline cursor-pointer ml-[2px]">
              here
            </Link>
          </p>
        </div>
        <div className=" w-full bg-slate-100/10 text-center pt-1 pb-1">
          <p className="text-white relative bottom-[1px]">
            {"Forgot password?"} Click,
            <Link href={"forgotPassword"} className="font-bold text-white underline cursor-pointer ml-[2px]">
              here
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}

interface successResponseSchema {
  accessToken: string;
  refreshToken: string;
  role: string;
}

async function requestLogin({ username, password }: formDataSchema): Promise<successResponseSchema> {
  return await new Promise(async (resolve, reject) => {
    try {
      const response = await apiFetcher.get("/login", {
        params: {
          username,
          password,
        },
      });
      return resolve(response.data);
    } catch (error) {
      if (error instanceof axios.AxiosError) return reject({ code: error.response?.data.code, message: error.response?.data.message });
      return reject(new Error("An unexpected error occurred"));
    }
  });
}
