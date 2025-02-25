import { Trans, useTranslation } from "react-i18next";
import { ModalWrapper } from "../../ModalWrapper/ModalWrapper";
import styles from "./GleamsExplanationModal.module.scss";

type GleamsExplanationModalProps = {
  // eslint-disable-next-line no-unused-vars
  setModalOpen: (isOpen: boolean) => void;
};

export const GleamsExplanationModal = ({
  setModalOpen,
}: GleamsExplanationModalProps) => {
  return (
    <ModalWrapper onClose={() => setModalOpen(false)}>
      <h1>{useTranslation().t("gleamsExplanationModal.title")}</h1>
      <p
        style={{
          marginTop: "16px",
        }}
      >
        <Trans
          i18nKey="gleamsExplanationModal.text"
          components={[
            <a
              key={0}
              className={styles.link}
              target={"_blank"}
              href={"https://docs.frogy.live/get-started/what-are-gleams"}
              rel="noreferrer"
            />,
          ]}
        />
      </p>
    </ModalWrapper>
  );
};
