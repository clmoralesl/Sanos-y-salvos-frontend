import imageCompression from 'browser-image-compression';
import api from './api';

/**
 * Solicita una URL firmada de S3 al backend ms-mascotas
 * @param {string} tipo 'mascota' o 'perfil'
 * @param {string} contentType Tipo MIME del archivo (ej. 'image/jpeg')
 * @returns {Promise<{uploadUrl: string, publicUrl: string, key: string}>}
 */
export const obtenerUrlFirmada = async (tipo, contentType) => {
  const response = await api.get('/mascotas/v1/storage/presigned-url', {
    params: { tipo, contentType }
  });
  return response.data;
};

/**
 * Comprime una imagen en el cliente
 * @param {File} file Archivo original
 * @returns {Promise<File>} Archivo comprimido
 */
export const comprimirImagen = async (file) => {
  const opciones = {
    maxSizeMB: 0.25, // Máximo 250 KB
    maxWidthOrHeight: 1080, // Máximo 1080px (ancho o alto)
    useWebWorker: true,
    fileType: 'image/jpeg' // Convertir a JPEG para ahorrar más espacio
  };

  try {
    const fileComprimido = await imageCompression(file, opciones);
    return fileComprimido;
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    return file; // Si falla, retorna el original
  }
};

/**
 * Comprime y sube una imagen a S3 usando URLs Pre-firmadas
 * @param {File} file Archivo seleccionado por el usuario
 * @param {string} tipo 'mascota' o 'perfil'
 * @returns {Promise<string>} URL pública final de la imagen subida
 */
export const subirImagenAS3 = async (file, tipo = 'mascota') => {
  if (!file) return null;

  try {
    // 1. Comprimir la imagen en el cliente
    const imagenComprimida = await comprimirImagen(file);

    // 2. Obtener la URL pre-firmada desde ms-mascotas
    const { uploadUrl, publicUrl } = await obtenerUrlFirmada(tipo, imagenComprimida.type);

    // 3. Subir el archivo binario comprimido directamente a S3
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': imagenComprimida.type
      },
      body: imagenComprimida
    });

    if (!response.ok) {
      throw new Error(`Fallo al subir a S3: ${response.statusText}`);
    }

    console.log(`Imagen subida exitosamente a S3: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error durante la subida de imagen:', error);
    throw error;
  }
};
