import { RiCloseLine } from 'react-icons/ri';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

const CustomModal = ({
  classes = {},
  extraFunction,
  modal,
  setModal,
  ...props
}) => {
  const mergeClassNames = (...values) => values.filter(Boolean).join(' ');
  const toggle = () =>
    extraFunction ? extraFunction() : setModal((prev) => prev !== prev);

  return (
    <Modal
      className={classes?.modalClass || ''}
      isOpen={modal}
      toggle={toggle}
      centered
    >
      {classes?.customChildren ? (
        props.children
      ) : (
        <>
          <ModalHeader
            className={classes?.modalHeaderClass || ''}
            toggle={toggle}
          >
            {classes?.title}
            <RiCloseLine
              className={mergeClassNames(
                'modal-close-btn',
                classes?.closeIconClass
              )}
              style={classes?.closeIconStyle}
            />
          </ModalHeader>
          <ModalBody 
            className={`address-modal-body ${classes?.modalBodyClass || ''}`}
            style={{ 
              maxHeight: 'calc(90vh - 100px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {props.children}
            </div>
          </ModalBody>
        </>
      )}
    </Modal>
  );
};

export default CustomModal;
