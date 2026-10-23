import { RiErrorWarningLine } from 'react-icons/ri';
import { useTranslation } from '@/utils/translations';
import Btn from '@/elements/buttons/Btn';
import CustomModal from './CustomModal';

const ErrorModal = ({ modal, setModal, title, message, onClose }) => {
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
      <RiErrorWarningLine
        className="icon-box wo-bg"
        style={{
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          color: '#dc3545',
        }}
      />
      <h5 className="modal-title">{title || t('Error')}</h5>
      <p>{message || t('Something went wrong')}</p>
      <div className="button-box">
        <Btn
          title={t('Okay')}
          className="btn btn-md theme-bg-color fw-bold text-light"
          onClick={handleClose}
        />
      </div>
    </CustomModal>
  );
};

export default ErrorModal;

