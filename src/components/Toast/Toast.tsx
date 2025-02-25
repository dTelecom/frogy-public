import SuccessIcon from "/src/assets/icons/toasts/success.svg";
import ErrorIcon from "/src/assets/icons/toasts/error.svg";
import WarningIcon from "/src/assets/icons/toasts/warning.svg";
import { ToastContentProps } from "react-toastify";
import styles from "./Toast.module.scss";
import CloseIcon from "/src/assets/icons/close.svg";

const Icons = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />
};

interface IToast extends Partial<ToastContentProps> {
  type: "success" | "error" | "warning";
  message?: string;
}

export const Toast = ({ type, message, ...props }: IToast) => {
  return (
    <div className={styles.toast}>
      <div className={styles.icon}>{Icons[type]}</div>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.closeButton}
        onClick={props.toastProps?.closeToast}
      >
        <CloseIcon />
      </button>
    </div>
  );
};
