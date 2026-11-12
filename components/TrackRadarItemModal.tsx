'use client';

import React from 'react';
import { RadarItem, ArsenalProject } from '@/lib/types';
import TrackRadarItemForm from './TrackRadarItemForm';

export interface TrackRadarItemModalProps {
  isOpen: boolean;
  item: RadarItem | null;
  allProjects: ArsenalProject[];
  onClose: () => void;
  onConfirmTrack: (
    item: RadarItem,
    confirmedDeadlineIso: string | null,
    projectId: string | null
  ) => void;
}

export default function TrackRadarItemModal({
  isOpen,
  item,
  allProjects,
  onClose,
  onConfirmTrack,
}: TrackRadarItemModalProps) {
  if (!isOpen || !item) return null;

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
      <TrackRadarItemForm
        key={item.id}
        item={item}
        allProjects={allProjects}
        onClose={onClose}
        onConfirmTrack={onConfirmTrack}
      />
    </div>
  );
}
