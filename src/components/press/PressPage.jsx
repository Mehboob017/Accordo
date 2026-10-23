'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PressGrid from './PressGrid';
import PressViewer from './PressViewer';
import PressPageSkeleton from './PressPageSkeleton';
import WrapperComponent from '../common/WrapperComponent';
import { usePresses } from '@/utils/hooks/usePresses';
import Pagination from '@/components/common/Pagination';

const PressPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const itemsPerPage = 12;

  const rawPage = Number(searchParams.get('page'));
  const currentPage =
    Number.isFinite(rawPage) && Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const { data: response, isLoading } = usePresses(currentPage, itemsPerPage);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const pressData = useMemo(() => response?.data?.presses || [], [response]);
  const totalItems = response?.data?.pagination?.total || 0;

  const openViewer = (index) => {
    if (!pressData?.[index]) return;

    setActiveIndex(index);
    setViewerOpen(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));
    params.set('uid', pressData[index].uid);

    // Use push() when opening viewer to create a new history entry
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeViewer = () => {
    setViewerOpen(false);

    // Use back() to go back to the press page
    // This will remove the viewer URL from history
    router.push('/press', { scroll: false });
  };

  useEffect(() => {
    const uid = searchParams.get('uid');

    if (!uid) {
      // If there's no uid in URL, close the viewer
      setViewerOpen(false);
      return;
    }

    if (!pressData.length) return;

    const index = pressData.findIndex((item) => item.uid === uid);

    if (index !== -1) {
      setActiveIndex(index);
      setViewerOpen(true);
    } else {
      // If uid doesn't match any item, close viewer
      setViewerOpen(false);
    }
  }, [searchParams, pressData]);

  if (isLoading) return <PressPageSkeleton />;

  return (
    <WrapperComponent
      classes={{
        sectionClass: 'section-b-space press-main-section',
      }}
      noSectionTopSpace={true}
    >
      <div className="press-page">
        <div className="press-content-section">
          <div className="press-page">
            <section className="press-page__content">
              <PressGrid items={pressData} onOpen={openViewer} />
            </section>


            {totalItems > itemsPerPage && (
              <nav className="custome-pagination mt-4">
                <Pagination total={totalItems} perPage={itemsPerPage} />
              </nav>
            )}

            {viewerOpen && (
              <PressViewer
                items={pressData}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onClose={closeViewer}
                searchParams={searchParams}
              />
            )}
          </div>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default PressPage;