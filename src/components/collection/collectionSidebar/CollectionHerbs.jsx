import { useContext } from 'react';
import { AccordionBody, Input, Label } from 'reactstrap';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomSearchParams } from '@/utils/hooks/useCustomSearchParams';

const CollectionHerbs = ({ filter, setFilter }) => {
  const [attribute, price, rating, sortBy, field, layout] =
    useCustomSearchParams([
      'attribute',
      'price',
      'rating',
      'sortBy',
      'field',
      'layout',
    ]);
  const router = useRouter();
  const pathname = usePathname();

  // Static list of herbs for demonstration
  const herbsData = [
    { name: 'Basil', slug: 'basil', products_count: 10 },
    { name: 'Mint', slug: 'mint', products_count: 8 },
    { name: 'Rosemary', slug: 'rosemary', products_count: 5 },
    { name: 'Thyme', slug: 'thyme', products_count: 7 },
  ];

  const redirectToCollection = (event, slug) => {
    event.preventDefault();
    let temp = [...filter?.herbs || []];
    if (!temp.includes(slug)) {
      temp.push(slug);
    } else {
      temp = temp.filter((elem) => elem !== slug);
    }
    setFilter((prev) => {
      return {
        ...prev,
        herbs: temp,
      };
    });
    if (temp.length > 0) {
      const queryParams = new URLSearchParams({
        ...attribute,
        ...price,
        ...sortBy,
        ...field,
        ...rating,
        ...layout,
        herbs: temp,
      }).toString();
      router.push(`${pathname}?${queryParams}`);
    } else {
      const queryParams = new URLSearchParams({
        ...attribute,
        ...price,
        ...sortBy,
        ...field,
        ...rating,
        ...layout,
      }).toString();
      router.push(`${pathname}?${queryParams}`);
    }
  };

  return (
    <AccordionBody accordionId="4">
      <ul   data-lenis-prevent className="category-list custom-padding custom-height">
        {herbsData?.map((elem, i) => (
          <li key={i}>
            <div className="form-check category-list-box">
              <Input
                className="checkbox_animated"
                type="checkbox"
                id={elem?.slug}
                checked={filter?.herbs?.includes(elem?.slug)}
                onChange={(e) => redirectToCollection(e, elem?.slug)}
              />
              <Label className="form-check-label" htmlFor={elem?.slug}>
                <span className="name">{elem?.name}</span>
                <span className="number">({elem?.products_count || 0})</span>
              </Label>
            </div>
          </li>
        ))}
      </ul>
    </AccordionBody>
  );
};

export default CollectionHerbs;