import { useContext } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useTranslation } from '@/utils/translations';
import { RiFilter2Fill } from 'react-icons/ri';

const FilterBtn = ({ isOffcanvas, disabled = false }) => {
  const { t } = useTranslation('common');
  const { openOffCanvas, setOpenOffCanvas } = useContext(ThemeOptionContext);
  return (
    <>
      {isOffcanvas && (
        <div className="sidebar-filter-menu">
          <a
            onClick={() => !disabled && setOpenOffCanvas(!openOffCanvas)}
            aria-disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
          >
            <RiFilter2Fill /> {t('FilterMenu')}
          </a>
        </div>
      )}
    </>
  );
};

export default FilterBtn;
