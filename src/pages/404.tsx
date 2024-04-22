import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Custom404() {
  const Route = useRouter();
  useEffect(() => {
    setTimeout(() => {
      Route.push("/");
    }, 0);
  }, [Route]);
  return <h1 className="w-screen h-screen flex justify-center items-center">404 - Page Not Found</h1>;
}
