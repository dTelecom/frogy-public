import styles from './PageWrapper.module.scss';
import { PropsWithChildren } from 'react';

export const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className={styles.content}>
        {children}
      </div>
    </>
  );
};
