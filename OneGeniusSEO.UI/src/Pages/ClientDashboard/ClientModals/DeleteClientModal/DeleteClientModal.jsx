import { Modal, Button } from "react-bootstrap";
import { IoIosWarning } from "react-icons/io";

function DeleteClientModal({ show, onHide, projectToDelete, onDelete }) {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header className="border-0 px-4 pt-4 pb-2 d-flex align-items-center">
        <IoIosWarning className="p-1 fs-2 text-danger me-3 border border-secondary rounded-circle" />
        <Modal.Title className="fs-5 fw-semibold text-dark">
          Remove Client?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pt-0 pb-0 text-secondary">
        <div className="d-flex align-items-center mb-2 ps-5">
          <span>Are you sure you want to remove the following clients?</span>
        </div>
        <ul className="list-unstyled mb-0">
          <li className="p-3 bg-light rounded mb-2 d-flex align-items-center gap-2 w-75 ms-5">
            <div className="w-2 h-2 rounded-circle bg-secondary"></div>
            {projectToDelete?.clientName}
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer className="border-0 px-4 pb-4 pt-0 justify-content-start">
        <Button
          variant="danger"
          onClick={() => onDelete(projectToDelete)}
          className="px-4 py-2 fw-normal rounded fs-6"
        >
          Remove
        </Button>
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className="px-4 py-2 fw-normal ms-2 rounded fs-6"
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteClientModal;
