import styles from "./AppBar.module.scss";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import LiveIcon from "/src/assets/icons/appBar/live.svg";
import InviteIcon from "/src/assets/icons/appBar/invite.svg";
import RankingIcon from "/src/assets/icons/appBar/ranking.svg";
import RewardsIcon from "/src/assets/icons/appBar/rewards.svg";
import LiveIconActive from "/src/assets/icons/appBar/liveActive.svg";
import InviteIconActive from "/src/assets/icons/appBar/inviteActive.svg";
import RankingIconActive from "/src/assets/icons/appBar/rankingActive.svg";
import RewardsIconActive from "/src/assets/icons/appBar/rewardsActive.svg";
import StartStreamIcon from "/src/assets/icons/appBar/startStream.svg";
import { useRouter } from "next/router";

export const AppBar = () => {
  const navigate = useRouter().push;
  const {} = useRouter();
  const { t } = useTranslation();

  const isPathActive = (path: string | string[]) => {
    if (Array.isArray(path)) {
      return path.some((p) => window.location.pathname === p);
    }
    return window.location.pathname === path;
  };
  const buttonClass = (path: string | string[]) => {
    return clsx(styles.button, isPathActive(path) ? styles.buttonActive : "");
  };

  return (
    <div className={styles.appBar}>
      <div className={styles.appBarNav}>
        <button
          className={buttonClass(["/", "/upgrade"])}
          onClick={() => navigate("/")}
          disabled
        >
          {isPathActive(["/", "/upgrade"]) ? <LiveIconActive /> : <LiveIcon />}
          <span>{t("appBar.live")}</span>
        </button>
        <button
          className={buttonClass("/invite")}
          onClick={() => navigate("/invite")}
          disabled
        >
          {isPathActive("/invite") ? <InviteIconActive /> : <InviteIcon />}
          <span>{t("appBar.invite")}</span>
        </button>
        <button
          className={buttonClass("/start-stream")}
          onClick={() => navigate("/start-stream")}
        >
          <div className={styles.startStream}>
            <StartStreamIcon />
          </div>
        </button>
        <button
          className={buttonClass("/rankings")}
          onClick={() => navigate("/rankings")}
          disabled
        >
          {isPathActive("/rankings") ? <RankingIconActive /> : <RankingIcon />}
          <span>{t("appBar.top")}</span>
        </button>
        <button
          className={buttonClass("/rewards")}
          onClick={() => navigate("/rewards")}
          disabled
        >
          {isPathActive("/rewards") ? <RewardsIconActive /> : <RewardsIcon />}
          <span>{t("appBar.rewards")}</span>
        </button>
      </div>
    </div>
  );
};
