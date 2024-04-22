import { apiFetcher } from "@/pages/_app";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAllToken } from "context/BooksContext";
import React, { useState } from "react";

export default function EditRole() {
  const queryClient = useQueryClient();
  interface dataUser {
    [index: string]: { newRole: string };
  }
  const [listUserToEdit, setListUserToEdit] = useState<dataUser>({});
  const onClickOptionHandler = (currentRole: string, role: React.MouseEvent, username: string) => {
    const LatestDataOfListUserToEdit: dataUser = { ...listUserToEdit };
    const newRoleIs = (role.target as HTMLInputElement).value;
    if (currentRole === newRoleIs) {
      delete LatestDataOfListUserToEdit[`${username}`];
      return setListUserToEdit(LatestDataOfListUserToEdit);
    }
    console.log("LatestDataOfListUserToEdit: ", LatestDataOfListUserToEdit);
    LatestDataOfListUserToEdit[`${username}`] = { newRole: newRoleIs };
    setListUserToEdit(LatestDataOfListUserToEdit);
    console.log("listUserToEdit: ", LatestDataOfListUserToEdit);
  };
  const wait = async (delay: number) => await new Promise((resolve) => setTimeout(resolve, delay));
  const { accessToken, refreshToken } = getAllToken();
  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey: ["userlist"],
    queryFn: async ({ signal }) => {
      // await wait(5000);
      const response = await apiFetcher.get("/role/getAllUserRole", {
        params: { accessToken, refreshToken },
        signal,
      });
      return response.data.message;
    },
    cacheTime: 15000,
  });

  const myMutation = async (data: dataUser): Promise<void> => {
    const response = await apiFetcher.patch("/role/editRole", listUserToEdit, { headers: { "content-type": "application/x-www-form-urlencoded" } });
    return response.data;
  };

  const postResponse = useMutation<void, Error, dataUser>({
    mutationFn: myMutation,
    onSuccess: () => {
      alert("Role berhasil diganti!");
      refetch();
    },
  });
  const onEditClicked = async () => {
    postResponse.mutate(listUserToEdit);
    setListUserToEdit({});
  };
  // console.log(postResponse.data);
  return (
    <div className="w-[500px] h-[500px] bg-black/30 border-2 rounded-lg flex flex-col items-center p-3 relative">
      <h1 className="text-4xl font-bold mb-1">User List</h1>
      <hr className="border w-3/4 mb-2" />
      <div className="flex-grow w-full bg-slate-200/90 rounded-md p-2 flex flex-col overflow-y-auto">
        <div className="w-full h-auto flex   ">
          <h1 className="bg-slate-100 text-center border-r border-b-2 border-black w-1/2">Name</h1>
          <h1 className="bg-slate-100 text-center border-l border-b-2 border-black w-1/2">Role</h1>
        </div>
        <div className="w-full h-[450px]  bg-black/25 overflow-y-auto scrollbar-hide">
          {isLoading && <h1 className=" text-center relative top-44">LOADING...</h1>}
          {isFetched &&
            data.map((user: any, index: number) => (
              <div className=" flex mb-1 justify-around pt-1" key={index}>
                <h1 className="bg-slate-200 rounded-lg text-center w-[48%]">{user.username}</h1>
                <select className="bg-blue-100 rounded-lg  text-center w-[48%]" onClick={(e) => onClickOptionHandler(user.role, e, user.username)}>
                  <option value={user.role} key="" className="" selected disabled hidden>
                    {user.role}
                  </option>
                  {["PUSTAKAWAN", "USER"].map((role, index) => (
                    <option value={role} key={index} className="">
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      </div>
      {Object.keys(listUserToEdit).length !== 0 && (
        <button type="button" className=" h-auto w-auto pl-3 pr-3 pt-1 pb-1 rounded-lg bg-slate-50 mt-2 absolute -bottom-11" onClick={() => onEditClicked()}>
          Edit
        </button>
      )}
    </div>
  );
}
