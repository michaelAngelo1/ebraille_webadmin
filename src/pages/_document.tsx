import { Html, Head, Main, NextScript } from "next/document";
import Image from "next/image";
import { bg } from "./_app";
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-slate-600 w-screen h-screen">
        {/* <Image src={bg} alt="bg" fill={true} className="object-cover object-center fixed -z-[999999]" priority /> */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
