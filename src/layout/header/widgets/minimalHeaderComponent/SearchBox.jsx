import React, { useContext, useState } from 'react';
import { Input } from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import { useTranslation } from '@/utils/translations';
import { RiSearchLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';

const SearchBox = () => {
  const { t } = useTranslation('common');
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const onHandleSearch = () => {
    if (searchValue) {
      router.push(`/search?search=${searchValue}`);
    } else {
      router.push(`/search`);
    }
  };
  return (
    <div className="middle-box">
      <div className="center-box">
        <div className="searchbar-box-2 input-group d-xl-flex d-none">
          <Btn className="btn search-icon" type="button">
            <RiSearchLine />
          </Btn>
          <Input
            type="text"
            className="form-control"
            placeholder="Search for products, styles,brands..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Btn
            className="btn search-button"
            type="button"
            onClick={onHandleSearch}
          >
            {t('Search')}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
