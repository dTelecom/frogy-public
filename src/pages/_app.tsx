import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import Head from "next/head";
import React, { useEffect, useRef } from "react";
import { AppProps } from "next/app";
import "@/styles/globals.scss";
import { ToastContainer } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { THEME, TonConnectUIProvider, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { streamApi, userApi } from "@/api";
import { getUser, update } from "@/store/features/userSlice";
import { getFollowersForCurrentUser } from "@/store/features/followingSlice";
import { preloadMultipleImages } from "@/assets/img/preloadImages";
import { updateStreams } from "@/store/features/streamSlice";
import { AppStore, store } from "@/store/store";
import { Provider } from "react-redux";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

const WebApp = typeof window !== "undefined" ? require("@twa-dev/sdk") : {};

const MyApp = (
  {
    Component,
    pageProps
  }: AppProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { i18n } = useTranslation();
  const [, setOptions] = useTonConnectUI();

  const userFriendlyAddress = useTonAddress();

  let defaultLanguage = "en";

  useEffect(() => {
    // @ts-ignore
    if (user.language === "ru") {
      defaultLanguage = "ru";
    }

    if (defaultLanguage !== i18n.language) {
      void i18n.changeLanguage(defaultLanguage);
    }

    setOptions({ language: i18n.language as "en" | "ru" });
  }, [user.language]);

  useEffect(() => {
    if (user.wallet === undefined) {
      return;
    }
    if (userFriendlyAddress === "") {
      return;
    }
    if (user.wallet === userFriendlyAddress) {
      return;
    }

    void userApi.setWallet(userFriendlyAddress);
    dispatch(update({ wallet: userFriendlyAddress }));
  }, [userFriendlyAddress, user, user.wallet]);


  useEffect(() => {
    const load = async () => {
      dispatch(getUser());
      dispatch(getFollowersForCurrentUser());
      await preloadMultipleImages();
      const streams = await streamApi.getStreamsList();
      dispatch(updateStreams(streams));
    };

    void load();

    if (WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.expand();
    }

  }, []);

  if (user.id === 0) return null;

  return (
    <div id="appContainer">
      <Head>
        <title>Streaming app</title>
      </Head>

      <main>
        <Component {...pageProps} />
      </main>

      <ToastContainer
        toastStyle={{ backgroundColor: "transparent", width: "fit-content" }}
        position="top-left"
        autoClose={2000}
        hideProgressBar
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        limit={2}
      />
    </div>
  );
};

const withProvider = (Component: React.FC<AppProps>) => {
  return (props: AppProps) => {
    const storeRef = useRef<AppStore>(undefined);
    if (!storeRef.current) {
      // Create the store instance the first time this renders
      storeRef.current = store;
    }
    return (
      <TonConnectUIProvider
        actionsConfiguration={{
          // @ts-ignore
          twaReturnUrl: `${process.env.TWA_RETURN_URL}`
        }}
        manifestUrl={"https://tma.frogy.live/tonconnect-manifest.json"}
        uiPreferences={{
          theme: THEME.DARK
        }}
      >
        <Provider store={storeRef.current}>
          {/* @ts-ignore */}
          <Component {...props} />
        </Provider>
      </TonConnectUIProvider>
    );
  };
};

export default withProvider(MyApp);
