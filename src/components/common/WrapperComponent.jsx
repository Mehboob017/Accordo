import { Col, Row } from 'reactstrap';

const WrapperComponent = ({
  classes = {},
  noRowCol = false,
  colProps = {},
  customCol = false,
  noSectionTopSpace = false,
  ...props
}) => {
  return (
    <section
      className={
        classes?.sectionClass
          ? `${noSectionTopSpace ? '' : 'section-t-space '}${classes?.sectionClass}`
          : `${noSectionTopSpace ? '' : 'section-t-space'}`
      }
      {...props}
    >
      <div
        className={`container-fluid-lg ${classes?.fluidClass ? classes.fluidClass : ''}`}
      >
        {noRowCol ? (
          props.children
        ) : (
          <Row className={`${classes.row ? classes.row : ''}`}>
            {customCol ? (
              <>{props.children}</>
            ) : (
              <Col className={classes.col ? classes.col : ''} {...colProps}>
                {props.children}
              </Col>
            )}
          </Row>
        )}
      </div>
    </section>
  );
};

export default WrapperComponent;
