import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import { Col } from 'reactstrap';
import Avatar from '@/components/common/Avatar';
import TodaysDeal from './TodaysDeal';
import Btn from '@/elements/buttons/Btn';
import ClassicHeaderMenu from './ClassicHeaderMenu';
import { placeHolderImage } from '../../../../data/CommonPath';
import { useTranslation } from '@/utils/translations';
import CategoryContext from '@/helper/categoryContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { RiAlignLeft, RiCloseLine } from 'react-icons/ri';

const HeaderCategory = ({ customClass, icon, dropDownClass }) => {
  const { filterCategory } = useContext(CategoryContext);
  const categoryData = filterCategory('product');
  const { t } = useTranslation('common');
  const { themeOption } = useContext(ThemeOptionContext);
  const filteredCategories = useMemo(() => {
    return categoryData?.filter((elem) =>
      themeOption?.header?.category_ids?.includes(elem.id)
    );
  });
  return (
    <Col xs={12}>
      <div className={`${customClass ? customClass : 'header-nav'}`}>
        <div className="header-nav-left">
          <Btn className={`dropdown-category ${dropDownClass ?? ''}`}>
            {icon ? icon : <RiAlignLeft />}
            <span>{t('AllCategories')}</span>
          </Btn>

          <div className="category-dropdown">
            <div className="category-title">
              <h5>{t('Categories')}</h5>
              <Btn type="button" className="p-0 close-button text-content">
                <RiCloseLine />
              </Btn>
            </div>

            <ul className="category-list">
              {filteredCategories?.map((elem, i) => (
                <li className="onhover-category-list" key={i}>
                  <Link
                    href={`/collections?category=${elem?.slug}`}
                    className="category-name"
                  >
                    <Avatar
                      data={elem?.category_icon}
                      placeHolder={placeHolderImage}
                      name={elem.name}
                    />
                    <h6>{elem?.name}</h6>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ClassicHeaderMenu />

        <TodaysDeal />
      </div>
    </Col>
  );
};

export default HeaderCategory;
