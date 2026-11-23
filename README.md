# Terreno Ops

**Siete demos de software para la operación inmobiliaria y la coordinación de oficina.**  
Portafolio de Alexis Rodríguez Riquelme · Ingeniería en Informática.

![Terreno Ops · Operación inmobiliaria](portada.png)

## Probar en tu computador

1. [Descarga el proyecto en ZIP](https://github.com/Elgortax/terreno-ops/archive/refs/heads/main.zip).
2. Extrae la carpeta completa.
3. Abre **index.html** con Chrome, Edge, Firefox o Safari actual.

Las aplicaciones comparten un menú. Puedes probarlas en cualquier orden. Los ejemplos son ficticios. El navegador ejecuta el código localmente y, cuando permite almacenamiento local, recuerda los cambios en ese equipo. En navegación privada o con almacenamiento bloqueado pueden durar solo una sesión.

## Qué puedes hacer

| Aplicación | Prueba este recorrido |
| --- | --- |
| Gestión de cartera | Busca el lote A-04, abre su ficha y registra un abono. El saldo individual y el total abonado se actualizan juntos. |
| Evaluador de loteos | Cambia el precio por lote y el presupuesto de obras. Compara margen, utilidad y unidades de equilibrio con el escenario inicial. |
| Nexo Tierra | Selecciona dos predios y compara su precio por hectárea, superficie, región y condiciones de acceso. |
| Estado de proyectos | Actualiza el último hito completado y deja una nota. La ficha muestra el avance y el próximo hito. |
| Tablero de tareas | Crea una tarea con un equipo y una fecha. Iníciala, complétala y vuelve a abrirla. |
| Sala de reuniones | Reserva un bloque de 30 minutos. Intenta reservarlo de nuevo para comprobar el control de superposición, luego libera la sala. |
| Gestión de oficina | Presta un equipo a un área y registra su devolución. Consulta disponibilidad y custodia en el inventario. |

## Sobre el proyecto

Desarrollé estas demostraciones a partir de problemas que abordo en mi trabajo en el sector inmobiliario. Esta edición está pensada para que cualquier persona pueda recorrer los flujos, cambiar un dato y ver su efecto. Los nombres de predios, importes, equipos y operaciones son de ejemplo.

### Implementación

HTML, CSS y JavaScript sin paquetes de ejecución. **modelo.js** contiene las reglas de abonos, reservas y evaluación, junto con los datos de muestra. **interfaz.js** conecta esas reglas con formularios, indicadores, filtros y navegación por teclado. **estilos.css** adapta la interfaz a escritorio y móvil. La aplicación no usa API, base de datos, cuentas ni servicios de analítica.

En el evaluador, el resultado corresponde a las ventas proyectadas menos adquisición, obras y comercialización. El margen se expresa sobre ventas. El punto de equilibrio redondea hacia arriba los costos fijos divididos por el ingreso unitario después de comercialización. Las cifras están en pesos chilenos y el ejercicio excluye impuestos y financiamiento.

[Perfil profesional en LinkedIn](https://www.linkedin.com/in/alexis-rodriguez-riquelme-565739251/)

