import React, { useState, useEffect } from 'react';

const GlobalErrorView = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (e) => {
      setHasError(true);
    };

    window.addEventListener('global-api-error', handleError);

    return () => {
      window.removeEventListener('global-api-error', handleError);
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, hubo un problema al comunicarse con el servidor. 
            Es posible que el servicio esté temporalmente inactivo.
          </p>
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition duration-200"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default GlobalErrorView;
