import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificaciones, marcarNotificacionLeida } from '../services/notificacionService';

const NotificationBell = ({ dbProfile }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotificaciones = async () => {
    if (dbProfile && dbProfile.idUsuario) {
      try {
        const data = await getNotificaciones(dbProfile.idUsuario, false);
        setNotificaciones(data);
      } catch (error) {
        console.error("Error fetching notificaciones:", error);
      }
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [dbProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      try {
        await marcarNotificacionLeida(notificacion.idNotificacion);
        setNotificaciones(prev => 
          prev.map(n => n.idNotificacion === notificacion.idNotificacion ? { ...n, leida: true } : n)
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    setIsOpen(false);
    if (notificacion.urlRedireccion) {
      navigate(notificacion.urlRedireccion);
    }
  };

  if (!dbProfile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-blue-600 transition focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-96">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 font-semibold">{unreadCount} no leídas</span>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notificaciones.map(notificacion => (
                  <li 
                    key={notificacion.idNotificacion}
                    onClick={() => handleNotificationClick(notificacion)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition ${!notificacion.leida ? 'bg-blue-50/50' : 'bg-white'}`}
                  >
                    <div className="flex items-start">
                      {!notificacion.leida && (
                        <div className="w-2 h-2 mt-1.5 mr-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                      <div className={notificacion.leida ? 'ml-5' : ''}>
                        <p className={`text-sm ${!notificacion.leida ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notificacion.titulo}
                        </p>
                        <p className={`text-xs mt-0.5 ${!notificacion.leida ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notificacion.mensaje}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                          {new Date(notificacion.fechaCreacion).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
