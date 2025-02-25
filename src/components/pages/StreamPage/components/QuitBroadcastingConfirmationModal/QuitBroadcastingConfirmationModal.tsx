import styles from "./QuitBroadcastingConfirmationModal.module.scss";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { LiveBadge } from "../../../HomePage/components/StreamListTile/components/LiveBadge/LiveBadge";
import { ModalWrapper } from "@/components/ModalWrapper/ModalWrapper";
import { Button } from "@/components/Button/Button";

export const QuitBroadcastingConfirmationModal = ({
  onClose,
  onQuit,
}: {
  onClose: () => void;
  onQuit: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <ModalWrapper fullWidth={false} onClose={onClose}>
      <div className={styles.container}>
        <p>{t("quitBroadcastingModal.title")}</p>
        <div className={styles.buttons}>
          <Button onClick={onClose} style={{ gap: "8px" }}>
            {t("quitBroadcastingModal.continue")}
            <LiveBadge online />
          </Button>
          <Button onClick={onQuit} color={"gray"}>
            {t("quitBroadcastingModal.quit")}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
