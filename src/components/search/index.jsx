'use client';
import { useContext, useEffect, useState } from 'react';
import Breadcrumb from '../common/Breadcrumb';
import { LeafSVG } from '../common/CommonSVG';
import { Input, InputGroup } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import Btn from '@/elements/buttons/Btn';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/translations';
import SearchedData from './SearchedData';
import ProductContext from '@/helper/productContext';

const SearchModule = () => {
  const { t } = useTranslation('common');
  const [searchState, setSearchState] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const { productData } = useContext(ProductContext);
  const [data, setData] = useState([]);
  useEffect(() => {
    search
      ? setData(
          productData?.filter((product) =>
            product.name.toLowerCase().includes(search?.toLowerCase())
          )
        )
      : setData(productData);
    setSearchState(search);
  }, [search, productData]);
  const onHandleSearch = () => {
    router.push(`/search?search=${searchState}`);
  };
  const onChangeHandler = (value) => {
    if (!value) {
      router.push(`/search?search=`);
    }
    setSearchState(value);
  };
  return (
    <>
      <Breadcrumb title={'Search'} subNavigation={[{ name: 'Search' }]} />
      <WrapperComponent
        classes={{ sectionClass: 'search-section', col: 'mx-auto' }}
        colProps={{ xxl: 6, xl: 8 }}
      >
        <div className="title d-block text-center">
          <h2>{t('SearchForProducts')}</h2>
          <span className="title-leaf">
            <LeafSVG />
          </span>
        </div>

        <div className="search-box">
          <InputGroup>
            <Input
              type="text"
              className="form-control"
              value={searchState}
              onChange={(e) => onChangeHandler(e.target.value)}
            />
            <Btn
              className="m-0"
              type="button"
              color="primary"
              title="Search"
              onClick={onHandleSearch}
            />
          </InputGroup>
        </div>
      </WrapperComponent>
      <SearchedData data={data} />
    </>
  );
};

export default SearchModule;
