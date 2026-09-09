import React from 'react';
import { Modal } from '../ui/Modal';
import { Order } from '../../services/mockData';
import { InteractiveInvoice, generateRoviaPrintableInvoice } from './InteractiveInvoice';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ROVIA Official Tax Invoice #${order.orderNumber}`}
      maxWidth="xl"
    >
      <div className="py-2">
        <InteractiveInvoice
          order={order}
          onPrint={() => generateRoviaPrintableInvoice(order)}
          showActions={true}
        />
      </div>
    </Modal>
  );
};
