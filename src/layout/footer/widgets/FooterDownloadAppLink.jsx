import React, { useContext } from 'react';
import Image from 'next/image';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import appstoreImage from '../../../../public/assets/images/appstore.svg';
import playstoreImage from '../../../../public/assets/images/playstore.svg';
import PreferredSource from '@/app/(mainLayout)/badge/PreferredSource';

const FooterDownloadAppLink = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <>
      {themeOption?.footer?.app_store_url ||
        themeOption?.footer?.play_store_url ? (
        <li className="social-app mb-0">
          <div className="mb-2" style={{ color: '#535E75', fontWeight: 600 }}>Download App :</div>
          <ul>
            {themeOption?.footer?.play_store_url && (
              <li className="mb-0">
                <a
                  href={themeOption?.footer?.play_store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={playstoreImage}
                    alt="play store"
                    height={45}
                    width={150}
                  />
                </a>
              </li>
            )}
            {themeOption?.footer?.app_store_url && (
              <li className="mb-0">
                <a href={themeOption?.footer?.app_store_url} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={appstoreImage}
                    alt="app store"
                    height={45}
                    width={150}
                  />
                </a>
              </li>
            )}
          </ul>

          <div className='mt-3'>
            <PreferredSource />
          </div>
        </li>
      ) : (
        ''
      )}
    </>
  );
};

export default FooterDownloadAppLink;
