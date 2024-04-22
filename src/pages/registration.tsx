import Link from "next/link";
import React, { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { apiFetcher } from "./_app";
import { AxiosError } from "axios";
import { useRouter } from "next/router";

interface formField {
  FirstName: string;
  LastName: string;
  NIK: string;
  Gender: string | null;
  Username: string;
  Email: string;
  Password: string;
  ConfirmPassword?: string;
}

export default function Index() {
  const [msg, setMsg] = useState("");
  const [formIndex, setFormIndex] = useState(0);
  const [wait, setWait] = useState(false);
  const methods = useForm<formField>();
  const router = useRouter();
  const onSubmit = async (data: formField) => {
    if (Object.values(data).includes("") || Object.values(data).includes(null)) return;
    if (data.Password !== data.ConfirmPassword) {
      methods.setError("Password", { message: "Password tidak sesuai! *" });
      return;
    }
    setWait(true);
    const result = await sendRegistrationRequest(data);
    if (result instanceof AxiosError) {
      console.log("result.response?.data: ", result.response?.data);
      Object.keys(result.response?.data.error).map((e) => {
        console.log(e);
        if (e === "NIK") {
          methods.setError(`NIK`, { message: "* NIK ini sudah terdaftar!" });
          return setFormIndex(0);
        }
        if (e === "Username") return methods.setError(`Username`, { message: "* Username ini sudah terdaftar!" });
        if (e === "Email") return methods.setError(`Email`, { message: "* Email ini sudah terdaftar!" });
        return setTimeout(() => {
          setWait(false);
        }, 1500);
      });
    } else {
      methods.reset();
      setMsg("Registrasi berhasil!");
      console.log("Registrasi berhasil");
      return setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  return (
    <main className={`h-screen w-screen flex justify-center items-center`}>
      <div className="bg-black/40 h-[722px] w-[487px] rounded-2xl border-2 border-blue-500 relative">
        <div className="h-[10%] w-full">
          <h1 className="text-center text-4xl font-bold text-white mt-10 ">REGISTRATION PAGE</h1>
          <hr className=" ml-[10%] mt-7 w-4/5 border-[#FF5A5A] border-[1px] mb-6" />

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {formIndex === 0 ? <UserInformationForm /> : <UserAccountForm />}
              <hr className=" ml-[10%] mt-7 w-4/5 border-[#FF5A5A] border-[1px] mb-7" />

              <div className="w-full bg-slate-400/0 mt-3 flex justify-center gap-4">
                <button
                  type="button"
                  className={`w-1/3 border border-red-400 rounded-md h-10  p-1 ${formIndex === 0 ? "bg-black/70 text-white/25 cursor-not-allowed" : "bg-black/50 cursor-pointer"}  text-white`}
                  onClick={() => setFormIndex(0)}
                  disabled={formIndex === 0}
                >
                  Back
                </button>
                <button
                  type={formIndex === 0 ? "button" : "submit"}
                  className="w-1/3 border border-red-400 rounded-md h-10  p-1 bg-black/50 cursor-pointer text-white"
                  // disabled={formIndex !== 0}
                  disabled={wait}
                  onClick={() => {
                    setFormIndex(1);
                    if (formIndex === 1) {
                      if (Object.values(methods.getValues()).includes("") || Object.values(methods.getValues()).includes(null)) {
                        setMsg("Silahkan isi form registrasi secara lengkap!");
                        setTimeout(() => {
                          setMsg("");
                        }, 2500);
                      }
                    }
                  }}
                >
                  {wait === true ? "Wait" : formIndex === 0 ? "Next" : "Register"}
                </button>
              </div>
            </form>
          </FormProvider>

          <div className="flex justify-center items-center mt-7 gap-2">
            <hr className="  w-[20%] border-[#FF5A5A] border-[1px]" />
            <label htmlFor="" className="font-semibold text-base text-yellow-500">
              Already have an account?
            </label>
            <hr className="  w-[20%] border-[#FF5A5A] border-[1px] " />
          </div>
          <div className="w-full flex justify-evenly mt-7">
            <Link
              href={"/"}
              className="   h-14 w-44 bg-black bg-opacity-[.25] rounded-xl font-bold text-2xl text-white border-[1px] border-red-500 hover:bg-[#FFA6C6] hover:bg-opacity-[.75] active:bg-opacity-[.85] text-center duration-200 flex justify-center items-center"
            >
              Login
            </Link>
          </div>
        </div>
        {msg && (
          <div className="absolute h-full w-full  bg-black/75 rounded-xl top-0 flex justify-center items-center">
            <div className=" h-auto w-auto p-5 bg-orange-100/90 rounded-xl top-0 border-2 border-red-500">
              <h1 className="text-center  text-3xl font-bold">Information!</h1>
              <hr className="border border-red-300 mb-2 mt-1" />
              <p>{msg} </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function UserInformationForm() {
  interface UserInformationFormField {
    FirstName: string;
    LastName: string;
    NIK: string;
    Gender: string | null;
  }
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<UserInformationFormField>(); // retrieve all hook methods

  const numberGuard = (e: React.ChangeEvent) => {
    let value;
    const revalidate = (e.target as HTMLInputElement).value;
    if ((e.target as HTMLInputElement).value.length > 1) {
      value = parseInt((e.target as HTMLInputElement).value.split("").at(-1)!);
      // console.log((e.target as HTMLInputElement).value);
      // console.log("value: ", Number.isInteger(value));
      if (!Number.isInteger(value)) setValue("NIK", revalidate.slice(0, revalidate.length - 1));
      else setValue("NIK", revalidate);
      return;
    }
    if (!Number.isInteger(parseInt((e.target as HTMLInputElement).value))) setValue("NIK", revalidate.slice(0, revalidate.length - 1));
  };
  return (
    <div className="w-full h-auto bg-slate-500/0 flex flex-col items-center">
      <div className="relative w-full h-auto bg-slate-500/0 flex flex-col items-start ml-10">
        <label htmlFor="FirstName" className="text-xl text-white">
          First Name
        </label>
        <input
          id="FirstName"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("FirstName")}
        />
        <label htmlFor="LastName" className="text-xl text-white">
          Last Name
        </label>
        <input
          id="LastName"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("LastName")}
        />
        <label htmlFor="NIK" className="text-xl text-white">
          NIK
        </label>
        <input
          id="NIK"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("NIK", { onChange: (e) => numberGuard(e) })}
        />
        {errors.NIK && (
          <div className="absolute bottom-[51px] left-[37px] bg-black/50 pl-2 pr-2 rounded-lg">
            <p className=" text-red-200">{errors.NIK.message}</p>
          </div>
        )}
      </div>

      <label htmlFor="" className="text-xl text-white mb-3 mt-1">
        Gender
      </label>

      <div className="flex gap-4  w-full justify-center" id="genderOption">
        <div className="border border-red-400 rounded-md h-10 w-1/3 p-1 bg-black/50 cursor-pointer flex justify-center items-center" onClick={() => setValue("Gender", "F")}>
          <input
            id="Gender_Female"
            type="radio"
            checked={getValues("Gender") === "F" ? true : undefined}
            className="appearance-none checked:bg-green-400 h-3 w-3 rounded-full ring ring-indigo-100 ml-2"
            {...register("Gender")}
            value={"F"}
          />
          <label htmlFor="Gender_Female" className="text-lg ml-2 text-white mr-2 relative bottom-[1px]">
            Female
          </label>
        </div>
        <div className="border border-red-400 rounded-md h-10 w-1/3 p-1 bg-black/50 cursor-pointer flex justify-center items-center" onClick={() => setValue("Gender", "M")}>
          <input
            id="Gender_Male"
            type="radio"
            checked={getValues("Gender") === "M" ? true : undefined}
            className="appearance-none checked:bg-green-400 h-3 w-3 rounded-full ring ring-indigo-100 ml-2"
            {...register("Gender")}
            value={"M"}
          />
          <label htmlFor="Gender_Male" className="text-lg ml-2 text-white mr-2">
            Male
          </label>
        </div>
      </div>
    </div>
  );
}

function UserAccountForm() {
  interface UserInformationFormField {
    Username: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
  }
  const {
    register,
    formState: { errors },
  } = useFormContext<UserInformationFormField>(); // retrieve all hook methods
  return (
    <div className="w-full h-auto bg-slate-500/0 flex flex-col items-center">
      <div className="w-full h-auto bg-slate-500/0 flex flex-col items-start ml-10 relative">
        <label htmlFor="Username" className="text-xl text-white">
          Username
        </label>
        <input
          id="Username"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("Username")}
        />

        {errors.Username && (
          <div className="absolute top-[1px] left-[98px] bg-black/50 pl-2 pr-2 rounded-lg">
            <p className=" text-red-200">{errors.Username.message}</p>
          </div>
        )}

        <label htmlFor="Email" className="text-xl text-white">
          Email
        </label>
        <input
          id="Email"
          type="email"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9 bg-clip-text  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          style={{ WebkitTextFillColor: "white" }}
          {...register("Email")}
        />

        {errors.Email && (
          <div className="absolute top-[77px] left-14 bg-black/50 pl-2 pr-2 rounded-lg">
            <p className="  text-red-200">{errors.Email.message}</p>
          </div>
        )}

        <label htmlFor="Password" className="text-xl text-white">
          Password
        </label>
        <input
          id="Password"
          type="password"
          autoComplete="off"
          className="w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("Password")}
        />
        <label htmlFor="ConfirmPassword" className="text-xl text-white">
          Confirm Password
        </label>
        <input
          id="ConfirmPassword"
          type="password"
          autoComplete="off"
          className=" w-[91%]  focus:outline-none h-9  bg-black/20 rounded-tr-sm rounded-tl-sm border-b text-white  focus:outline-0 text-xl mb-3 pl-2"
          {...register("ConfirmPassword")}
        />
        {errors.Password && (
          <div className="absolute bottom-[52px] left-[170px] bg-black/50 pl-2 pr-2 rounded-lg">
            <p className="  text-red-200">{errors.Password.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function sendRegistrationRequest(userData: formField) {
  const requestData = { ...userData };
  delete requestData.ConfirmPassword;
  try {
    const response = await apiFetcher.post("/register", requestData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("response: ", response.data);
    return { status: true, message: response.data };
  } catch (error) {
    return error;
  }
}
