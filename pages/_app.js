import store from "@/store/store";
import "../styles/globals.css";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { Inter } from 'next/font/google';


const inter = Inter({
  subsets: ['latin'],
  variable: '--inter-font-family',
});

export default function App({ Component, pageProps }) {


  useEffect(() => {
    import("bootstrap/dist/css/bootstrap.min.css");
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>

      <Provider store={store}>
        <div className={inter.variable}>
        <Component {...pageProps} />
        </div>
      </Provider>
    </>
  );
}
