import { useContext } from 'react';
import { Col } from 'reactstrap';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import CategoryContext from '@/helper/categoryContext';

const FooterCategory = ({ footerMenu, setFooterMenu }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { filterCategory } = useContext(CategoryContext);
  const categoryData = filterCategory('product');
  return (
    <Col xl={2} md={4} sm={4}>
      <div
        className={`footer-title ${footerMenu == 'category' ? 'show' : ''}`}
        onClick={() =>
          setFooterMenu((prev) => (prev !== 'category' ? 'category' : ''))
        }
      >
        <h4>Shop Online</h4>
      </div>

      {/* this commented is for the category data  */}
      {/* <div className="footer-contain">
        <ul>
          {categoryData
            ?.filter((elem) =>
              themeOption?.footer?.footer_categories.includes(elem.id)
            )
            .map((result, i) => (
              <li key={i} style={{ marginBottom: '10px' }}>
                <a
                  href={`/collections?category=${result?.slug}`}
                  className="text-content-color"
                >
                  {result?.name}
                </a>
              </li>
            ))}
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?category=consumer-ayurved-arishta`}
              className="text-content-color"
            >
              Arishta
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?category=consumer-ayurved-avaleha-pak`}
              className="text-content-color"
            >
              Avaleha Pak
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?department=retail-division&category=retail-division-ayurvedic-products`}
              className="text-content-color"
            >
              Ayurvedic Products
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`collections?department=exclusive-for-physician&category=exclusive-for-physicians-patent-and-proprietary`}
              className="text-content-color"
            >
              Patent and Proprietary
            </a>
          </li>
        </ul>
      </div> */}

      {/* this is for the about us data  */}
      <div className="footer-contain">
        <ul>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?department=consumer-ayurved`}
              className="text-content-color"
            >
              Consumer Ayurved
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?department=vaidya-seva`}
              className="text-content-color"
            >
              Vaidya Seva
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?department=ayurved-pharmacy`}
              className="text-content-color"
            >
              Ayurved Pharmacy
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?tags=best-seller`}
              className="text-content-color"
            >
              Shop by Best Sellers
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/collections?tags=combo`}
              className="text-content-color"
            >
              Shop by Combo
            </a>
          </li>
        </ul>
      </div>
    </Col>
  );
};

export default FooterCategory;
