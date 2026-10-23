import Image from 'next/image';
import { RiCheckboxCircleFill, RiCloseCircleFill, RiStarFill } from 'react-icons/ri';
import { FaChevronRight } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';

const StaticOrderCards = ({
  isLoading,
  staticReferenceOrder,
  onOpenOrderDetails,
  onRateOrderClick,
}) => {
  return (
    <>
      <div className="order-card">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="order-header"
        >
          <div className="order-info">
            <div className="status">
              <span>Order delivered</span>
              <span>
                <RiCheckboxCircleFill className="status-delivered" />
              </span>
              <div className="refund-badge-wrapper">
                <span className="refund-badge completed">REFUND COMPLETED</span>
              </div>
            </div>
            <p className="meta">Placed at 12th Mar 2026, 10:49 PM</p>
          </div>

          <div className="order-actions">
            <span className="price">₹407</span>
            <span className="menu-btn">
              <FaChevronRight size={10} />
            </span>
          </div>
        </a>

        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="product-list"
        >
          {[1, 2, 3].map((index) => (
            <div className="product" key={index}>
              {isLoading ? (
                <div className="imageSkeleton" />
              ) : (
                <Image
                  src="/assets/images/product/Swamala-Classic.jpg"
                  alt="product.name"
                  draggable={false}
                  width={48}
                  height={48}
                  className="image"
                  unoptimized
                />
              )}
            </div>
          ))}
        </a>

        <div className="order-footer">
          <button className="btn full-width" onClick={(event) => onRateOrderClick(event)}>
            Rate Order <RiStarFill color="#f5c518" />
          </button>
          <button className="btn primary">
            Order Again
            <IoMdRefresh />
          </button>
        </div>
      </div>

      <div className="order-card">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="order-header"
        >
          <div className="order-info">
            <div className="status">
              <span>Order confirmed</span>
              <span>
                <RiCheckboxCircleFill className="status-confirmed" />
              </span>
            </div>
            <p className="meta">Placed at 21st Mar 2026, 01:12 AM</p>
          </div>

          <div className="order-actions">
            <span className="price">₹254</span>
            <span className="menu-btn">
              <FaChevronRight size={10} />
            </span>
          </div>
        </a>

        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="product-list"
        >
          {[1, 2].map((index) => (
            <div className="product" key={index}>
              {isLoading ? (
                <div className="imageSkeleton" />
              ) : (
                <Image
                  src="/assets/images/product/Hingwashtak_Choorna.webp"
                  alt="product.name"
                  draggable={false}
                  width={48}
                  height={48}
                  className="image"
                  unoptimized
                />
              )}
            </div>
          ))}
          <div className="product more">
            {isLoading ? (
              <div className="imageSkeleton" />
            ) : (
              <Image
                src="/assets/images/product/Hingwashtak_Choorna.webp"
                alt="product.name"
                draggable={false}
                width={48}
                height={48}
                className="image"
                unoptimized
              />
            )}
            <span className="count">2</span>
          </div>
        </a>

        <div className="order-footer">
          <button className="btn secondary" onClick={(event) => onRateOrderClick(event)}>
            Rate Order <RiStarFill color="#f5c518" />
          </button>
          <button className="btn primary">
            Order Again
            <IoMdRefresh />
          </button>
        </div>
      </div>

      <div className="order-card">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="order-header"
        >
          <div className="order-info">
            <div className="status">
              <span>Order cancelled</span>
              <span>
                <RiCloseCircleFill className="status-cancelled" />
              </span>
            </div>
            <p className="meta">Placed at 21st Mar 2026, 01:12 AM</p>
          </div>

          <div className="order-actions">
            <span className="price">₹254</span>
            <span className="menu-btn">
              <FaChevronRight size={10} />
            </span>
          </div>
        </a>

        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenOrderDetails(staticReferenceOrder);
          }}
          className="product-list"
        >
          <div className="product">
            {isLoading ? (
              <div className="imageSkeleton" />
            ) : (
              <Image
                src="/assets/images/product/Hingwashtak_Choorna.webp"
                alt="product.name"
                draggable={false}
                width={48}
                height={48}
                className="image"
                unoptimized
              />
            )}
          </div>
          <div className="product more">
            {isLoading ? (
              <div className="imageSkeleton" />
            ) : (
              <Image
                src="/assets/images/product/Swamala-Classic.jpg"
                alt="product.name"
                draggable={false}
                width={48}
                height={48}
                className="image"
                unoptimized
              />
            )}
            <span className="count">2</span>
          </div>
        </a>

        <div className="order-footer">
          <button className="btn secondary" onClick={(event) => onRateOrderClick(event)} disabled>
            Rate Order <RiStarFill color="#f5c518" />
          </button>
          <button className="btn primary">
            Order Again
            <IoMdRefresh />
          </button>
        </div>
      </div>
    </>
  );
};

export default StaticOrderCards;
