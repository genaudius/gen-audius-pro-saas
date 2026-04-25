# Memoria de Desarrollo: Error 500 en Polling

## Estado Actual (20 Abril / 21 Abril)
1. **Generación Dual Exitosa:** Se logró corregir la creación doble. Al darle a `Create`, el motor genera exitosamente dos tareas, se deducen 12 créditos y los dos bloques se colocan en el "My Work" visual de inmediato.
2. **Crash en Polling (HTTP 500):** Cuando el UI empieza a preguntar (polling) a `/api/music/feed/{task_id}` sobre el progreso, el servidor devuelve un error 500 y el estado cambia a `failed (100%)`.

## Puntos Críticos a Revisar Mañana
1. **Intercepción de `GenerationLog` en `get_feed`:** 
   Recientemente modificamos el endpoint `get_feed` en `main.py` para que busque primero en la base de datos local `GenerationLog`. Esto es perfecto para **Modal** (porque usa webhooks). Sin embargo, si el motor fue `KIE-SUNO`, KIE requiere que el propio backend le haga un "polling" (no usa webhooks). Es posible que nuestro código esté atrapando el `task_id` localmente y devolviendo 500, o bien no llamando al adaptador de KIE cuando debe.
   * **Solución propuesta:** En `get_feed`, si el `gen_log.engine == "KIE-SUNO"`, forzar el "proxy pass" hacia `kie_adapter.get_feed(task_id)` y actualizar el registro local, en lugar de solo leer el log obsoleto.
   
2. **Verificar Error Real:** 
   Mañana, el primer paso será arrancar la app y examinar la terminal del servidor al hacer la petición para ver el `Traceback` exacto del `HTTP 500` que lanza `/api/music/feed/{task_id}`, ya sea si viene de la base de datos o si la API misma de KIE está rechazando la conexión y rompiendo el backend.

3. **Verificar el Audio del Reproductor:**
   Mencionaste que "no se mueve y no se escucha". Esto es consecuencia directa de que la canción falló (`failed`) y el `audio_url` quedó nulo. Una vez que reparemos el HTTP 500, los mp3 originales volverán a cargar allí.

¡He dejado todo guardado! Mañana atacaremos este punto del `get_feed`.
