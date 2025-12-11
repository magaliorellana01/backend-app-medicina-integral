
// Función helper para crear regex que ignore tildes y case
const createAccentInsensitiveRegex = (text) => {
  const normalized = normalizeText(text);
  // Escapar caracteres especiales de regex
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Crear regex que coincida con variantes con y sin tildes desde el inicio
  const regexPattern = escaped
      .replace(/a/g, '[aáàäâ]')
      .replace(/e/g, '[eéèëê]')
      .replace(/i/g, '[iíìïî]')
      .replace(/o/g, '[oóòöô]')
      .replace(/u/g, '[uúùüû]')
      .replace(/n/g, '[nñ]');
  // Agregar ^ al inicio para que coincida desde el principio del texto
  return `^${regexPattern}`;
};

// Función helper para normalizar texto removiendo tildes
const normalizeText = (text) => {
  return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
};

// Función helper para construir el filtro de búsqueda de socios
const buildSocioSearchFilter = (input) => {
  const inputTrimmed = String(input).trim();
  const minLengthForNameSearch = 4; // Mínimo de caracteres para buscar por nombres/apellidos

  // Construir el filtro base con DNI y teléfono
  const socioFilterConditions = [
    { dni: inputTrimmed },
    { telefono: inputTrimmed }
  ];

  // Solo agregar búsqueda por nombres/apellidos si el input tiene al menos 4 caracteres
  if (inputTrimmed.length >= minLengthForNameSearch) {
    // Verificar si el input contiene un espacio (nombre completo: nombre + apellido)
    const parts = inputTrimmed.split(/\s+/).filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      // Búsqueda de nombre completo: nombre Y apellido
      const nombrePart = parts[0];
      const apellidoPart = parts.slice(1).join(' '); // En caso de apellidos compuestos
      
      if (nombrePart.length >= minLengthForNameSearch && apellidoPart.length >= minLengthForNameSearch) {
        const nombreRegex = createAccentInsensitiveRegex(nombrePart);
        const apellidoRegex = createAccentInsensitiveRegex(apellidoPart);
        // Buscar donde nombre Y apellido coincidan
        socioFilterConditions.push({
          $and: [
            { nombres: { $regex: nombreRegex, $options: 'i' } },
            { apellidos: { $regex: apellidoRegex, $options: 'i' } }
          ]
        });
      }
      
      // También buscar cada parte individualmente
      parts.forEach(part => {
        if (part.length >= minLengthForNameSearch) {
          const partRegex = createAccentInsensitiveRegex(part);
          socioFilterConditions.push(
            { nombres: { $regex: partRegex, $options: 'i' } },
            { apellidos: { $regex: partRegex, $options: 'i' } }
          );
        }
      });
    } else {
      // Si no hay espacio, buscar por nombres o apellidos individualmente
      const nombresRegex = createAccentInsensitiveRegex(inputTrimmed);
      const apellidosRegex = createAccentInsensitiveRegex(inputTrimmed);
      socioFilterConditions.push(
        { nombres: { $regex: nombresRegex, $options: 'i' } },
        { apellidos: { $regex: apellidosRegex, $options: 'i' } }
      );
    }
  }

  return {
    $or: socioFilterConditions
  };
};

module.exports = {
  createAccentInsensitiveRegex,
  normalizeText,
  buildSocioSearchFilter
};