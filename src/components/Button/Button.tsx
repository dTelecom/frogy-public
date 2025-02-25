import styles from "./Button.module.scss";
import { CSSProperties, PropsWithChildren } from "react";
import { clsx } from "clsx";

type ButtonProps = {
  onClick: () => void;
  fullWidth?: boolean;
  color?: "green" | "gray" | "grayGreenBorder" | "purple";
  disabled?: boolean;
  style?: CSSProperties;
  id?: string;
  className?: string;
} & PropsWithChildren;
export const Button = ({
  children,
  onClick,
  fullWidth,
  color = "green",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        styles.button,
        styles[color],
        fullWidth ? styles.buttonFullWidth : "",
        className ? className : ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};
