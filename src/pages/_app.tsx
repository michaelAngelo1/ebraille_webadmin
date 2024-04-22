import "@/styles/globals.css";
import type { AppProps } from "next/app";
import axios from "axios";
import { AuthProvider } from "context/authContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

const bg = "/mountains-1412683.svg";
const apiFetcher = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 2500,
  // responseType: "json",
});
// delete apiFetcher.defaults.headers;

export { bg, apiFetcher };
