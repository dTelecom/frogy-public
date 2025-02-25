import styles from './ViewerBadge.module.scss';
import UserIcon from '@/assets/icons/user.svg';

type ViewerBadgeProps = {
  viewers: number;
};

export const ViewerBadge = ({ viewers }: ViewerBadgeProps) => {
  return (
    <span className={styles.viewerBadge}><UserIcon/>{viewers}</span>);
};
