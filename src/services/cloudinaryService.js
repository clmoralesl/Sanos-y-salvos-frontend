import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tu_cloud_name';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tu_upload_preset';

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
    return file;
  }
};

export const subirImagenAS3 = async (file) => {
  if (!file) return null;

  try {

    const imagenComprimida = await comprimirImagen(file);

    const formData = new FormData();
    formData.append('file', imagenComprimida);
    formData.append('upload_preset', UPLOAD_PRESET);

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
