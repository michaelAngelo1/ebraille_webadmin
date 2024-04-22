import { LoadingPage } from "components/Loading";
import Navbar from "components/navbar";
import { useAuth } from "context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import React, { useState, createContext } from "react";
import { ListBook } from "components/listBook";
import UpdateBooks from "components/updateBookComponent";
import { RemoveBook } from "components/RemoveBook";
import { AddBook } from "components/AddBook";
import { BookContextProvider } from "context/BooksContext";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import EditRole from "components/EditRole";
import useWebSocket from "react-use-websocket";

interface ContextType {
  mode: number;
}
type IModeContext = [React.Dispatch<React.SetStateAction<ContextType>>];
export const ModeContext = createContext<IModeContext>([() => null]);

export default function Index() {
  const IP = "localhost:3001";
  // const IP = "localhost:5432";
  const { lastJsonMessage, readyState, sendMessage } = useWebSocket(`ws://${IP}/&UID=ADMIN`, {
    shouldReconnect: (closeEvent) => {
      console.log("closeEvent: ", closeEvent);
      console.log("shouldReconnect triggered!");
      return true;
    },
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    retryOnError: true,
  });
  const route = useRouter();
  const { authenticated, loadingPage, UserContext } = useAuth();
  const role = UserContext.role;
  const [notificationButton, setNotificationButton] = useState(false);
  const [mode, setMode] = useState<ContextType>({ mode: 0 });
  const [helpRequest, setHelpRequest] = useState({});

  useEffect(() => {
    console.log("mode: ", mode);
    const onMode = mode.mode;
    switch (onMode) {
      case 1:
        route.replace({ pathname: "/dashboard" }, "/dashboard/AddBook", { shallow: true });
        break;
      case 2:
        route.replace({ pathname: "/dashboard" }, "/dashboard/editBook", { shallow: true });
        break;
      case 3:
        route.replace({ pathname: "/dashboard" }, "/dashboard/removeBook", { shallow: true });
        break;
      case 4:
        break;
      default:
        route.replace({ pathname: "/dashboard" }, "/dashboard", { shallow: true });
        break;
    }
  }, [mode]);

  useEffect(() => {
    const newMessage: any = { ...lastJsonMessage };
    const requestList: any = { ...helpRequest };
    if (lastJsonMessage !== null && role !== "USER") {
      requestList[`${newMessage.deviceID}`] = Date.now();
      console.log("requestList: ", requestList);
      sessionStorage.setItem("notificationCache", JSON.stringify(requestList));
      notifyMe(newMessage.deviceID);
      setHelpRequest(requestList);
    }
  }, [lastJsonMessage]);

  type MyComponentProps = {
    modeState: ContextType;
  };
  const modeSelector: React.FC<MyComponentProps> = ({ modeState }) => {
    const onMode = mode.mode;
    switch (onMode) {
      case 1:
        return <AddBook role={role} />;
      case 2:
        return (
          <BookContextProvider>
            <UpdateBooks />;
          </BookContextProvider>
        );
      case 3:
        return (
          <BookContextProvider>
            <RemoveBook />;
          </BookContextProvider>
        );
      case 4:
        return <EditRole />;
      default:
        return (
          <>
            <BookContextProvider>
              <ListBook />;
            </BookContextProvider>
          </>
        );
    }
  };

  useEffect(() => {
    if (!authenticated) route.push("/");
    else {
      const notifCache = sessionStorage.getItem("notificationCache");
      if (notifCache !== null) setHelpRequest(JSON.parse(notifCache));
    }
  }, [authenticated, loadingPage, route, role]);
  if (!authenticated || loadingPage) return <LoadingPage />;

  console.log("API_BASE_URL: ", process.env.API_BASE_URL);

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen relative flex">
        <ModeContext.Provider value={[setMode]}>
          <Navbar role={UserContext.role} username={UserContext.username} />
        </ModeContext.Provider>
        <div className="h-full w-full flex justify-center items-center relative ">{modeSelector({ modeState: mode })}</div>

        {notificationButton && (
          <div className=" w-64 h-[75%] bg-yellow-300/90 absolute bottom-24 right-10 rounded-lg flex flex-col  items-center  border-2 border-blue-600 p-2 z-50">
            <div className="w-full h-full overflow-y-auto scrollbar-hide rounded-lg">
              {Object.keys(helpRequest).map((v, i) => (
                <div className="w-[100%] h-20 bg-white rounded-lg mb-1 border-2 border-red-500 flex" key={i}>
                  <button
                    onClick={() => {
                      const latestHelpRequest: any = { ...helpRequest };
                      delete latestHelpRequest[`${v}`];
                      sessionStorage.setItem("notificationCache", JSON.stringify(latestHelpRequest));
                      setHelpRequest(latestHelpRequest);
                      console.log("readyState:", readyState);
                    }}
                    className="h-full w-1/4 bg-green-300 active:bg-green-800 active:text-white flex justify-center items-center rounded-l-md font-bold relative "
                  >
                    OK
                  </button>
                  <div className="w-3/4 h-full rounded-r-md flex flex-col justify-center border-l border-b">
                    <p className=" font-bold text-center">DEVICE ID: {v}</p>
                    <p className=" text-center">Need Help!</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {role !== "USER" && (
          <div
            onClick={() => {
              setNotificationButton(!notificationButton);
            }}
            className=" w-10 h-10 bg-yellow-300/90 absolute bottom-10 right-10 rounded-lg flex justify-center items-center "
          >
            <NotificationsActiveIcon color="primary" />
            <div className=" absolute flex justify-center items-center w-5 h-5 rounded-full bg-red-500 -bottom-3 -right-3 outline outline-blue-500">
              <p className="text-white">{Object.keys(helpRequest).length.toString()}</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function notifyMe(Device_ID: string) {
  if (!("Notification" in window)) {
    alert(`User on Device: ${Device_ID} need some help!`);
  } else if (Notification.permission === "granted") {
    const notification = new Notification(`User on Device: ${Device_ID} need some help!`);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const notification = new Notification(`User on Device: ${Device_ID} need some help!`);
      }
    });
  } else {
    alert(`User on Device: ${Device_ID} need some help!`);
  }
}
