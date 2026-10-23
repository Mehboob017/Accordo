'use client';

import { useEffect, useMemo } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({ total = 0, perPage = 6 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = useMemo(
    () => Math.ceil(total / perPage),
    [total, perPage]
  );

  // always convert searchParams safely
  const rawPage = Number(searchParams.get('page'));
  const currentPage =
    Number.isFinite(rawPage) && Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const buildUrl = (page) => {
    const params = new URLSearchParams(searchParams.toString());

    // keep all existing params, only update page
    params.set('page', String(page));

    return `${pathname}?${params.toString()}`;
  };

  // normalize invalid pages only when required
  useEffect(() => {
    if (!totalPages) return;

    let normalized = currentPage;

    if (currentPage < 1) normalized = 1;
    if (currentPage > totalPages) normalized = totalPages;

    const hasPageParam = searchParams.has('page');

    if (hasPageParam && normalized !== currentPage) {
      router.replace(buildUrl(normalized), { scroll: true });
    }
  }, [currentPage, totalPages, router, searchParams, pathname]);

  // ✅ Scroll to top whenever page changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.lenis) {
      window.lenis.stop();
      window.lenis.scrollTo(0, { immediate: true });
      window.lenis.start();
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const MAX_VISIBLE = 3;
  const half = Math.floor(MAX_VISIBLE / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, startPage + MAX_VISIBLE - 1);

  if (endPage - startPage < MAX_VISIBLE - 1) {
    startPage = Math.max(1, endPage - MAX_VISIBLE + 1);
  }

  const changePage = (page) => {
    if (!page || page === currentPage) return;
    if (page < 1 || page > totalPages) return;

    router.push(buildUrl(page));
  };

  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <ul className="pagination justify-content-center">
      {/* Previous */}
      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button
          type="button"
          className="page-link"
          aria-label="Go to previous page"
          disabled={currentPage === 1}
          onClick={() => changePage(currentPage - 1)}
        >
          <RiArrowLeftSLine aria-hidden="true" />
        </button>
      </li>

      {/* First + Ellipsis */}
      {startPage > 1 && (
        <>
          <li className="page-item">
            <button
              type="button"
              className="page-link"
              aria-label="Go to page 1"
              onClick={() => changePage(1)}
            >
              1
            </button>
          </li>

          {startPage > 2 && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}
        </>
      )}

      {/* Pages */}
      {pages.map((page) => (
        <li key={page} className="page-item">
          <button
            type="button"
            className={`page-link ${page === currentPage ? 'active' : ''}`}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => changePage(page)}
          >
            {page}
          </button>
        </li>
      ))}

      {/* Ellipsis + Last */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}

          <li className="page-item">
            <button
              type="button"
              className="page-link"
              aria-label={`Go to page ${totalPages}`}
              onClick={() => changePage(totalPages)}
            >
              {totalPages}
            </button>
          </li>
        </>
      )}

      {/* Next */}
      <li
        className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
      >
        <button
          type="button"
          className="page-link"
          aria-label="Go to next page"
          disabled={currentPage === totalPages}
          onClick={() => changePage(currentPage + 1)}
        >
          <RiArrowRightSLine aria-hidden="true" />
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
