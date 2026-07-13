import imageCompression from 'browser-image-compression';

// Puedes configurar estas variables en tu archivo .env local, o reemplazarlas directamente aquí para desarrollo rápido
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tu_cloud_name';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tu_upload_preset';

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
 * Comprime y sube una imagen directamente a Cloudinary (Unsigned Upload)
 * @param {File} file Archivo seleccionado por el usuario
 * @returns {Promise<string>} URL segura final de la imagen subida en Cloudinary
 */
export const subirImagenAS3 = async (file) => { // Mantenemos el nombre de la función exportada para no romper compatibilidades
  if (!file) return null;

  try {
    // 1. Comprimir la imagen en el cliente
    const imagenComprimida = await comprimirImagen(file);

    // 2. Preparar el formulario de subida (FormData) para Cloudinary
    const formData = new FormData();
    formData.append('file', imagenComprimida);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 3. Subir el archivo binario a la API de Cloudinary
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    console.log(`Subiendo imagen a Cloudinary en: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Fallo al subir a Cloudinary: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Imagen subida exitosamente a Cloudinary: ${data.secure_url}`);
    return data.secure_url;
  } catch (error) {
    console.error('Error durante la subida a Cloudinary:', error);
    throw error;
  }
};
