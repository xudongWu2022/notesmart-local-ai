import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

function Toast({ message, type = 'info', onClose }) {
  return (
    <Transition
      show={!!message}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`rounded-lg shadow-lg p-4 bg-white border ${
          type === 'error' ? 'border-red-200 text-red-700' : 
          type === 'success' ? 'border-gray-200 text-gray-700' : 
          'border-gray-200 text-gray-700'
        }`}>
          <p>{message}</p>
        </div>
      </div>
    </Transition>
  );
}

export default Toast; 