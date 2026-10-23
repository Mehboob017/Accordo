import Image from 'next/image';
import { useContext, useState } from 'react';
import headPhone from '../../../../../public/assets/images/icon/music.png';
import HotSale from '../../../../../public/assets/images/icon/hot-sale.png';
import HeaderDealModal from '../common/HeaderDealModal';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useTranslation } from '@/utils/translations';

const StandardHotDeal = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const [modal, setModal] = useState(false);
  const { t } = useTranslation('common');
  return (
    <>
      <div className="right-nav">
        <div className="nav-number">
          <Image
            src={headPhone}
            className="img-fluid"
            alt="nav-number"
            height={32}
            width={32}
          />
          <span>{themeOption?.header?.support_number}</span>
        </div>
        <a
          className="btn theme-bg-color ms-3 fire-button"
          onClick={() => setModal(true)}
        >
          <div className="fire">
            <Image
              src={HotSale}
              className="img-fluid"
              alt="fire"
              height={20}
              width={20}
            />
          </div>
          <span>{t('HotDeals')}</span>
        </a>
      </div>
      <HeaderDealModal
        modal={modal}
        setModal={setModal}
        data={themeOption?.header?.today_deals}
      />
    </>
  );
};

export default StandardHotDeal;
