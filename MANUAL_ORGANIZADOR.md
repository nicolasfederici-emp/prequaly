# Manual de Organización - Plataforma de Torneos M15

Bienvenido al sistema de gestión de torneos. Este manual explica paso a paso cómo administrar la información de la página web, desde la carga de jugadores hasta la actualización en tiempo real de los cuadros.

---

## 1. Acceso al Panel de Control

Para comenzar a trabajar, debes ingresar al panel de administración:
1. En tu navegador, ingresa a la página web y ve a la sección **/admin** (ejemplo: `tu-sitio.com/admin`).
2. Se te pedirá una contraseña. La contraseña por defecto es **`admin123`**.
3. Una vez ingreses, verás el panel con múltiples pestañas de gestión en la parte superior.

---

## 2. Gestión de Jugadores

En la pestaña **Jugadores** administrarás la base de datos de inscriptos.

- **Añadir un Nuevo Jugador:** Haz clic en el botón amarillo "Nuevo Jugador". Deberás completar su nombre, torneo en el que participa (ej: PreQualy), edad, mano hábil y club.
- **Estado de Pago:** Puedes marcar la casilla de "Inscripción pagada" para llevar un control financiero. Aparecerá en color verde si está pagado, o rojo si está pendiente.
- **Foto:** Puedes subir una foto directamente desde tu computadora (botón "Subir Archivo") o pegar un link de internet.

---

## 3. Armado Automático de Cuadros (Sorteo)

El sistema cuenta con un algoritmo avanzado para armar las llaves (Cuadros) de forma automática siguiendo las reglas estándar de la ITF/ATP.

Para armar el cuadro (por ejemplo, el de la PreQualy de 48 jugadores):
1. En la pestaña **Jugadores**, haz clic en el botón gris **"Armar Cuadro Auto"** (arriba a la derecha).
2. Selecciona el torneo (Ej: PreQualy).
3. Verás la lista completa de inscriptos. Al lado de los mejores jugadores, ingresa su número de **Preclasificación (Seed #)**. Por ejemplo, al mejor jugador ponle el `1`, al segundo el `2`, y así sucesivamente (hasta 16 para la PreQualy).
4. **NO le pongas número a los demás**. A los jugadores sin número (unseeded), el sistema los sorteará al azar.
5. Haz clic en **"¡GENERAR CUADRO AHORA!"**.

**¿Qué hará el sistema?**
- Colocará al Seed 1 en el primer partido de la Ronda 2 (extremo superior).
- Colocará al Seed 2 en el último partido de la Ronda 2 (extremo inferior).
- Asignará los espacios vacíos (Byes / pases directos) de la Ronda 1 de forma inteligente.
- Sorteará a los jugadores no preclasificados para que jueguen la Ronda 1.
- *Nota: Si ya tenías un cuadro armado, este proceso lo borrará y armará uno nuevo.*

---

## 4. Gestión de Partidos (Resultados y Avance Automático)

En la pestaña **Partidos** podrás administrar el día a día del torneo.

- Verás columnas con las Rondas (Ronda de 48, Ronda de 32, Octavos, etc.).
- Si utilizaste el "Armado Automático", los partidos ya tendrán a los jugadores asignados.
- **Cargar un Resultado:** Haz clic en el botón "Cargar" del partido que acaba de finalizar.
  - Selecciona **Estado del Partido:** "Finalizado".
  - Ingresa los games en las casillas correspondientes a cada Set.
  - **Importante:** Selecciona quién fue el Ganador en el menú desplegable.
  - Haz clic en Guardar.
  
**Avance Automático:** ¡No tienes que armar la siguiente ronda a mano! Cuando marcas un partido como "Finalizado" y seleccionas al ganador, **el sistema enviará automáticamente a ese jugador al partido que le corresponde en la siguiente ronda**.

**Edición Manual de Partidos:**
Si hubo un error, un retiro de último momento o simplemente quieres saltarte el armado automático, puedes editar cualquier partido en cualquier momento para cambiar a los jugadores (Seleccionando `Jugador 1` y `Jugador 2` manualmente).

---

## 5. Noticias y Galería de Fotos

Para mantener informados a los participantes y al público:

- **Noticias:** Ve a la pestaña **Noticias**. Haz clic en "Nueva Noticia". Escribe un título, el contenido y opcionalmente sube una imagen de portada. Se mostrará en la página principal.
- **Galería:** Ve a la pestaña **Galería**. Haz clic en "Subir Nueva Foto". Puedes asignar la foto a un torneo en particular (ej: fotos exclusivas de la Qualy) y ponerle un pie de foto (ej: "Entrega de trofeos").

---

## 6. Configuración de Textos de la Web

En la pestaña **Configuración**, podrás editar todo el contenido escrito que aparece en la página pública sin depender de un programador:
- Títulos principales y subtítulos de la Portada (Hero Section).
- Fechas y sedes de cada una de las fases (PreQualy, Qualy, M15).
- Información de contacto de los organizadores.
- Textos detallados para la página de Reglamentos.

Cualquier cambio que realices aquí y le des a "Guardar", se reflejará instantáneamente en la web para todos los usuarios.
