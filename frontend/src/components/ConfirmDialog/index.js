import React, { useState } from "react";
import { X } from 'lucide-react';
function ConfirmDialog({
  buttonName,
  id,
  onConfirm,
  title,
  message,
  disabled,
  buttonClassName = "",
}) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleConfirm = (event) => {
    onConfirm(event);
    setShow(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        disabled={disabled}
        onClick={handleShow}
        className={
          buttonClassName ||
          "rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
        }
      >
        {buttonName}
      </button>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          
          {/* Overlay */}
          <div
            className="app-modal-overlay absolute inset-0 backdrop-blur-sm"
            onClick={handleClose}
          ></div>

          {/* Modal Box */}
          <div className="app-modal relative z-10 w-full max-w-md rounded-[28px] border">
            
            {/* Header */}
            <div className="app-divider flex items-start justify-between gap-4 border-b px-6 py-4 pr-2">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.32em] text-sky-400/80">
                  Confirmation
                </p>
                <h2 className="app-heading text-lg font-semibold">
                  {title}
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="app-btn-ghost rounded-xl border px-2 py-1 transition"
              >
                <X width={15} />
              </button>
            </div>

            {/* Body */}
            <div className="app-muted px-6 py-5 text-sm">
              {message}
            </div>

            {/* Footer */}
            <div className="app-divider flex justify-end gap-3 border-t px-6 py-4">
              
              <button
                id={id}
                onClick={handleClose}
                className="app-btn-ghost rounded-2xl leading-none border px-5 py-3 text-sm transition"
              >
                Cancel
              </button>

              <button
                id={id}
                onClick={handleConfirm}
                className="rounded-2xl leading-none bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Confirm
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfirmDialog;
