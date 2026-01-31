import React from "react";
import Modal from "react-modal";
import { useQuery } from "@tanstack/react-query";
import { fetchOccupants } from "../../../hooks/property/useProperty.js"; // adjust the import path as needed

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

const OccupantsModal = ({ isOpen, onClose, occupantIds }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["occupants", occupantIds],
    queryFn: () => fetchOccupants(occupantIds),
    enabled: isOpen && occupantIds.length > 0,
  });
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Occupants List"
      className="modal-content" // Use your styles or CSS modules
      overlayClassName="modal-overlay"
    >
      <h2 className="text-xl font-semibold mb-4">Occupants</h2>

      {isLoading && <p>Loading occupants...</p>}
      {error && <p className="text-red-600">Error loading occupants: {error.message}</p>}
      {data && data.length === 0 && <p>No occupants found</p>}

      {data && data.length > 0 && (
        <ul className="space-y-2 max-h-72 overflow-auto">
          {data.map(({ id, name, userType }) => (
            <li key={id} className="border rounded p-2 bg-gray-50 flex justify-between">
              <span>{name}</span>
              <span className="italic text-sm text-gray-600">{userType}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onClose}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Close
      </button>
    </Modal>
  );
};

export default OccupantsModal;
