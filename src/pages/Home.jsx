import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Ayúdanos a traerlos <span className="text-blue-600">Sanos y Salvos</span>
        </h2>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          La plataforma colaborativa para reportar mascotas perdidas y avistamientos en tiempo real usando tecnología geoespacial.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/reportar')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition"
          >
            Reportar Mascota Perdida
          </button>
          <button 
            onClick={() => navigate('/buscar')}
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Ver Casos Activos
          </button>
        </div>
      </div>

      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="h-48 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">
              Foto Mascota
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">Mascota #{i}</h3>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Perdido</span>
              </div>
              <p className="mt-2 text-gray-600 text-sm">Visto por última vez en Comuna Ejemplo...</p>
              <button className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline">Ver detalles &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
