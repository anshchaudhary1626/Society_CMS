import React from 'react';
import { BiErrorCircle } from 'react-icons/bi';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm transition-all duration-300">
      <BiErrorCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
      <span className="text-sm font-medium leading-5">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1.5 text-red-500 hover:bg-red-100 transition-colors focus:outline-none"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
