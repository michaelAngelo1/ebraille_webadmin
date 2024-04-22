import Image from "next/image";
import profilePic from "../asset/profile picture.png";
import bookVector from "../asset/bookVector.svg";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FlipCameraAndroidOutlinedIcon from "@mui/icons-material/FlipCameraAndroidOutlined";
import React, { useState, createContext, useContext } from "react";
import { useRouter } from "next/router";
import { apiFetcher } from "../src/pages/_app";
import { useAuth } from "context/authContext";
import { ModeContext } from "@/pages/dashboard";

interface ContextType {
  btn1_triggered: boolean;
  btn2_triggered: boolean;
}
interface successResponseSchema {
  accessToken: string;
  refreshToken: string;
  role: string;
}

type IButtonContext = [ContextType, React.Dispatch<React.SetStateAction<ContextType>>];

const ButtonContext = createContext<IButtonContext>([{ btn1_triggered: false, btn2_triggered: false }, () => null]);

interface navbarDataSchema {
  username: string | undefined;
  role: string | undefined;
  imgURL?: string;
}

export default function Navbar({ username, role }: navbarDataSchema) {
  const [triggered, setTrigger] = useState<ContextType>({ btn1_triggered: false, btn2_triggered: false });
  return (
    <ButtonContext.Provider value={[triggered, setTrigger]}>
      <nav className="w-full h-[70px] bg-cyan-300 bg-opacity-[.95] fixed flex items-center justify-between z-[99999]" onMouseLeave={() => setTrigger({ btn1_triggered: false, btn2_triggered: false })}>
        <Profile name={username} role={role} />

        {role === undefined ? (
          <div className=" relative right-2 w-40 h-9 bg-black/75 animate-[pulse_1.3s_infinite] rounded-md " />
        ) : (
          <div className=" flex gap-2 relative right-2">
            <Home />
            {role !== "USER" && <BookSetting role={role} />}
            <CommonSetting role={role} />
          </div>
        )}
      </nav>
    </ButtonContext.Provider>
  );
}

interface profileDataConfig {
  name: string | undefined;
  role: string | undefined;
  imgURL?: string;
  className?: string;
}

function Profile({ name, role, imgURL, className }: profileDataConfig) {
  return (
    <div className="h-[90%] w-1/6 m-1 flex gap-1 bg-slate-0">
      <Image src={profilePic} alt={"profile picture"} className=" w-14 h-14 rounded-full bg-black" />
      <div className="h-14  w-auto flex flex-col ">
        <p className="text-xl font-bold relative left-[2px]">{name}</p>
        <div className="flex gap-1">
          <div className=" w-auto h-7 bg-black flex justify-center items-center rounded-2xl">
            <p className="text-center text-orange-400 font-bold m-2 ">{role}</p>
          </div>
          <div className="w-7 h-7 rounded-full border-black border-[1px] bg-green-400"></div>
        </div>
      </div>
    </div>
  );
}

interface CommonSettingDataSchema {
  role: string;
  className?: string;
  onClick?: () => void;
}

function BookSetting({ role, className }: CommonSettingDataSchema) {
  const [triggered, setTrigger] = useContext(ButtonContext);
  const [setMode] = useContext(ModeContext);
  const onClickHandler = () => {
    setTrigger({ btn1_triggered: !triggered.btn1_triggered, btn2_triggered: false });
  };
  return (
    <div className="relative" onClick={() => onClickHandler()}>
      <div className={`w-11 h-11 bg-black hover:bg-slate-800 rounded relative  ${className} flex justify-center items-center`}>
        <div className="absolute  w-11 h-11 flex justify-center items-center">
          <Image src={bookVector} alt={"book control img"} height={60} width={60} style={{ filter: "invert(100%) sepia(0%) saturate(0%) hue-rotate(94deg) brightness(102%) contrast(101%)" }} />
        </div>
      </div>
      {triggered.btn1_triggered === true && (
        <>
          <div className="bg-black w-[189px] h-[136px] absolute right-0 mt-1 rounded-md flex flex-col items-center justify-around">
            <div
              className="duration-100 hover:bg-slate-300 hover:bg-opacity-25 w-full pl-4"
              onClick={() => {
                setMode({ mode: 1 });
              }}
            >
              <p className="text-white">
                Add New Book
                <span>
                  <AddIcon className="ml-7" />
                </span>
              </p>
            </div>
            <hr className="bg-white text-white h-[1px] w-5/6" />
            <div
              className="duration-100 hover:bg-slate-300 hover:bg-opacity-25 w-full pl-4"
              onClick={() => {
                setMode({ mode: 2 });
              }}
            >
              <p className="text-white ">
                Update Book
                <span>
                  <FlipCameraAndroidOutlinedIcon className="ml-[39px] relative left-0" fontSize={"small"} />
                </span>
              </p>
            </div>
            <hr className="bg-white text-white h-[1px] w-5/6" />
            <div
              className="duration-100 hover:bg-slate-300 hover:bg-opacity-25 w-full pl-4"
              onClick={() => {
                setMode({ mode: 3 });
              }}
            >
              <p className="text-white ">
                Remove Book
                <span>
                  <DeleteOutlineOutlinedIcon className="ml-[39px] relative right-2" />
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface bookSettingDataSchema {
  role: string;
  className?: string;
  onClick?: () => void;
}

function CommonSetting({ role, className, onClick }: bookSettingDataSchema) {
  const { logout } = useAuth();
  const [triggered, setTrigger] = useContext(ButtonContext);
  const [setMode] = useContext(ModeContext);
  const route = useRouter();
  const onClickHandler = () => {
    setTrigger({ btn1_triggered: false, btn2_triggered: !triggered.btn2_triggered });
  };

  async function onLogout() {
    const { username } = JSON.parse(localStorage.getItem("_USER_INFORMATION")!);
    try {
      localStorage.removeItem("_USER_INFORMATION");
      sessionStorage.removeItem(username);
      await requestLogout(username);
      logout();
      route.push("/");
    } catch (error: any) {
      console.log("error: ", error.response.data);
    }
    // localStorage.removeItem("_USER_INFORMATION");
    // sessionStorage.removeItem(username);
    // route.replace("/");
  }

  return (
    <div className="relative" onClick={() => onClickHandler()}>
      <div className={`w-11 h-11 bg-black hover:bg-slate-800 rounded relative ${className} flex justify-center items-center`}>
        <div className="absolute  w-11 h-11 flex justify-center items-center">
          <ExpandMoreOutlinedIcon sx={{ color: "#FFFFFF" }} />
        </div>
      </div>
      {triggered.btn2_triggered === true && (
        <>
          <div className="bg-black w-36 h-auto absolute right-0 mt-1 rounded-md flex flex-col items-center justify-around duration-300 ">
            {role === "ADMIN" && (
              <>
                <div
                  className="duration-100 hover:bg-slate-300 hover:bg-opacity-25 w-full pl-2  m-2 cursor-pointer"
                  onClick={() => {
                    setMode({ mode: 4 });
                  }}
                >
                  <p className="text-white">
                    Role Setting
                    <span>
                      <AssignmentIndIcon className="ml-2" />
                    </span>
                  </p>
                </div>
                <hr className="bg-white text-white h-[1px] w-5/6" />
              </>
            )}
            <div className="duration-100 hover:bg-slate-300 hover:bg-opacity-25 w-full pl-2 m-2" onClick={() => onLogout()}>
              <p className="text-white ">
                Logout
                <span>
                  <LogoutOutlinedIcon className="ml-[39px] relative left-1" />
                </span>{" "}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

async function requestLogout(username: string): Promise<successResponseSchema> {
  return await new Promise(async (resolve, reject) => {
    try {
      console.log("username: ", username);
      const response = await apiFetcher.get("/logout", {
        params: {
          username,
        },
      });

      console.log("response: ", response);

      return resolve(response.data);
    } catch (error) {
      // console.log("error: ", error);
      reject(error);
      // if (error instanceof axios.AxiosError) return reject({ code: error.response?.data.code, message: error.response?.data.message });
      // return reject(new Error("An unexpected error occurred"));
    }
  });
}

function Home({ ...className }) {
  const [setMode] = useContext(ModeContext);
  const [triggered, setTrigger] = useContext(ButtonContext);
  return (
    <div
      className="relative"
      onClick={() => {
        setTrigger({ btn1_triggered: false, btn2_triggered: false });
        setMode({ mode: 0 });
      }}
    >
      <div className={`w-11 h-11 bg-black hover:bg-slate-800 rounded relative  ${className} flex justify-center items-center`}>
        <div className="absolute  w-11 h-11 flex justify-center items-center">
          <HomeOutlinedIcon sx={{ color: "#FFFFFF" }} />
        </div>
      </div>
    </div>
  );
}
