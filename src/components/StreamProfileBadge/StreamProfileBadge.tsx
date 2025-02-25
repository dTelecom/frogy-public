import { UserResponse } from "@/api/user";
import ImageWithFallback from "../ImageWithFallback";
import styles from "./StreamProfileBadge.module.scss";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import MicOffIcon from "@/assets/icons/micIcon.svg";
import PlusIcon from "@/assets/icons/plusIcon.svg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPortal } from "react-dom";
import { UserDrawer } from "../UserDrawer/UserDrawer";
import { getFollowersForCurrentUser } from "@/store/features/followingSlice";
import { userApi } from "../../api";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";

export const StreamProfileBadge = ({
  initialStreamer,
  canFollow,
  microphoneEnabled,
}: {
  initialStreamer: UserResponse;
  canFollow: boolean;
  microphoneEnabled: boolean;
}) => {
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [streamer, setStreamer] = useState<UserResponse>(initialStreamer);
  const dispatch = useAppDispatch();

  const updateStreamer = async () => {
    const updatedStreamer = await userApi.getUserById(streamer.id);
    if (!updatedStreamer) return;
    setStreamer(updatedStreamer);
  };

  useEffect(() => {
    dispatch(getFollowersForCurrentUser());
  }, []);

  const following = useAppSelector(
    (state) => !!state.followers.followers[streamer.id]
  );


  const onFollowClick = async () => {
    await updateStreamer();
    setUserDrawerOpen(true);
  };

  const userDrawer = userDrawerOpen
    ? createPortal(
      <UserDrawer
        roomId={streamer.id}
        streamView
        user={streamer}
        onClose={() => setUserDrawerOpen(false)}
        forceUserToDisplayNotCurrentUser
      />,
      document.body
    )
    : null;

  return (
    <div className={styles.wrapper}>
      <div
        onClick={onFollowClick}
        className={styles.badge}
      >
        <div className={styles.badgeImage}>
          <ImageWithFallback
            fallback={avatarPlaceholder.src}
            src={streamer.photo_url}
            alt="avatar"
            className={styles.image}
          />

          {!microphoneEnabled && (
            <div className={styles.microphoneDisabledIcon}>
              <MicOffIcon />
            </div>
          )}
        </div>

        <div className={styles.badgeInfo}>
          <div className={styles.badgeName}>{streamer.name}</div>
        </div>

        {canFollow && !following && (
          <Button
            onClick={onFollowClick}
            style={{
              padding: "8px"
            }}
          >
            <PlusIcon />
          </Button>
        )}
      </div>

      {userDrawer}
    </div>
  );
};
