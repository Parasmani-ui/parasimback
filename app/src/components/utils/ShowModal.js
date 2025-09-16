import React from 'react';
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const modalId = '__modal_id_dialog';
function removeElement() {
  const element = document.getElementById(modalId);
  element && element.remove();
}

function ModalDialog(props) {
  const [show, setShow] = useState(true);

  function close() {
    setShow(false);
    removeElement();
  }

  async function buttonClicked(callback, event) {
    event.preventDefault();
    if (await callback(event.target)) {
      close();
    }
  }

  return (<div>
    <Modal show={show} onHide={close} centered aria-labelledby="contained-modal-title-vcenter">
      <Modal.Dialog>
        <Modal.Header closeButton>
          {
            props.title && <Modal.Title><span className="dialog_title">{props.title}</span></Modal.Title>
          }
        </Modal.Header>

        <Modal.Body>
          <div className="dialog_body">{props.body}</div>
        </Modal.Body>

        <Modal.Footer>
          {props.buttons && props.buttons.map((button, idx) => (
            <Button key={idx} onClick={(event) => buttonClicked(button.onClick, event)}>{button.text}</Button>
          ))}
          <Button onClick={close} variant="secondary">{props.closeButtonText || 'Cancel'}</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal>
  </div>
  );
}

function ShowModal(props) {
  removeElement();

  const container = document.createElement('div');
  container.setAttribute('id', modalId);
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ModalDialog {...props} />);
}

export default ShowModal;
