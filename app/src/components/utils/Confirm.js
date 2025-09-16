import React from 'react';
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const modalId = '__modal_id_confirm';
function removeElement()
{
  const element = document.getElementById(modalId);
  element && element.remove();
}

function ConfirmModal(props) {
  const [show, setShow] = useState(true);

  function close() {
    setShow(false);
    removeElement();
  }

  function yes() {
    props.callback();
    close();
  }

  return (<div>
        <Modal show={show} onHide={close}>
        <Modal.Dialog>
          <Modal.Header closeButton>
            {
              props.title && <Modal.Title><span className="confirm_title">{props.title}</span></Modal.Title>
            }
            {
              !props.title && <Modal.Title><span className="confirm_title">Are you sure?</span></Modal.Title>
            }
          </Modal.Header>

          <Modal.Body>
            <p className="confirm_body">{props.body}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={yes} variant="primary">{props.buttonText || 'Continue'}</Button>
            <Button onClick={close} variant="secondary">Cancel</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </div>
  );
}

function Confirm(props) {
  removeElement();

  const container = document.createElement('div');
  container.setAttribute('id', modalId);
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<ConfirmModal {...props} />);  
}

export default Confirm;
