import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="bg-white px-6 py-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900 leading-none">{title}</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body 
  );
};

export default Modal;
