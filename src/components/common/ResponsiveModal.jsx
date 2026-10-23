import { useEffect, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import {
  Modal,
  ModalBody,
  ModalHeader,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
} from 'reactstrap';

const ResponsiveModal = ({
  classes = {},
  extraFunction,
  modal,
  setModal,
  closeButton,
  showCloseButton = true,
  mobileBreakpoint = 768,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);

  const mergeClassNames = (...values) => values.filter(Boolean).join(' ');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const toggle = () =>
    extraFunction ? extraFunction() : setModal((prev) => prev !== prev);

  // Mobile: Offcanvas from bottom
  if (isMobile) {
    return (
      <Offcanvas
        isOpen={modal}
        toggle={toggle}
        direction="bottom"
        className={`bottom-offcanvas ${classes?.offcanvasClass || ''}`}
        style={{
          height: '80dvh',
          maxHeight: '80dvh',
          // minHeight: '80dvh',
          overflowY: 'auto',
          borderRadius: '16px 16px 0 0',
        }}
        backdrop="static"
        keyboard={false}
      >
        <OffcanvasHeader
          toggle={toggle}
          className={`offcanvas-header-fixed ${classes?.modalHeaderClass || ''}`}
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--white, #fefefe)',
            zIndex: 10,
            borderBottom: '1px solid var(--border-color, #eee)',
          }}
          close={
            showCloseButton && (
              <button
                type="button"
                className={mergeClassNames(
                  'offcanvas-close-btn',
                  classes?.closeButtonClass
                )}
                onClick={toggle}
                aria-label={'Close'}
                style={classes?.closeButtonStyle}
              >
                <RiCloseLine size={20} />
              </button>
            )
          }
        >
          {classes?.title}
        </OffcanvasHeader>
        <OffcanvasBody
          className={`responsive-modal-body ${classes?.modalBodyClass || ''}`}
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            maxHeight: 'calc(90vh - 70px)',
          }}
          data-lenis-prevent
        >
          <div
            style={{ flex: 1, overflowY: 'auto' }}
            className="hide-scrollbar"
            data-lenis-prevent
          >
            {props.children}
          </div>
        </OffcanvasBody>
      </Offcanvas>
    );
  }

  // Desktop: Regular Modal
  return (
    <Modal
      className={classes?.modalClass || ''}
      isOpen={modal}
      toggle={toggle}
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="overflow-hidden"
    >
      {classes?.customChildren ? (
        props.children
      ) : (
        <>
          <ModalHeader
            className={classes?.modalHeaderClass || ''}
            toggle={toggle}
            close={showCloseButton ? closeButton : undefined}
          >
            {classes?.title}
            {/* <RiCloseLine
              className={mergeClassNames(
                'modal-close-btn',
                classes?.closeIconClass
              )}
              style={classes?.closeIconStyle}
            /> */}
          </ModalHeader>
          <ModalBody
            className={`responsive-modal-body ${classes?.modalBodyClass || ''}`}
            style={{
              maxHeight: 'calc(90vh - 70px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
            }}
            data-lenis-prevent
          >
            <div
              style={{ flex: 1, overflowY: 'auto' }}
              className="hide-scrollbar"
              data-lenis-prevent
            >
              {props.children}
            </div>
          </ModalBody>
        </>
      )}
    </Modal>
  );
};

export default ResponsiveModal;
