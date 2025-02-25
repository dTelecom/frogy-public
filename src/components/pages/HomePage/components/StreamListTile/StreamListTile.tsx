import { PropsWithChildren } from "react";
import styles from "./StreamListTile.module.scss";
import { StreamListItem } from "@/api/stream";
import { ViewerBadge } from "./components/ViewerBadge/ViewerBadge";
import { LiveBadge } from "./components/LiveBadge/LiveBadge";
import ImageWithFallback from "@/components/ImageWithFallback";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";

type StreamListTileProps = {
  stream: StreamListItem;
  onClick: () => void;
} & PropsWithChildren;

export const StreamListTile = ({ stream, onClick }: StreamListTileProps) => {
  return (
    <div
      className={styles.container}
      onClick={onClick}
    >
      <div className={styles.imageContainer}>
        <ImageWithFallback
          fallback={avatarPlaceholder.src}
          src={stream.img}
          alt="avatar"
          className={styles.image}
          loading="lazy"
        />

        <div className={styles.badgesContainer}>
          <LiveBadge online={stream.withHost} />
          {stream.withHost ? <ViewerBadge viewers={stream.online} /> : null}
        </div>
      </div>

      <h3>{stream.title}</h3>
    </div>
  );
};
