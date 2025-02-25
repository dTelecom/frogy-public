import styles from "./UserDrawer.module.scss";
import CloseIcon from "/src/assets/icons/close.svg";
import { useTranslation } from "react-i18next";
import DoubleHeartIcon from "/src/assets/icons/doubleHeartIcon.svg";
import PeopleIcon from "/src/assets/icons/peopleIcon.svg";
import StarsIcon from "/src/assets/icons/starsIcon.svg";
import { PropsWithChildren, useEffect, useState } from "react";
import ImageWithFallback from "../ImageWithFallback";
import { UserResponse } from "@/api/user";
import { Button } from "../Button/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFollowing } from "@/api/follow";
import PlusIcon from "/src/assets/icons/plusIcon.svg";
import TickIcon from "/src/assets/icons/tick.svg";
import { createPortal } from "react-dom";
import { UnfollowConfirmationModal } from "@/components/UnfollowConfirmationModal/UnfollowConfirmationModal";
import { formatBigNumber } from "@/lib/points";
import { userApi } from "@/api";
import { Sheet } from "react-modal-sheet";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";
import { RechargeDrawer, SmallBtnWithArrow } from "@/components/GiftsButton/GiftsButton";
import { getFollowersForCurrentUser } from "@/store/features/followingSlice";
import { EditButton } from "./components/EditButton";
import GleamIcon from "/src/assets/icons/gleamIcon.svg";

type UserDrawerProps = PropsWithChildren & {
  onClose: () => void;
  user: UserResponse;
  streamView?: boolean;
  roomId?: number;
  forceUserToDisplayNotCurrentUser?: boolean;
};

export const UserDrawer = ({
  onClose,
  user: initialUser,
  streamView,
  roomId,
  forceUserToDisplayNotCurrentUser
}: UserDrawerProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user);
  const [reachargeOpen, setRechargeOpen] = useState(false);
  const [user, setUser] = useState<UserResponse>(initialUser);

  const isCurrentUser = currentUser.id === user.id;

  const [openUnfollowConfirmation, setOpenUnfollowConfirmation] =
    useState(false);

  const following = useAppSelector(
    (state) => !!state.followers.followers[user.id]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const updateUser = async () => {
    const newUser = await userApi.getUserById(user.id);
    if (!newUser) return;
    setUser(newUser);
  };

  const onFollowClick = async (follow: boolean) => {
    await setFollowing(user.id, follow);
    dispatch(getFollowersForCurrentUser());
    void updateUser();
  };

  const unfollowConfirmationModal = openUnfollowConfirmation
    ? createPortal(
      <UnfollowConfirmationModal
        user={user}
        onClose={() => setOpenUnfollowConfirmation(false)}
        onUnfollow={async () => {
          await onFollowClick(false);
          setOpenUnfollowConfirmation(false);
        }}
      />,
      document.body
    )
    : null;

  if (!user) return null;

  if (reachargeOpen)
    return <RechargeDrawer onClose={() => setRechargeOpen(false)} />;

  const userToDisplay =
    !forceUserToDisplayNotCurrentUser && isCurrentUser ? currentUser : user;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={styles.wrapper}
    >
      <Sheet
        style={{
          zIndex: 101
        }}
        detent={"content-height"}
        isOpen={true}
        onClose={onClose}
      >
        <Sheet.Container>
          <Sheet.Content>
            <div className={styles.container}>
              <button
                className={styles.close}
                onClick={onClose}
              >
                <CloseIcon />
              </button>

              {!streamView && (
                <div className={styles.titleContainer}>
                  <h2 className={styles.title}>{t("common.profile")}</h2>
                  {isCurrentUser && (
                    <EditButton
                      onClose={() => {
                        void updateUser();
                      }}
                    />
                  )}
                </div>
              )}

              <div className={styles.profileContent}>
                <div className={styles.avatarPlaceholder}>
                  <ImageWithFallback
                    fallback={avatarPlaceholder.src}
                    src={user.photo_url}
                    alt="avatar"
                    className={styles.avatar}
                  />
                </div>

                <div className={styles.profileInfo}>
                  <div className={styles.pageInfoNameContainer}>
                    <h3>{user.name}</h3>
                  </div>

                  <div className={styles.infoBadges}>
                    {isCurrentUser && (
                      <div className={styles.pageInfoButtonsContainer}>
                        <SmallBtnWithArrow
                          onRechargeOpen={() => setRechargeOpen(true)}
                          style={{
                            borderRadius: "20px",
                            height: "24px",
                            padding: "0 8px"
                          }}
                          text={t("common.stars")}
                          value={currentUser.starsBalance + ""}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.userStats}>
                {!streamView && <h2>{t("common.statistics")}</h2>}
                <div className={styles.statGrid}>
                  <div>
                    <DoubleHeartIcon />
                    <div>
                      <h3>{userToDisplay.fans}</h3>
                      <p>{t("common.fans")}</p>
                    </div>
                  </div>
                  <div>
                    <PeopleIcon />
                    <div>
                      <h3>{userToDisplay.following}</h3>
                      <p>{t("common.following")}</p>
                    </div>
                  </div>

                  <div>
                    <StarsIcon />

                    <div>
                      <h3>{formatBigNumber(userToDisplay.starsBalance, 0)}</h3>
                      <p>{t("common.stars")}</p>
                    </div>
                  </div>

                  <div>
                    <GleamIcon />

                    <div>
                      <h3>{formatBigNumber(userToDisplay.gleamsBalance, 0)}</h3>
                      <p>{t("common.gleams")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!isCurrentUser && streamView && (
                <div className={styles.buttonsContainer}>
                  {following ? (
                    <Button
                      color={"gray"}
                      fullWidth
                      onClick={() => setOpenUnfollowConfirmation(true)}
                      style={{ gap: "8px" }}
                    >
                      <TickIcon />
                      {t("common.followed")}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => onFollowClick(true)}
                      style={{ gap: "8px" }}
                    >
                      <PlusIcon />
                      {t("common.follow")}
                    </Button>
                  )}
                  {currentUser.id === roomId ? (
                    <Button
                      color={"gray"}
                      fullWidth
                      disabled
                      onClick={() => {
                      }}
                      style={{ gap: "8px" }}
                    >
                      {t("common.ban")}
                    </Button>
                  ) : (
                    <Button
                      color={"gray"}
                      fullWidth
                      disabled
                      onClick={() => {
                      }}
                      style={{ gap: "8px" }}
                    >
                      {t("common.report")}
                    </Button>
                  )}
                </div>
              )}

              {unfollowConfirmationModal}
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </div>
  );
};
