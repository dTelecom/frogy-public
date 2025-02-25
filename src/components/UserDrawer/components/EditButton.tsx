import * as React from "react";
import { useState } from "react";
import { ModalWrapper } from "../../ModalWrapper/ModalWrapper";
import { createPortal } from "react-dom";
import PencilIcon from "/src/assets/icons/pencilIcon.svg";
import { useTranslation } from "react-i18next";
import styles from "./EditButton.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { Toast } from "../../Toast/Toast";
import { Button } from "../../Button/Button";
import { changeUserName } from "@/api/user";
import { update } from "@/store/features/userSlice";


interface EditButtonProps {
  onClose: () => void;
}

export const EditButton = ({ onClose }: EditButtonProps) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={styles.editButton}
      >
        <PencilIcon />
        {t("common.edit")}
      </button>
      {modalOpen &&
        createPortal(
          <EditProfileModal
            onClose={() => {
              setModalOpen(false);

              onClose();
            }}
          />,
          document.body
        )}
    </>
  );
};

interface EditProfileModalProps {
  onClose: () => void;
}

const EditProfileModal = ({ onClose }: EditProfileModalProps) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState(user.name);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [inputFocused, setInputFocused] = useState(false);


  const onSave = async () => {
    setLoading(true);
    try {
      if (name !== user.name) {
        await changeUserName(name);

        dispatch(update({ name }));
      }

      toast(<Toast
        type={"success"}
        message={t("toast.success")}
      />);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      wrapperClassName={inputFocused ? styles.modalWrapper : ""}
      fullWidth={false}
      onClose={onClose}
    >
      <>
        <div className={styles.modalContainer}>
          <h2 className={styles.title}>{t("editProfileModal.title")}</h2>

          <label>
            {t("editProfileModal.name")}
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setHasChanges(true);
                const val = e.target.value;
                if (val.length <= 20) {
                  setName(e.target.value);
                }
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={t("editProfileModal.nameInputPlaceholder")}
            />
          </label>

          <div className={styles.buttonsContainer}>
            <Button
              onClick={onClose}
              color={"gray"}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={loading || !hasChanges || !name}
              onClick={onSave}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>

      </>
    </ModalWrapper>
  );
};
