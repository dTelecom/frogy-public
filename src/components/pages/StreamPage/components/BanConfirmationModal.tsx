import { ModalWrapper } from "@/components/ModalWrapper/ModalWrapper";
import styles from "./BanConfirmationModal.module.scss";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button/Button";

export const BanConfirmationModal = ({
  onClose,
  onBan,
}: {
  onClose: () => void;
  onBan: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <ModalWrapper fullWidth={false} onClose={onClose}>
      <div className={styles.container}>
        <p>{t("common.confirm")}</p>
        <div className={styles.buttons}>
          <Button onClick={onBan}>{t("common.ban")}</Button>
          <Button onClick={onClose} color={"gray"}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};
