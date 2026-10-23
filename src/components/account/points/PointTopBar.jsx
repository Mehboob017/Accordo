import { useSearchParams } from 'next/navigation';
import { useCoins } from '@/utils/hooks/useCoins';
import Loader from '@/layout/loader';
import NoDataFound from '@/components/common/NoDataFound';
import emptyImage from '../../../../public/assets/svg/empty-items.svg';
import PointTable from './PointTable';
import AccountHeading from '@/components/common/AccountHeading';

const PointTopBar = () => {
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get('page'));
  const page =
    Number.isFinite(rawPage) && Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const {
    data,
    isLoading,
    isFetching,
  } = useCoins({
    page,
    limit: 10,
  });

  if (isLoading || isFetching) {
    return <Loader />;
  }

  const hasTransactions = (data?.transactions?.data || []).length > 0;

  return (
    <>
      {/* <AccountHeading title="SDL Points" /> */}
      {hasTransactions ? (
        <PointTable data={data} />
      ) : (
        <NoDataFound
          data={{
            customClass: 'no-data-added',
            imageUrl: emptyImage,
            title: 'No Transaction Found',
            description: 'You have not earned any SDL Points yet',
            height: 300,
            width: 300,
          }}
        />
      )}
    </>
  );
};

export default PointTopBar;
