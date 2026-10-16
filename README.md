# Ricardio: Una vida de metal

Beat 'em up arcade de 16 bits que corre en el navegador: 11 capítulos, jefes, cinemáticas, álbum de coleccionables y una banda sonora chiptune sintetizada con WebAudio. Homenaje de fan no oficial.

**Jugar:** https://reeb-dev.github.io/Ricardo/

## Controles

| Tecla | Acción |
| --- | --- |
| Flechas | Moverse (doble toque adelante: correr) |
| Z | Golpe (combo) |
| X | Salto |
| C | Bajazo (especial) |
| B | Tirar papas / discos |
| Shift | Esquive |
| Enter / P | Pausa |
| Esc / Q | Volver al menú |
| G | Álbum |
| M | Música propia |

En móvil aparecen botones táctiles; conviene jugar en horizontal. También funciona con gamepad.

La opción de música propia (tecla M) permite cargar tus propios MP3. Quedan guardados en el navegador (IndexedDB) y no se suben a ningún servidor.

## Estructura

```
public/
  index.html            marcado y carga de scripts
  style.css             estilos
  game.js               todo el juego (motor, niveles, audio, render)
  sw.js                 service worker (juego sin conexión)
  manifest.webmanifest  instalable como app
  icon.svg
.github/workflows/static.yml   despliegue a GitHub Pages (solo publica public/)
```

No hay paso de build: se puede abrir `public/index.html` directamente o servir la carpeta.

```bash
cd public && python3 -m http.server 8000
```

## Depuración

Con `?debug` en la URL (por ejemplo `http://localhost:8000/?debug`) se expone `window.__game` con utilidades como `start(i)`, `warp(i, x)`, `unlockAll()` o `killBoss()`. Sin ese parámetro no existe.

## Guardado

`localStorage`: `ricardio-v9` (récord), `ricardio-diff` (dificultad), `ricardio-album` (coleccionables). IndexedDB `ricardio-musica` guarda la lista de temas propios.

## Aviso

Proyecto de fans sin relación con las personas ni obras que menciona. No incluye grabaciones de terceros: la música se sintetiza en el navegador, pero parte de ella son adaptaciones chiptune de temas existentes (V8, Hermética, Almafuerte), así que conviene revisar los derechos antes de cualquier uso comercial.
