import { useContext, useState } from 'react';
import { Input, InputGroup } from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import { useRouter } from 'next/navigation';
import { RiSearchLine } from 'react-icons/ri';
import CategoryDropdown from './CategoryDropdown';

const HeaderSearchBar = () => {
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
      <div className="location-box">
        <CategoryDropdown />
      </div>
      <div className="search-box">
        <InputGroup>
          <Input
            type="search"
            className="form-control"
            placeholder="I'm searching for..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Btn
            className="btn"
            type="button"
            id="button-addon2"
            onClick={onHandleSearch}
          >
            <RiSearchLine />
          </Btn>
        </InputGroup>
      </div>
    </div>
  );
};

export default HeaderSearchBar;
