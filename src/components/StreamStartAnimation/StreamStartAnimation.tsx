import * as React from "react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import styles from "./StreamStartAnimation.module.scss";

export const StreamStartAnimation = () => {
  const [start, setStart] = useState(false);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    setStart(true);
    setTimeout(() => {
      setHide(true);
    }, 4000);
  }, []);
  if (hide) {
    return null;
  }
  return (
    <div
      className={clsx(
        styles.numbersContainer,
        start ? styles.numbersContainerStarted : ""
      )}
    >
      <div>3</div>
      <div>2</div>
      <div>1</div>
    </div>
  );
};
