'use client';

import styles from './account.module.css'

export const RedirectBanner = () => {
  return (
    <div className={styles.redirectBanner}>
      <div className={styles.redirectBannerContent}>
        <div>You&apos;ve already joined the Discord Community</div>
        <div>Can&apos;t find it? <a href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform" target="_blank">Contact Support</a></div>
      </div>
    </div>
  );
};
