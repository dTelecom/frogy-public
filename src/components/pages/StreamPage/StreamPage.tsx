import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  TrackLoop,
  useMaybeRoomContext,
  useTracks,
  useTrackToggle
} from "@dtelecom/components-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { RoomEvent, RoomOptions, Track, VideoPresets } from "@dtelecom/livekit-client";
import { PresenterVideo } from "@/components/PresenterVideo/PresenterVideo";
import { StreamStartAnimation } from "@/components/StreamStartAnimation/StreamStartAnimation";
import styles from "./StreamPage.module.scss";
import CloseIcon from "@/assets/icons/closeAdaptive.svg";
import { StreamProfileBadge } from "@/components/StreamProfileBadge/StreamProfileBadge";
import { UserResponse } from "@/api/user";
import { streamApi, userApi } from "@/api";
import { createPortal } from "react-dom";
import {
  QuitBroadcastingConfirmationModal
} from "./components/QuitBroadcastingConfirmationModal/QuitBroadcastingConfirmationModal";
import { EmojiButtons, EmojiFountain } from "./components/Emoji";
import { VideoDeviceChangeButton } from "./components/VideoDeviceChangeButton";
import { StreamListItem } from "@/api/stream";
import ChatIcon from "@/assets/icons/chatIcon.svg";
import { Chat } from "./components/Chat/Chat";
import { GiftsButton } from "./components/GiftsButton/GiftsButton";
import "@dtelecom/components-styles";
import { GleamsExplanationModal } from "@/components/modals/GleamsExplanationModal/GleamsExplanationModal";
import { eventEmitter } from "@/lib/events";
import { useTranslation } from "react-i18next";
import { MicDeviceChangeButton } from "./components/MicDeviceChangeButton";
import { useRouter } from "next/router";
import {
  IChatMessage,
  setupDataMessageHandler
} from "@/components/pages/StreamPage/components/Chat/setupDataMessageHandler";
import { Observable } from "rxjs";

export const StreamPage = () => {
  const navigate = useRouter().push;
  const router = useRouter();
  const { query } = router;
  const { roomId, state } = query;
  const { wsUrl, token, isAdmin, img } = JSON.parse(state as string);

  if (!wsUrl) {
    void navigate("/");
  }

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        resolution: VideoPresets.h720
      },
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h360, VideoPresets.h180],
        stopMicTrackOnMute: true
      },
      // disabling echoCancellation reduce audio volume
      audioCaptureDefaults: {
        // echoCancellation: false,
        noiseSuppression: false
      },
      adaptiveStream: {
        pauseWhenNotVisible: true,
        pauseVideoInBackground: true
      },
      dynacast: false,
      disconnectOnPageLeave: true
    };
  }, []);

  const [streamer, setStreamer] = useState<UserResponse>();

  useEffect(() => {
    if (roomId && !streamer) {
      void userApi.getUserById(parseInt(roomId as string)).then((res) => {
        setStreamer(res);
      });
    }
  }, [roomId, streamer]);

  const onDisconnected = () => {
    void navigate("/");
  };

  const onRoomError = (err: Error) => {
    console.log("room error", err);
  };

  return (
    <div className={styles.container}>
      <LiveKitRoom
        token={token as string}
        serverUrl={wsUrl as string}
        options={roomOptions}
        video={!!isAdmin}
        audio={!!isAdmin}
        onDisconnected={() => onDisconnected()}
        onError={onRoomError}
      >
        <RoomWrapper
          isAdmin={!!isAdmin}
          streamer={streamer}
          imgSrc={img}
        />
      </LiveKitRoom>
    </div>
  );
};

interface RoomWrapperProps {
  isAdmin: boolean;
  streamer?: UserResponse;
  imgSrc: StreamListItem["img"];
}

const RoomWrapper = ({
  isAdmin,
  streamer,
  imgSrc
}: RoomWrapperProps) => {
  const { t } = useTranslation();
  const room = useMaybeRoomContext();

  const [openQuitBroadcastingModal, setOpenQuitBroadcastingModal] =
    useState(false);
  const [streamerMuted, setStreamerMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [gleamsInstructionModalOpen, setGleamsInstructionModalOpen] =
    useState(false);
  const [setup, setSetup] = useState<{
    messageObservable?: Observable<IChatMessage[]>;
    addMessage?: (msg: IChatMessage) => void;
  }>({});

  useEffect(() => {
    if (room) {
      setSetup(setupDataMessageHandler(room));
    }
  }, [room]);

  const { toggle: toggleVideo } = useTrackToggle({
    source: Track.Source.Camera
  });

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      streamApi.roomDelete().finally(() => {
        room?.disconnect(true);
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const onChanged = () => {
      if (!isAdmin) return;

      toggleVideo();
      setTimeout(() => {
        toggleVideo();
      }, 0);
    };

    room?.on(RoomEvent.MediaDevicesChanged, onChanged);
    return () => {
      room?.off(RoomEvent.MediaDevicesChanged, onChanged);
    };
  }, [room, isAdmin]);

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged] }
  );

  const filteredTrack = useMemo(() => {
    return tracks.filter((track) => track.participant.tracks.size > 0);
  }, [tracks]);

  const viewerCount = useMemo(() => {
    return tracks.length ? tracks.length - 1 : 0;
  }, [tracks]);

  const onGiftMessageClick = () => {
    if (isAdmin) {
      setGleamsInstructionModalOpen(true);
    } else {
      eventEmitter.emit("stream.showGifts");
    }
  };

  const quitBroadcastingModal = openQuitBroadcastingModal
    ? createPortal(
      <QuitBroadcastingConfirmationModal
        onClose={() => setOpenQuitBroadcastingModal(false)}
        onQuit={() => {
          streamApi.roomDelete().finally(() => {
            room?.disconnect(true);
          });
        }}
      />,
      document.body
    )
    : null;

  return (
    <>
      <button
        className={styles.close}
        onClick={
          isAdmin
            ? () => setOpenQuitBroadcastingModal(true)
            : () => {
              room?.disconnect(true);
            }
        }
      >
        <CloseIcon />
      </button>

      <TrackLoop tracks={filteredTrack}>
        <PresenterVideo
          roomId={streamer?.id}
          onMutedChanged={setStreamerMuted}
          imgSrc={imgSrc}
        />
      </TrackLoop>

      <RoomAudioRenderer />

      <div
        id={"viewerCountWrapper"}
        className={styles.viewerCountWrapper}
      >
        <div className={styles.viewerCount}>{viewerCount}</div>
      </div>

      <EmojiFountain />

      <div
        style={{
          display: chatOpen ? "none" : undefined
        }}
        className={styles.buttonsContainer}
      >
        {isAdmin && (
          <>
            <StreamStartAnimation />
            <MicDeviceChangeButton isMuted={streamerMuted} />
            <VideoDeviceChangeButton />
          </>
        )}

        <button
          className={styles.chatButton}
          onClick={() => setChatOpen(true)}
        >
          <ChatIcon />
        </button>

        {!isAdmin && (
          <>
            <EmojiButtons />

            {streamer && <GiftsButton
              setup={setup}
              streamerId={streamer.id}
            />}
          </>
        )}
      </div>

      {streamer && (
        <>
          <StreamProfileBadge
            microphoneEnabled={!streamerMuted}
            canFollow={!isAdmin}
            initialStreamer={streamer}
          />

          <Chat
            roomId={streamer.id}
            chatOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            isStreamer={isAdmin}
            onGiftMessageClick={onGiftMessageClick}
            setup={setup}
          />
        </>
      )}

      {quitBroadcastingModal}

      {gleamsInstructionModalOpen &&
        createPortal(
          <GleamsExplanationModal
            setModalOpen={setGleamsInstructionModalOpen}
          />,
          document.body
        )}

      <div className={styles.startAudioContainer}>
        <StartAudio label={t("stream.startAudio")} />
      </div>
    </>
  );
};
