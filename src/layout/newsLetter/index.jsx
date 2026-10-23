import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { Form, Input, InputGroup, ModalHeader } from 'reactstrap';
import CustomModal from '@/components/common/CustomModal';
import Btn from '@/elements/buttons/Btn';
import newsLetterImage from '../../../public/assets/images/newsletter/3.jpg';
import Cookies from 'js-cookie';
import Logo from '../../../public/assets/images/logo/sdl_logo.gif';

const NewsLetterModal = () => {
  const [modal, setModal] = useState(true);
  useEffect(() => {
    const newsLetterModal = Cookies.get('newsLetterModal');
    if (newsLetterModal) {
      setModal(false);
    }
  }, []);
  const extraFunction = () => {
    Cookies.set('newsLetterModal', JSON.stringify(true));
    setModal(false);
  };
  return (
    <>
      <CustomModal
        extraFunction={extraFunction}
        modal={modal}
        setModal={setModal}
        classes={{
          customChildren: true,
          modalClass: 'modal-lg newsletter-modal theme-modal',
        }}
      >
        <ModalHeader className="p-0" toggle={extraFunction} />
        <div className="modal-box">
          <div className="modal-image">
            <Image
              src={newsLetterImage}
              className="img-fluid"
              alt="NewsLetter Image"
              width={400}
              height={361}
            />
          </div>
          <div className="modal-content content-padding">
            <div>
              <Image
                src={Logo}
                className="modal-logo"
                alt="newsletter"
                height={17}
                width={100}
                unoptimized
              />
              <h2>
                15% <span>off</span>
              </h2>
              <h5>Want to make your purchase?</h5>
              <p>
                plus, early access to new arrivals, exclusive sales, & lots
                more?
              </p>
              <Form className="modal-form">
                <InputGroup className="modal-form-box">
                  <Input type="email" placeholder="Your email here" />
                  <Btn
                    className="input-group-text"
                    type="button"
                    title="Submit"
                    onClick={() => setModal(false)}
                  />
                </InputGroup>
              </Form>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default NewsLetterModal;
