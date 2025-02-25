const WebApp = typeof window !== "undefined" ? require("@twa-dev/sdk") : {  };

export const commonHeaders = () => {
  return {
    // @ts-ignore
    Authorization: `Bearer ${window.Telegram.WebApp.initData}`,
  }
}

