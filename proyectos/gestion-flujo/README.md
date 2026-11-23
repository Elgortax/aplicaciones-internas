# Gestión de Flujo

**Creador de la aplicación original y de su demo pública — Alexis Rodríguez Riquelme**, Analista TI en Grupo Tierras de Chile.

## Finalidad

Relaciona compras, aprobaciones, presupuesto de obras y movimientos de caja para saber qué se comprometió y qué se pagó.

## Recorrido de prueba

1. Crea una orden de compra con proveedor, centro de costo, monto neto, cantidad de cotizaciones y criterio de selección.
2. Envíala a revisión y cambia el rol de demostración a Jefatura o Finanzas. Aprueba u observa la orden según el monto.
3. Registra un pago total o parcial y sigue su efecto en el saldo de la orden, el presupuesto comprometido y la caja del día.

## Resultado

Una orden trazable desde la solicitud hasta la salida de dinero, con efecto visible en caja y presupuesto.

## Modo local

Recorrido reconstruido con el modelo original de totales diarios. Los umbrales, proveedores y montos son ficticios. Los roles se alternan localmente. La emisión bancaria, el correo y la sincronización quedan fuera de la demo.

Extrae todos los archivos del ZIP y abre **index.html** en Chrome o Edge. Los cambios se guardan en el navegador que uses. Los datos de partida son ficticios.
