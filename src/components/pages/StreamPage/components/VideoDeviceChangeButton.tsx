import {
  MediaDeviceMenu,
  useMaybeRoomContext,
  useMediaDeviceSelect,
} from "@dtelecom/components-react";
import styles from "../StreamPage.module.scss";
import CamSwitchIcon from "@/assets/icons/camSwitchIcon.svg";
import * as React from "react";

export const VideoDeviceChangeButton = () => {
  const room = useMaybeRoomContext();
  const { devices } = useMediaDeviceSelect({
    kind: "videoinput",
    room,
  });

  if (devices.length <= 1) return null;

  return (
    <div className={styles.camSwitchIcon}>
      <CamSwitchIcon />
      <div className="lk-button-group-menu">
        <MediaDeviceMenu kind="videoinput" />
      </div>
    </div>
  );
};
