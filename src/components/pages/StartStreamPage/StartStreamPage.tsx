import { PageWrapper } from "@/components/PageWrapper/PageWrapper";
import { streamApi } from "@/api";
import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./StartStreamPage.module.scss";
import CloseIcon from "@/assets/icons/close.svg";
import { Button } from "@/components/Button/Button";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { facingModeFromLocalTrack, LocalVideoTrack, Track } from "@dtelecom/livekit-client";
import { usePreviewTracks } from "@dtelecom/components-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { StreamListItem } from "@/api/stream";
import { toast } from "react-toastify";
import { Toast } from "@/components/Toast/Toast";

import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg";
import WebApp from "@twa-dev/sdk";
import { useRouter } from "next/router";

/* eslint-disable */
/* eslint-disable */
if (typeof window !== "undefined") {
  window.Buffer = window?.Buffer || require("buffer").Buffer;
}


const StartStreamPage = () => {
  const router = useRouter();
  const { query } = router;
  const stream = query.stream ? JSON.parse(query.stream as string) as StreamListItem : null;

  const [streamName, setStreamName] = useState<string>(stream?.title || "");
  const [room, setRoom] = useState<StreamListItem | null>(stream || null);
  const navigate = useRouter().push;
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [image, setImage] = useState(user.photo_url);
  const [loading, setLoading] = useState(false);


  const loadRoom = async () => {
    const room = await streamApi.getMyRoom();
    setRoom(room);
    setStreamName(room.title);
  };

  useEffect(() => {
    if (!stream) {
      void loadRoom();
    }
  }, []);

  const startStream = async () => {
    if (!streamName) {
      toast(<Toast
        type={"warning"}
        message={t("toast.streamName")}
      />);
      return;
    }

    if (!videoTrack) {
      toast(<Toast
        type={"warning"}
        message={t("toast.streamCamera")}
      />);
      return;
    }

    setLoading(true);
    try {
      const params = await streamApi.createStream(streamName);

      await navigate({
        pathname: `/stream/${user.id}`,
        query: {
          state: JSON.stringify({
            ...room,
            token: params.token,
            wsUrl: params.url,
            roomName: streamName,
            isAdmin: true
          })
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onError = (err: Error) => {
    if (
      "The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission." ===
      err.message
    ) {
      WebApp.showAlert(t("startStreamPage.permissionsError"));
    } else {
      console.error(err);
    }
  };

  const tracks = usePreviewTracks(
    {
      audio: true,
      video: true
    },
    onError
  );

  const videoEl = React.useRef(null);

  const videoTrack = React.useMemo(
    () =>
      tracks?.filter(
        (track) => track.kind === Track.Kind.Video
      )[0] as LocalVideoTrack,
    [tracks]
  );

  React.useEffect(() => {
    if (videoEl.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoEl.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [videoTrack]);

  const facingMode = React.useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    } else {
      return "undefined";
    }
  }, [videoTrack]);

  return (
    <PageWrapper>
      <div className={styles.container}>
        <button
          className={styles.close}
          onClick={() => navigate("/")}
        >
          <CloseIcon />
        </button>

        <div className={styles.streamSettings}>
          <div
            className={styles.imageContainer}
          >
            <ImageWithFallback
              fallback={avatarPlaceholder.src}
              src={image}
              alt="avatar"
              className={styles.image}
              ignoreError
            />
          </div>

          <input
            onChange={(e) => {
              setStreamName(e.target.value.slice(0, 25));
            }}
            value={streamName}
            type={"text"}
            placeholder={t(
              "startStreamPage.inputPlaceholder",
              "Add a stream title"
            )}
          />
        </div>

        {videoTrack && <video
          ref={videoEl}
          data-lk-facing-mode={facingMode}
        />}

        <div className={styles.buttonContainer}>
          <Button
            style={!streamName ? { opacity: 0.5 } : {}}
            onClick={startStream}
            disabled={loading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginRight: "8px"
              }}
            >
              <path
                d="M4 19.6998H14.5C15.2956 19.6998 16.0587 19.3837 16.6213 18.8211C17.1839 18.2585 17.5 17.4954 17.5 16.6998V14.1998L21.4856 16.5911C21.6373 16.6822 21.8105 16.7313 21.9875 16.7335C22.1644 16.7358 22.3388 16.691 22.4927 16.6038C22.6467 16.5166 22.7748 16.3901 22.8639 16.2373C22.9531 16.0844 23 15.9106 23 15.7336V8.26587C23 8.08891 22.953 7.91513 22.8639 7.76226C22.7748 7.60939 22.6467 7.48291 22.4927 7.39573C22.3387 7.30855 22.1644 7.26379 21.9874 7.26602C21.8105 7.26826 21.6373 7.3174 21.4856 7.40844L17.5 9.7998V7.2998C17.5 6.50416 17.1839 5.74109 16.6213 5.17848C16.0587 4.61588 15.2956 4.2998 14.5 4.2998H4C3.20435 4.2998 2.44129 4.61588 1.87868 5.17848C1.31607 5.74109 1 6.50416 1 7.2998V16.6998C1 17.4954 1.31607 18.2585 1.87868 18.8211C2.44129 19.3837 3.20435 19.6998 4 19.6998ZM7 9.13525C6.99998 9.03943 7.02525 8.9453 7.07324 8.86237C7.12123 8.77943 7.19026 8.71063 7.27335 8.6629C7.35644 8.61518 7.45065 8.59021 7.54647 8.59054C7.64229 8.59086 7.73633 8.61646 7.81909 8.66475L12.7297 11.5293C12.812 11.5772 12.8802 11.6459 12.9276 11.7284C12.975 11.811 13 11.9045 13 11.9997C13 12.0949 12.975 12.1884 12.9276 12.271C12.8802 12.3535 12.812 12.4222 12.7297 12.4702L7.81909 15.3348C7.73633 15.383 7.64229 15.4087 7.54647 15.409C7.45065 15.4093 7.35643 15.3843 7.27334 15.3366C7.19025 15.2889 7.12123 15.2201 7.07324 15.1371C7.02524 15.0542 6.99998 14.9601 7 14.8643V9.13525Z"
                fill="white"
              />
            </svg>
            {t("startStreamPage.goLive")}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default StartStreamPage;
