import { ValueTransformer } from 'typeorm';

/**
 * Transformador para columnas de tipo DATE en PostgreSQL.
 *
 * Problema que resuelve:
 * - PostgreSQL guarda "2025-01-15" como tipo DATE (sin hora)
 * - TypeORM lo convierte a JavaScript Date -> "2025-01-15T00:00:00.000Z" (UTC)
 * - Al mostrar en zona horaria local (ej: Perú UTC-5), se muestra el día anterior
 *
 * Solución:
 * - Al leer de la BD: convertir Date a string "YYYY-MM-DD"
 * - Al escribir a la BD: aceptar string o Date y convertir a Date
 */
export const DateOnlyTransformer: ValueTransformer = {
  // De la base de datos al código (Date -> string)
  from(value: Date | string | null): string | null {
    if (!value) return null;

    if (typeof value === 'string') {
      // Si ya es string, extraer solo YYYY-MM-DD
      return value.includes('T') ? value.split('T')[0] : value.substring(0, 10);
    }

    if (value instanceof Date) {
      // Convertir Date a string YYYY-MM-DD usando valores locales del Date
      // Esto evita el problema de timezone
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  },

  // Del código a la base de datos (string -> Date o mantener string)
  to(value: string | Date | null): Date | string | null {
    if (!value) return null;

    if (typeof value === 'string') {
      // PostgreSQL acepta strings en formato YYYY-MM-DD directamente
      return value;
    }

    return value;
  },
};
