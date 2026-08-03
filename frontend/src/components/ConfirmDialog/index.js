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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          ></div>

          {/* Modal Box */}
          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-950 shadow-[0_30px_80px_rgba(2,6,23,0.6)]">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4 pr-2">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.32em] text-sky-400/80">
                  Confirmation
                </p>
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="rounded-xl border border-slate-700 px-2 py-1 text-slate-400 transition hover:border-slate-500 hover:text-white"
              >
                <X width={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 text-sm text-slate-300">
              {message}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
              
              <button
                id={id}
                onClick={handleClose}
                className="rounded-2xl leading-none border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
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