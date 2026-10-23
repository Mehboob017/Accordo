import { useContext } from 'react';
import { Row } from 'reactstrap';
import { useTranslation } from '@/utils/translations';
import { latestBlogSlider } from '../../data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';
import FeatureBlog from '../parisTheme/FeatureBlog';
import ThemeOptionContext from '@/helper/themeOptionsContext';

const OurBlog = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { t } = useTranslation('common');
  return (
    <WrapperComponent classes={{ sectionClass: 'section-lg-space' }} noRowCol>
      <div className="about-us-title text-center">
        <h4 className="text-content">{t('OurBlog')}</h4>
        <h2 className="center">{t('OurLatestBlog')}</h2>
      </div>
      <Row>
        <FeatureBlog
          classes={{ sliderClass: 'col-12', sliderOption: latestBlogSlider }}
        />
      </Row>
    </WrapperComponent>
  );
};

export default OurBlog;
