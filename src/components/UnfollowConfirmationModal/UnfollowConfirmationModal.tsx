import { UserResponse } from "@/api/user";
import { ModalWrapper } from "@/components/ModalWrapper/ModalWrapper";
import styles from "./UnfollowConfirmationModal.module.scss";
import * as React from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button/Button";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";

export const UnfollowConfirmationModal = ({
  user,
  onClose,
  onUnfollow
}: {
  user?: UserResponse;
  onClose: () => void;
  onUnfollow: () => void;
}) => {
  const dataToDisplay = user
    ? {
      id: user.id,
      name: user.name,
      photo_url: user.photo_url
    }
    : null;

  if (!dataToDisplay) return null;

  const { t } = useTranslation();
  return (
    <ModalWrapper
      fullWidth={false}
      onClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.avatarPlaceholder}>
          <ImageWithFallback
            fallback={avatarPlaceholder.src}
            src={dataToDisplay.photo_url}
            alt="avatar"
            className={styles.avatar}
          />
        </div>

        <p>
          {t("unfollowModal.title")}&nbsp;
          <span className={styles.greenText}>
            {t("unfollowModal.titleGreen", {
              name: dataToDisplay.name
            })}
          </span>
        </p>
        <div className={styles.buttons}>
          <Button
            onClick={onUnfollow}
            style={{ gap: "8px" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.37971 3.52585L6.66658 6.66658L10.4166 10.4166L9.58325 12.4999L12.4999 9.99992L9.16658 6.66658L10.2927 5.26093C10.353 5.21384 10.4036 5.14998 10.4374 5.06936C11.5539 2.41104 15.1096 1.91866 16.9065 4.17355L17.23 4.57956C18.7765 6.52031 18.5124 9.33642 16.6319 10.9557L10.4733 16.2589L10.4733 16.259C10.3344 16.3786 10.2649 16.4384 10.1901 16.4692C10.0683 16.5193 9.93155 16.5193 9.80971 16.4692C9.73492 16.4384 9.66544 16.3786 9.52649 16.259L9.52646 16.2589L3.36789 10.9557C1.48742 9.33643 1.22326 6.52031 2.7698 4.57956L3.09334 4.17355C4.45447 2.46546 6.82484 2.33379 8.37971 3.52585Z"
                fill="white"
              />
            </svg>
            {t("unfollowModal.unfollow")}
          </Button>
          <Button
            onClick={onClose}
            color={"gray"}
          >
            {t("unfollowModal.keepFollow")}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
