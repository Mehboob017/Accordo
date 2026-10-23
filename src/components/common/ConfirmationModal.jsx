import { RiQuestionLine } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';
import CustomModal from './CustomModal';

const ConfirmationModal = ({
  modal,
  setModal,
  isLoading,
  confirmFunction,
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  cancelLabel = 'No',
  confirmLabel = 'Yes',
}) => {
  return (
    <CustomModal
      modal={modal}
      setModal={setModal}
      classes={{
        modalClass: 'theme-modal delete-modal',
        modalHeaderClass: 'p-0',
      }}
    >
      <RiQuestionLine className="icon-box wo-bg" />
      <h5 className="modal-title">{title}</h5>
      <p>{message}</p>
      <div className="button-box">
        <Btn
          title={cancelLabel}
          className="btn btn-md btn-theme-outline fw-bold"
          onClick={() => setModal(false)}
          disabled={isLoading}
        />
        <Btn
          title={confirmLabel}
          className="theme-bg-color btn-md fw-bold text-white"
          onClick={confirmFunction}
          disabled={isLoading}
        />
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;
