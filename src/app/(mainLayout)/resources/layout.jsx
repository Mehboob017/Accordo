import WrapperComponent from '@/components/common/WrapperComponent';
import TabNavigation from './components/TabNavigation';
import ResourcesHeader from './components/ResourcesHeader';

export default function ResourcesLayout({ children }) {
  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: 'section-b-space',
        }}
      >
        <ResourcesHeader />
        <TabNavigation />
        <div>{children}</div>
      </WrapperComponent>
    </>
  );
}
