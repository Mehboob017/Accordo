import { usePathname } from 'next/navigation';
import MainFooter from './footer';
import MainHeader from './header';
import MobileMenu from './mobileMenu';
import TapTop from './tapTop';

const SubLayout = ({ children }) => {
  const pathname = usePathname();
  // Hide mobile menu on collection, shop and product detail pages
  const isCollectionPage =
    pathname?.includes('/collection') ||
    pathname?.includes('/shop') ||
    pathname?.includes('/product');
  const isOrderSuccessPage = pathname?.includes('/order-success');

  return (
    <>
      {!isOrderSuccessPage && <MainHeader />}
      {!isOrderSuccessPage && !isCollectionPage && <MobileMenu />}
      <main style={{ minHeight: "100vh" }}>{children}</main>
      <TapTop />
      {!isOrderSuccessPage && <MainFooter />}
    </>
  );
};

export default SubLayout;
