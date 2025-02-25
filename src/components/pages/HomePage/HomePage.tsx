import styles from "./HomePage.module.scss";
import { PageWrapper } from "@/components/PageWrapper/PageWrapper";
import { streamApi, userApi } from "@/api";
import { NavBar } from "@/components/NavBar/NavBar";
import { useCallback, useEffect, useRef, useState } from "react";
import { StreamListTile } from "./components/StreamListTile/StreamListTile";
import { AppBar } from "@/components/AppBar/AppBar";
import { UserDrawer } from "@/components/UserDrawer/UserDrawer";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserResponse } from "@/api/user";
import { getUser } from "@/store/features/userSlice";
import { useTranslation } from "react-i18next";
import { PullToRefreshify } from "@/lib/react-pull-to-refreshify";
import { updateStreams } from "@/store/features/streamSlice";
import { StreamListItem } from "@/api/stream";
import { useRouter } from "next/router";

const HomePage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const [userDrawerOpen, setUserDrawerOpen] = useState<UserResponse | null>(
    null
  );
  const navigate = useRouter().push;
  const streamList = useAppSelector((state) => state.streams.items);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const pullingRef = useRef(false);

  const loadData = async () => {
    try {
      dispatch(getUser());
      const streams = await streamApi.getStreamsList();
      dispatch(updateStreams(streams));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const findJoinStream = async (id: number) => {
    if (pullingRef.current) {
      return;
    }
    const stream = streamList.find((stream) => stream.id === id);
    if (!stream) {
      throw new Error("Stream not found");
    }
    await joinStream(stream);
  };

  const joinStream = async (stream: StreamListItem) => {
    const isAdmin = user.id === stream.id;

    if (isAdmin) {
      await navigate(
        {
          pathname: "/start-stream",
          query: {
            stream: JSON.stringify(stream)
          }
        }
      );
      return;
    }

    if (!stream) {
      return;
    }

    if (!stream.withHost) {
      const user = await userApi.getUserById(stream.id);
      if (!user) return;
      setUserDrawerOpen(user);
      return;
    }

    try {
      const data = await streamApi.joinStream(stream.id);

      await navigate({
        pathname: `/stream/${stream.id}`,
        query: {
          state: JSON.stringify({

            ...stream,
            token: data.token,
            wsUrl: data.url,
            isAdmin: false

          })
        }
      });
    } catch (error) {
      console.log(error);
      await loadData();
    }
  };

  const userDrawer = userDrawerOpen
    ? createPortal(
      <UserDrawer
        user={userDrawerOpen}
        onClose={() => setUserDrawerOpen(null)}
        streamView={userDrawerOpen.id !== user.id}
      />,
      document.body
    )
    : null;


  const onUserClick = async () => {
    const u = await userApi.getUserById(user.id);
    if (!u) return;
    setUserDrawerOpen(u);
  };

  const renderText = useCallback((pullStatus: string, percent: number) => {
    pullingRef.current = !!percent;
    switch (pullStatus) {
      case "pulling":
        return t("common.pullToRefresh");

      case "canRelease":
        return t("common.release");

      case "refreshing":
        return t("common.loading");

      case "complete":
        return "";

      default:
        return "";
    }
  }, []);

  return (
    <PageWrapper>
      <div className={styles.container}>
        <NavBar onUserClick={onUserClick} />

        <PullToRefreshify
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          headHeight={30}
        >
          <div className={styles.grid}>
            {streamList.map((stream) => (
              <StreamListTile
                stream={stream}
                key={stream.id}
                onClick={() => {
                  if (stream.url) {
                    window.open(stream.url, "_blank", "noopener");
                    return;
                  }

                  void findJoinStream(stream.id);
                }}
              />
            ))}


          </div>
        </PullToRefreshify>

        <AppBar />
      </div>


      {userDrawer}
    </PageWrapper>
  );
};

export default HomePage;
