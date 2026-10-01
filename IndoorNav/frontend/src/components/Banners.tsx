import type { Point } from "../Floor_Information";

export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="notice" role="status">
      <span>{message}</span>
      <button type="button" onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

export function ConfirmBar({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="notice notice-confirm" role="alertdialog">
      <span>{message}</span>
      <button type="button" onClick={onConfirm}>{confirmLabel}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}

type RoomFormProps = {
  cell: Point;
  value: string;
  canRemove: boolean;
  onChange: (value: string) => void;
  onSave: (override?: string) => void;
  onCancel: () => void;
};

// Inline form instead of window.prompt, which some embedded/preview environments block.
export function RoomForm({ cell, value, canRemove, onChange, onSave, onCancel }: RoomFormProps) {
  return (
    <div className="room-form" role="dialog" aria-label="Tag room number">
      <span>
        Room number for cell ({cell.x}, {cell.y}):
      </span>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="e.g. 401"
      />
      <button type="button" onClick={() => onSave()}>Save</button>
      {canRemove && (
        <button type="button" onClick={() => onSave("")}>Remove tag</button>
      )}
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}