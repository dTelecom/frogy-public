import { Track } from "@dtelecom/livekit-client";
import {
  AudioTrack,
  ParticipantContextIfNeeded,
  ParticipantTileProps,
  useEnsureParticipant,
  useMaybeTrackContext,
  useParticipantTile,
  useTrackMutedIndicator,
  VideoTrack,
} from "@dtelecom/components-react";
import { TrackReferenceOrPlaceholder } from "@dtelecom/components-core";
import { useEffect, useRef, useState } from "react";
import styles from "./PresenterVideo.module.scss";
import ImageWithFallback from "../ImageWithFallback";
import { StreamListItem } from "@/api/stream";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";

interface PresenterVideoProps extends ParticipantTileProps {
  onMutedChanged: (isMuted: boolean) => void;
  roomId?: number;
  imgSrc: StreamListItem["img"];
}

export const PresenterVideo = ({
  participant,
  source = Track.Source.Camera,
  publication,
  onMutedChanged,
  roomId,
  imgSrc,
}: PresenterVideoProps) => {
  const p = useEnsureParticipant(participant);
  const { isMuted } = useTrackMutedIndicator(Track.Source.Microphone, {
    participant,
  });
  const trackRef: TrackReferenceOrPlaceholder = useMaybeTrackContext() ?? {
    participant: p,
    source,
    publication,
  };
  const [bitrate, setBitrate] = useState<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { isMuted: isVideoMuted } = useTrackMutedIndicator(
    Track.Source.Camera,
    {
      participant,
    }
  );

  useEffect(() => {
    onMutedChanged(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const interval = setInterval(() => {
      let total = 0;

      [...p.videoTracks.values()].forEach((pub) => {
        if (pub.track?.currentBitrate) {
          total += pub.track.currentBitrate;
        }
      });
      setBitrate(total);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    participant: trackRef.participant,

    source: trackRef.source,
    publication: trackRef.publication,
    htmlProps: {},
  });

  return (
    <div className={styles.container} {...elementProps}>
      <ParticipantContextIfNeeded participant={trackRef.participant}>
        {trackRef.publication?.kind === "video" ||
        trackRef.source === Track.Source.Camera ||
        trackRef.source === Track.Source.ScreenShare ? (
          <VideoTrack
            participant={trackRef.participant}
            source={trackRef.source}
            publication={trackRef.publication}
          />
        ) : (
          <AudioTrack
            participant={trackRef.participant}
            source={trackRef.source}
            publication={trackRef.publication}
          />
        )}

        {isVideoMuted && roomId && (
          <div className={styles.mutedOverlay}>
            <ImageWithFallback
              fallback={avatarPlaceholder.src}
              src={imgSrc}
              alt="avatar"
              className={styles.mutedOverlayImage}
            />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "0.25rem",
            right: "calc(26px + 0.25rem + 0.5rem)",
            height: "26px",
            display: "flex",
            gap: "0.5rem",
            zIndex: "10",
          }}
        >
          {process.env.NODE_ENV === "development" && bitrate !== undefined && (
            <div>{Math.round(bitrate / 1024)} kbps</div>
          )}
        </div>
      </ParticipantContextIfNeeded>
    </div>
  );
};
