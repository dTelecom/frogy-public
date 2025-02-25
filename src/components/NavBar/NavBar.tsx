import styles from "./NavBar.module.scss";
import { useTranslation } from "react-i18next";
import { ModalWrapper } from "../ModalWrapper/ModalWrapper";
import { Button } from "../Button/Button";
import { createPortal } from "react-dom";
import { userApi } from "../../api";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ImageWithFallback from "../ImageWithFallback";
import avatarPlaceholder from "@/assets/icons/avatarPlaceholder.svg?plain";
import { getUser } from "@/store/features/userSlice";

export const NavBar = ({ onUserClick }: { onUserClick: () => void }) => {
  const user = useAppSelector((state) => state.user);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    setIsLanguageModalOpen(true);
  };

  const languageModal = isLanguageModalOpen
    ? createPortal(
      <LanguageModal setIsLanguageModalOpen={setIsLanguageModalOpen} />,
      document.body
    )
    : null;

  return (
    <div className={styles.container}>
      <div
        onClick={onUserClick}
        className={styles.avatarContainer}
      >
        <ImageWithFallback
          src={
            `${user.photo_url}?` +
            user.avatarUpdatedAt
          }
          fallback={avatarPlaceholder.src}
          alt="avatar"
          className={styles.avatar}
        />
      </div>

      <h1>{user.name}</h1>
      <div className={styles.rightGroup}>
        <button
          className={styles.borderButton}
          onClick={changeLanguage}
        >
          {i18n.language}
        </button>
      </div>

      {languageModal}
    </div>
  );
};

type LanguageModalProps = {
  // eslint-disable-next-line no-unused-vars
  setIsLanguageModalOpen: (isOpen: boolean) => void;
};

const LanguageModal = ({ setIsLanguageModalOpen }: LanguageModalProps) => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const dispatch = useAppDispatch();
  const onClose = () => {
    setIsLanguageModalOpen(false);
  };
  const langOnSave = async () => {
    await userApi.saveUserLanguage(lang);
    await i18n.changeLanguage(lang);
    dispatch(getUser());
    onClose();
  };
  return (
    <ModalWrapper onClose={onClose}>
      <h1>{t("languageModal.title")}</h1>
      <p
        style={{
          marginTop: "8px"
        }}
      >
        {t("languageModal.text")}
      </p>
      <div className={styles.languageButtons}>
        <button
          className={styles.languageButton}
          onClick={() => {
            setLang("en");
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_225_7986)">
              <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="#F0F0F0"
              />
              <path
                d="M7.65222 8H16C16 7.27794 15.9038 6.57844 15.7244 5.91303H7.65222V8Z"
                fill="#D80027"
              />
              <path
                d="M7.65222 3.8261H14.8258C14.3361 3.02697 13.71 2.32063 12.9799 1.73913H7.65222V3.8261Z"
                fill="#D80027"
              />
              <path
                d="M8.00002 16C9.8828 16 11.6133 15.3493 12.9799 14.2609H3.02014C4.3867 15.3493 6.11724 16 8.00002 16Z"
                fill="#D80027"
              />
              <path
                d="M1.17423 12.1739H14.8259C15.219 11.5324 15.5239 10.8311 15.7244 10.0869H0.275635C0.476166 10.8311 0.781072 11.5324 1.17423 12.1739Z"
                fill="#D80027"
              />
              <path
                d="M3.70575 1.24931H4.43478L3.75666 1.74197L4.01569 2.53912L3.33759 2.04647L2.6595 2.53912L2.88325 1.85047C2.28619 2.34781 1.76287 2.9305 1.33162 3.57975H1.56522L1.13356 3.89334C1.06631 4.00553 1.00181 4.1195 0.94 4.23516L1.14612 4.86956L0.761563 4.59016C0.665969 4.79269 0.578531 4.99978 0.499938 5.21119L0.727031 5.91019H1.56522L0.887094 6.40284L1.14612 7.2L0.468031 6.70734L0.0618437 7.00247C0.0211875 7.32928 0 7.66216 0 8H8C8 3.58175 8 3.06087 8 0C6.41963 0 4.94641 0.458438 3.70575 1.24931ZM4.01569 7.2L3.33759 6.70734L2.6595 7.2L2.91853 6.40284L2.24041 5.91019H3.07859L3.33759 5.11303L3.59659 5.91019H4.43478L3.75666 6.40284L4.01569 7.2ZM3.75666 4.07241L4.01569 4.86956L3.33759 4.37691L2.6595 4.86956L2.91853 4.07241L2.24041 3.57975H3.07859L3.33759 2.78259L3.59659 3.57975H4.43478L3.75666 4.07241ZM6.88525 7.2L6.20716 6.70734L5.52906 7.2L5.78809 6.40284L5.10997 5.91019H5.94816L6.20716 5.11303L6.46616 5.91019H7.30434L6.62622 6.40284L6.88525 7.2ZM6.62622 4.07241L6.88525 4.86956L6.20716 4.37691L5.52906 4.86956L5.78809 4.07241L5.10997 3.57975H5.94816L6.20716 2.78259L6.46616 3.57975H7.30434L6.62622 4.07241ZM6.62622 1.74197L6.88525 2.53912L6.20716 2.04647L5.52906 2.53912L5.78809 1.74197L5.10997 1.24931H5.94816L6.20716 0.452156L6.46616 1.24931H7.30434L6.62622 1.74197Z"
                fill="#0052B4"
              />
            </g>
            <defs>
              <clipPath id="clip0_225_7986">
                <rect
                  width="16"
                  height="16"
                  fill="white"
                />
              </clipPath>
            </defs>
          </svg>

          <span>English</span>
          {lang === "en" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.6332 3.22604C13.0607 3.57577 13.1237 4.20579 12.7739 4.63324L7.17863 11.4719C6.61308 12.1632 5.60318 12.2857 4.8887 11.7499L2.7333 10.1333C2.29148 9.80196 2.20193 9.17516 2.5333 8.73333C2.86467 8.2915 3.49147 8.20196 3.9333 8.53333L5.83306 9.95815L11.226 3.36676C11.5757 2.93932 12.2058 2.87631 12.6332 3.22604Z"
                fill="#72E655"
              />
            </svg>
          ) : null}
        </button>
        <button
          className={styles.languageButton}
          onClick={() => {
            setLang("ru");
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_225_7982)">
              <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="#F0F0F0"
              />
              <path
                d="M15.5024 10.7826C15.824 9.91594 16 8.97856 16 8C16 7.02144 15.824 6.08406 15.5024 5.21741H0.497594C0.176031 6.08406 0 7.02144 0 8C0 8.97856 0.176031 9.91594 0.497594 10.7826L8 11.4783L15.5024 10.7826Z"
                fill="#0052B4"
              />
              <path
                d="M7.99996 16C11.4397 16 14.372 13.829 15.5024 10.7826H0.497559C1.6279 13.829 4.56025 16 7.99996 16Z"
                fill="#D80027"
              />
            </g>
            <defs>
              <clipPath id="clip0_225_7982">
                <rect
                  width="16"
                  height="16"
                  fill="white"
                />
              </clipPath>
            </defs>
          </svg>

          <span>Русский</span>
          {lang === "ru" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.6332 3.22604C13.0607 3.57577 13.1237 4.20579 12.7739 4.63324L7.17863 11.4719C6.61308 12.1632 5.60318 12.2857 4.8887 11.7499L2.7333 10.1333C2.29148 9.80196 2.20193 9.17516 2.5333 8.73333C2.86467 8.2915 3.49147 8.20196 3.9333 8.53333L5.83306 9.95815L11.226 3.36676C11.5757 2.93932 12.2058 2.87631 12.6332 3.22604Z"
                fill="#72E655"
              />
            </svg>
          ) : null}
        </button>
      </div>

      <Button
        fullWidth
        onClick={langOnSave}
      >
        {t("languageModal.save")}
      </Button>
    </ModalWrapper>
  );
};
