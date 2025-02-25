import { PropsWithChildren, useEffect } from "react";
import styles from "./ModalWrapper.module.scss";
import CloseIcon from "/src/assets/icons/close.svg";
import { clsx } from "clsx";

type ModalWrapperProps = PropsWithChildren & {
  onClose?: () => void;
  fullWidth?: boolean;
  noPadding?: boolean;
  wrapperClassName?: string;
};
export const ModalWrapper = ({
  children,
  onClose,
  fullWidth = true,
  noPadding = false,
  wrapperClassName,
}: ModalWrapperProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className={clsx(styles.wrapper, wrapperClassName)}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: fullWidth ? "100%" : undefined,
          padding: noPadding ? 0 : undefined,
        }}
        className={styles.container}
      >
        {onClose && (
          <button className={styles.close} onClick={onClose}>
            <CloseIcon />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
