'use client';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { usePathname } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { headerOptionsMap } from '../../data/Layout';
import StandardHeader from './widgets/StandardHeader';
import MinimalHeader from './widgets/MinimalHeader';
import BasicHeader from './widgets/BasicHeader';
import ClassicHeader from './widgets/ClassicHeader';

const MainHeader = () => {
  const pathName = usePathname();
  let currentPath = pathName.split(`/`)[1];
  const { themeOption } = useContext(ThemeOptionContext);
  const headerList = {
    basic_header: <BasicHeader />,
    classic_header: <ClassicHeader />,
    minimal_header: <MinimalHeader />,
    standard_header: <StandardHeader />,
  };
  const showHeader = useMemo(() => {
    return headerOptionsMap[currentPath] || themeOption?.header?.header_options;
  }, [pathName, themeOption?.header?.header_options]);
  return headerList[showHeader] || <BasicHeader />;
};

export default MainHeader;
