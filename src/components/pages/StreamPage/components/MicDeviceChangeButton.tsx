import {
  MediaDeviceMenu,
  useMaybeRoomContext,
  useMediaDeviceSelect,
  useTrackToggle,
} from "@dtelecom/components-react";
import styles from "../StreamPage.module.scss";
import * as React from "react";
import { useEffect, useRef } from "react";
import MicOnIcon from "@/assets/icons/micOnIcon.svg";
import MicOffIcon from "@/assets/icons/micOffIcon.svg";
import { Track } from "@dtelecom/livekit-client";
import { useTranslation } from "react-i18next";

interface MicDeviceChangeButtonProps {
  isMuted: boolean;
}

export const MicDeviceChangeButton = ({
  isMuted,
}: MicDeviceChangeButtonProps) => {
  const { toggle } = useTrackToggle({
    source: Track.Source.Microphone,
  });
  const ref = useRef(null);
  const { t } = useTranslation();

  const room = useMaybeRoomContext();
  const { devices } = useMediaDeviceSelect({
    kind: "audioinput",
    room,
  });

  const muteButton = `<button id="mutebutton" class='lk-button'>${
    isMuted ? t("common.unmute") : t("common.mute")
  }</button>`;

  useEffect(() => {
    // HACK: remove li where innerHTML contains "CADefaultDeviceAggregate"
    // @ts-ignore
    const list = ref.current?.querySelector(".lk-media-device-select");
    if (list) {
      // @ts-ignore
      list.childNodes.forEach((li) => {
        if (li.innerHTML.includes("CADefaultDeviceAggregate")) {
          list.removeChild(li);
        }
      });
    }

    // mute button
    const button = document.getElementById("mutebutton");
    if (button) {
      button.innerHTML = isMuted ? t("common.unmute") : t("common.mute");
    } else {
      // @ts-ignore
      const list = ref.current?.querySelector(".lk-media-device-select");

      if (list) {
        const li = document.createElement("li");
        li.innerHTML = muteButton;
        li.onclick = () => {
          toggle();
        };
        li.ariaSelected = !isMuted ? "true" : "false";
        li.role = "option";
        list.appendChild(li);
      }
    }
  }, [devices, isMuted, toggle, devices]);

  return (
    <div className={styles.camSwitchIcon}>
      {!isMuted ? <MicOnIcon /> : <MicOffIcon />}
      <div ref={ref} className="lk-button-group-menu">
        <MediaDeviceMenu
          onActiveDeviceChange={() => {
            if (isMuted) {
              toggle();
            }
          }}
          kind="audioinput"
        />
      </div>
    </div>
  );
};
