import winston from "winston";

import config from "@/config";

// winston permite una gestión flexible de los logs, enviándolos a diferentes destinos
// (como la consola, archivos, bases de datos, etc.) y formateándolos de diversas maneras.

// Desestructura los formatos de Winston que se utilizarán para dar formato a los logs.
const {
  combine,                                                                               // Combina múltiples formatos de log.
  timestamp,                                                                             // Agrega una marca de tiempo a cada log.
  json,                                                                                  // Formatea el log como JSON.
  errors,                                                                                // Incluye el stack trace de los errores.
  align,                                                                                 // Alinea el mensaje del log.
  printf,                                                                                // Permite un formato de log personalizado usando una función.
  colorize                                                                               // Agrega colores a los niveles de log en la consola.
} = winston.format;

const transports: winston.transport[] = [];                                              // Inicializa un array para almacenar los transportes de Winston (destinos de los logs).

// Configura los transportes de log según el entorno de la aplicación.
if (config.NODE_ENV !== 'production') {                                                  // Si el entorno NO es de producción...
  transports.push(                                                                       // Agrega un transporte de consola.
    new winston.transports.Console({
      format: combine(                                                                   // Combina los siguientes formatos para la salida en consola.
        colorize({ all: true }),                                                             // Aplica colores a todo el log (nivel, mensaje, etc.).
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),                                      // Agrega una marca de tiempo con el formato especificado.
        align(),                                                                             // Alinea el mensaje del log para una mejor legibilidad.
        printf(({ timestamp, level, message, ...meta }) => {                                 // Define un formato personalizado para el mensaje del log. 
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta)}` : '';       // Si hay metadatos adicionales(meta), los convierte a una cadena JSON y los agrega.
          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;              // Retorna el mensaje formateado: [marca de tiempo] [NIVEL_MAYÚSCULAS]: mensaje [metadatos].
        })
      )
    })
  )
}

// Crea una instancia del logger de Winston.
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',                                                         // Establece el nivel mínimo de log (por ejemplo, 'info', 'warn', 'error'), tomado de la configuración o 'info' por defecto.
  format: combine(                                                                           // Combina los siguientes formatos para los logs generales (no solo consola).
    timestamp(),                                                                             // Agrega una marca de tiempo.
    errors({ stack: true }),                                                                 // Incluye el stack trace completo para los errores.
    json()                                                                                   // Formatea los logs como objetos JSON.
  ),
  transports,                                                                                // Asigna los transportes configurados (en este caso, la consola para desarrollo).
  silent: config.NODE_ENV === 'test'                                                         // Silencia el logger si el entorno es de prueba.
});

export { logger }