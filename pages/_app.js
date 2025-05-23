import store from "@/store/store";
import "../styles/globals.css";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter-font-family",
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/css/bootstrap.min.css");
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/x-icon"
          href="https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
        />
        <link
          rel="icon"
          type="image/png"
          href="https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://res.cloudinary.com/dad2aebqt/image/upload/v1747227521/favicon_zgyqdj.ico"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Provider store={store}>
        <div className={inter.variable}>
          <Component {...pageProps} />
        </div>
      </Provider>
    </>
  );
}
