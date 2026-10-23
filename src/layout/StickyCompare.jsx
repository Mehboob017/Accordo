import Link from 'next/link';
import { useTranslation } from '@/utils/translations';

const StickyCompare = () => {
  return (
    <div className="compare-fix">
      <Link href={`/compare`}>
        <h5>Compare</h5>
      </Link>
    </div>
  );
};

export default StickyCompare;
