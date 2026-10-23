import { useContext } from 'react';
import { AccordionBody, Input, Label } from 'reactstrap';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomSearchParams } from '@/utils/hooks/useCustomSearchParams';

const CollectionDiscount = ({ filter, setFilter }) => {
  const [attribute, category, rating, sortBy, field, layout] =
    useCustomSearchParams([
      'attribute',
      'category',
      'rating',
      'sortBy',
      'field',
      'layout',
    ]);
  const router = useRouter();
  const pathname = usePathname();

  // Static list of discount ranges
  const discountData = [
    { name: '10% or more', value: '10', products_count: 20 },
    { name: '20% or more', value: '20', products_count: 15 },
    { name: '30% or more', value: '30', products_count: 10 },
    { name: '50% or more', value: '50', products_count: 5 },
  ];

  const checkDiscount = (value) => {
    return filter?.discount?.includes(value);
  };

  const applyDiscount = (event) => {
    const value = event?.target?.value;
    let temp = [...filter?.discount || []];
    if (event.target.checked) {
      temp.push(value);
    } else {
      temp = temp.filter((elem) => elem !== value);
    }
    setFilter((prev) => {
      return {
        ...prev,
        discount: temp,
      };
    });
    if (temp.length > 0) {
      const queryParams = new URLSearchParams({
        ...attribute,
        ...category,
        ...sortBy,
        ...field,
        ...rating,
        ...layout,
        discount: temp,
      }).toString();
      router.push(`${pathname}?${queryParams}`);
    } else {
      const queryParams = new URLSearchParams({
        ...attribute,
        ...category,
        ...sortBy,
        ...field,
        ...rating,
        ...layout,
      }).toString();
      router.push(`${pathname}?${queryParams}`);
    }
  };

  return (
    <AccordionBody accordionId="5">
      <ul   data-lenis-prevent className="category-list custom-padding custom-height">
        {discountData?.map((elem, i) => (
          <li key={i}>
            <div className="form-check category-list-box">
              <Input
                className="checkbox_animated"
                type="checkbox"
                id={`discount-${elem?.value}`}
                value={elem?.value}
                checked={checkDiscount(elem?.value)}
                onChange={applyDiscount}
              />
              <Label className="form-check-label" htmlFor={`discount-${elem?.value}`}>
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

export default CollectionDiscount;