import styles from "./LiveBadge.module.scss";
import liveGif from "/src/assets/img/live.gif";
import { useTranslation } from "react-i18next";

type LiveBadgeProps = {
  online?: boolean;
};

export const LiveBadge = ({ online }: LiveBadgeProps) => {
  const { t } = useTranslation();
  if (!online)
    return <div className={styles.offlineBadge}>{t("common.offline")}</div>;

  return (
    <div className={styles.liveBadge}>
      <img className={styles.liveBadgeIcon} src={liveGif.src} alt={""} />
      Live
    </div>
  );
};
