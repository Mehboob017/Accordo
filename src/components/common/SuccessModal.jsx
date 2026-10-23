import { RiCheckboxCircleLine } from 'react-icons/ri';
import { useTranslation } from '@/utils/translations';
import Btn from '@/elements/buttons/Btn';
import CustomModal from './CustomModal';

const SuccessModal = ({ modal, setModal, title, message, onClose }) => {
  const { t } = useTranslation('common');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setModal(false);
  };

  return (
    <CustomModal
      modal={modal}
      setModal={setModal}
      classes={{
        modalClass: 'theme-modal success-modal',
        modalHeaderClass: 'p-0',
      }}
    >
      <RiCheckboxCircleLine className="icon-box wo-bg success-icon" />
      {title && <h5 className="modal-title">{title}</h5>}
      <p>{message || t('Action completed successfully')}</p>
      <div className="button-box">
        <Btn
          title="Awesome"
          className="btn btn-md theme-bg-color fw-bold text-light"
          onClick={handleClose}
        />
      </div>
    </CustomModal>
  );
};

export default SuccessModal;

