import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetcher } from "./_app";
import { AxiosError } from "axios";

export default function ForgotPassword() {
  interface validateFormField {
    Username: string;
    Email: string;
    NIK: string;
  }
  const method = useForm<validateFormField>();
  const [isValid, setIsValid] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const { register, handleSubmit, getValues } = method;
  const onValidate = async (data: validateFormField) => {
    try {
      const response = await apiFetcher.get("/forgetPassword/checkDataInformation", { params: data });
      setResponseMessage(response?.data.message);
      setIsValid(true);
      setRequestId(response?.data.resetPasswordRequestID);
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof AxiosError) setResponseMessage(error.response?.data.message);
    }
  };

  return (
    <main className={`h-screen w-screen flex justify-center items-center relative`}>
      <div className="w-[493px] h-[501px] bg-black bg-opacity-90 rounded-2xl flex flex-col items-center justify-center">
        <form className="w-full  flex flex-col items-center  gap-1" onSubmit={handleSubmit(onValidate)}>
          <h1 className="text-white text-center text-5xl font-roboto font-bold">Reset Password</h1>
          <hr className="border w-4/5" />
          <label htmlFor="" className="text-white">
            Username
          </label>
          <input
            type="text"
            className={`pl-1 w-2/4 read-only:bg-slate-400 read-only:cursor-default read-only:focus:outline-none`}
            readOnly={isValid}
            autoComplete="off"
            {...register("Username", { required: true })}
          />
          <label htmlFor="" className="text-white">
            Email
          </label>
          <input
            type="text"
            className={`pl-1 w-2/4 read-only:bg-slate-400 read-only:cursor-default read-only:focus:outline-none`}
            readOnly={isValid}
            autoComplete="off"
            {...register("Email", { required: true })}
          />
          <label htmlFor="" className="text-white">
            NIK
          </label>
          <input
            type="text"
            className={`pl-1 w-2/4 read-only:bg-slate-400 read-only:cursor-default read-only:focus:outline-none`}
            readOnly={isValid}
            autoComplete="off"
            {...register("NIK", { required: true })}
          />
          {!isValid && (
            <div className="flex gap-2">
              <Link href={"/"} className="text-white w-auto h-auto p-2 rounded-lg bg-white/10 border mt-2 ">
                Cancel
              </Link>
              <button type="submit" className="text-white w-auto h-auto p-2 rounded-lg bg-white/10 border mt-2 ">
                Validate
              </button>
            </div>
          )}
          <hr className="border w-4/5 mt-2" />
          {responseMessage !== "" && <p className={isValid ? "text-green-400" : "text-red-400"}>{responseMessage}</p>}
        </form>
        {isValid && <ResetPasswordForm username={getValues("Username")} requestId={requestId} />}
      </div>
    </main>
  );
}

interface ResetPasswordFormProps {
  requestId: string;
  username: string;
}
function ResetPasswordForm({ requestId, username }: ResetPasswordFormProps) {
  const router = useRouter();
  interface setNewPasswordFormField {
    newPassword: string;
    confirmPassword: string;
  }
  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<setNewPasswordFormField>();

  const onSubmitHandler = async (data: setNewPasswordFormField) => {
    console.log("data: ", data);
    if (data.newPassword.length < 8) return setError("confirmPassword", { message: "* password must be at least 8 characters long!" });
    if (data.confirmPassword !== data.newPassword) return setError("confirmPassword", { message: "* password not match!" });
    try {
      const requestData = { newPassword: data.newPassword, resetPasswordRequestID: requestId, Username: username };
      console.log("requestData: ", requestData);
      const response = await apiFetcher.put("/forgetPassword/resetPassword", requestData);
      console.log("response: ", response);
      alert("Reset Password Success!");
      return router.push("/", "/", { shallow: true });
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof AxiosError) alert(error.response?.data.message);
      return router.reload();
    }
  };
  return (
    <form className="w-full flex flex-col items-center justify-center pb-2 pt-2" onSubmit={handleSubmit(onSubmitHandler)}>
      <div className=" w-1/2 flex flex-col ">
        <label htmlFor="" className=" text-white">
          New Password
        </label>
        <input type="password" autoComplete="off" className="w-full pl-[5px]" {...register("newPassword", { required: true })} />
      </div>
      <div className="w-1/2 flex flex-col ">
        <label htmlFor="" className=" text-white">
          Confirm Password
        </label>
        <input type="password" autoComplete="off" className="w-full pl-[5px]" {...register("confirmPassword", { required: true })} />
      </div>
      {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
      <div className=" flex gap-2">
        <Link href={"/"} className="text-white w-auto h-auto p-2 rounded-lg bg-white/10 border mt-3 mb-2">
          Cancel
        </Link>
        <button type="submit" className="text-white w-auto h-auto p-2 rounded-lg bg-white/10 border mt-3 mb-2">
          Reset Password
        </button>
      </div>
    </form>
  );
}
