'use client';

import React from 'react';
import { Opportunity } from '@/lib/types';
import EditOpportunityForm from './EditOpportunityForm';

export interface EditOpportunityModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (updated: Opportunity) => void;
}

export default function EditOpportunityModal({
  isOpen,
  opportunity,
  onClose,
  onSave,
}: EditOpportunityModalProps) {
  if (!isOpen || !opportunity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/24"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <EditOpportunityForm
        key={opportunity.id}
        opportunity={opportunity}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
