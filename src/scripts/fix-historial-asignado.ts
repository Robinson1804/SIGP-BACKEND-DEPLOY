/**
 * Script para corregir registros de historial que tienen IDs de usuario
 * en lugar de nombres para el campo asignadoA
 *
 * Ejecutar con: npx ts-node -r tsconfig-paths/register src/scripts/fix-historial-asignado.ts
 * O desde el backend: npm run script:fix-historial
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Iniciando corrección de historial de asignados...\n');

  try {
    // Buscar todos los registros de historial con campo asignadoA que tienen IDs numéricos
    const registros = await dataSource.query(`
      SELECT
        hc.id,
        hc.valor_anterior,
        hc.valor_nuevo
      FROM agile.historial_cambios hc
      WHERE hc.campo_modificado = 'asignadoA'
    `);

    console.log(`Encontrados ${registros.length} registros de asignadoA en historial\n`);

    let actualizados = 0;
    let errores = 0;

    for (const registro of registros) {
      try {
        let valorAnteriorNuevo = registro.valor_anterior;
        let valorNuevoNuevo = registro.valor_nuevo;
        let necesitaActualizar = false;

        // Procesar valor_anterior si es un ID numérico
        if (registro.valor_anterior) {
          const idAnterior = extractNumericId(registro.valor_anterior);
          if (idAnterior) {
            const usuario = await dataSource.query(
              `SELECT nombre, apellido FROM public.usuarios WHERE id = $1`,
              [idAnterior]
            );
            if (usuario.length > 0) {
              valorAnteriorNuevo = JSON.stringify(`${usuario[0].nombre} ${usuario[0].apellido}`.trim());
              necesitaActualizar = true;
            }
          }
        }

        // Procesar valor_nuevo si es un ID numérico
        if (registro.valor_nuevo) {
          const idNuevo = extractNumericId(registro.valor_nuevo);
          if (idNuevo) {
            const usuario = await dataSource.query(
              `SELECT nombre, apellido FROM public.usuarios WHERE id = $1`,
              [idNuevo]
            );
            if (usuario.length > 0) {
              valorNuevoNuevo = JSON.stringify(`${usuario[0].nombre} ${usuario[0].apellido}`.trim());
              necesitaActualizar = true;
            }
          }
        }

        // Actualizar el registro si es necesario
        if (necesitaActualizar) {
          await dataSource.query(
            `UPDATE agile.historial_cambios
             SET valor_anterior = $1, valor_nuevo = $2
             WHERE id = $3`,
            [valorAnteriorNuevo, valorNuevoNuevo, registro.id]
          );

          console.log(`✓ Registro ${registro.id} actualizado:`);
          console.log(`  Anterior: ${registro.valor_anterior} → ${valorAnteriorNuevo}`);
          console.log(`  Nuevo: ${registro.valor_nuevo} → ${valorNuevoNuevo}\n`);
          actualizados++;
        }
      } catch (error) {
        console.error(`✗ Error procesando registro ${registro.id}:`, error.message);
        errores++;
      }
    }

    console.log('\n========================================');
    console.log(`Proceso completado:`);
    console.log(`  - Registros actualizados: ${actualizados}`);
    console.log(`  - Errores: ${errores}`);
    console.log(`  - Sin cambios: ${registros.length - actualizados - errores}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await app.close();
  }
}

/**
 * Extrae un ID numérico de un valor JSON almacenado
 * Puede venir como: "13", 13, "null", null
 */
function extractNumericId(value: string): number | null {
  if (!value || value === 'null' || value === '"null"') {
    return null;
  }

  // Remover comillas si existen
  const cleanValue = value.replace(/"/g, '').trim();

  // Verificar si es un número
  const num = parseInt(cleanValue, 10);
  if (!isNaN(num) && num > 0) {
    return num;
  }

  return null;
}

bootstrap();
