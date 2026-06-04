# Monitor comedor - 8 escenarios

Web estática basada en el archivo `MUESTRA OFI. COMEDOR.xlsx`.

## Qué hace

- Tiene 8 escenarios, equivalentes a Hoja 1 hasta Hoja 8.
- Cada escenario registra la hora automáticamente al presionar `Check`.
- Hoja 1 solo pide el ID y registra `T. llega al comedor`.
- Hoja 3 tiene dos tiempos:
  - `Siguiente` registra `T. inicio caja`.
  - `Check` registra `T. fin caja`.
- En Hoja 3, `Pagó` tiene las opciones: `Yape/Plin`, `Tarjeta`, `Efectivo`.
- En Hoja 5, `Tipo pedido` tiene las opciones: `Economico`, `Estudiantil 1 o 2`, `Ejecutivo`, `Saludable`, `Bebida`, `Snack, galleta`, `Postre`.
- Hoja 7 solo busca el ID y registra `T. fin entrega` al presionar `Check`; no pide campo extra.
- Hoja 2 a Hoja 8 trabajan de forma secuencial usando IDs del escenario anterior.
- Hoja 4 tiene la excepción indicada:
  - Si `Reservó = 0`, el ID debe venir de Hoja 3.
  - Si `Reservó = 1`, se puede buscar un ID existente o escribir un ID nuevo.
- Permite exportar CSV por hoja, CSV general y backup JSON.

## Archivos

- `index.html`: página principal.
- `styles.css`: diseño visual responsive para laptop y celular.
- `app.js`: lógica de los 8 escenarios.
- `config.js`: configuración de modo local o Firebase.
- `.nojekyll`: evita que GitHub Pages procese la página con Jekyll.

## Guardado de datos

### Modo local

Viene activado por defecto. Guarda la información en el navegador usando `localStorage`.

Sirve para probar, pero no es ideal para varios monitores, porque cada celular o laptop tendrá su propia data.

### Modo multiusuario con Firebase

Es el modo recomendado para pasar un solo link y que varias personas registren en la misma base.

Con Firebase Realtime Database:

- La página queda publicada en GitHub Pages.
- La data queda guardada en Firebase.
- Si alguien refresca la página, la data vuelve a cargar desde Firebase.
- Si alguien entra desde celular, verá la misma data compartida.

## Activar Firebase Realtime Database

1. Entra a Firebase Console.
2. Crea un proyecto nuevo.
3. En el menú izquierdo, entra a `Build` > `Realtime Database`.
4. Crea la base de datos.
5. Para una prueba rápida de clase, puedes crearla en modo de prueba.
6. Copia la URL de la base. Debe verse parecido a esto:

```txt
https://mi-proyecto-default-rtdb.firebaseio.com
```

7. Abre `config.js` y cambia `enabled` a `true`.
8. Pega tu URL en `databaseURL`.

Debe quedar así:

```js
window.APP_CONFIG = {
  appName: "Monitor comedor",
  storageKey: "monitor-comedor-escenarios-v1",
  firebase: {
    enabled: true,
    databaseURL: "https://mi-proyecto-default-rtdb.firebaseio.com",
    path: "comedormonitor"
  }
};
```

9. En Firebase, entra a la pestaña `Rules` y para una prueba rápida usa estas reglas:

```json
{
  "rules": {
    "comedormonitor": {
      ".read": true,
      ".write": true
    }
  }
}
```

10. Publica los cambios en Firebase.

Importante: estas reglas públicas son solo para una prueba temporal de clase. No las uses para datos sensibles ni por mucho tiempo.

## Subirlo a GitHub Pages

1. Descomprime el ZIP.
2. Crea un repositorio en GitHub.
3. Sube a la raíz del repositorio estos archivos:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `.nojekyll`
   - `README.md`
4. En GitHub entra a `Settings` > `Pages`.
5. En `Build and deployment`, selecciona `Deploy from a branch`.
6. Selecciona la rama `main` y carpeta `/(root)`.
7. Guarda.
8. Espera unos minutos.
9. GitHub te mostrará un link parecido a:

```txt
https://usuario.github.io/nombre-repositorio/
```

Ese link lo puedes pasar por WhatsApp y abrirá en laptop o celular.

## Uso recomendado el día de la toma

1. Activa Firebase antes de pasar el link.
2. Sube los archivos ya configurados a GitHub.
3. Pasa el link a los monitores.
4. Cada monitor escribe su nombre en `Nombre del monitor`.
5. Cada monitor entra al escenario que le corresponde.
6. Cuando complete su parte, presiona `Check`.
7. Al final, exporta `CSV general` o `Backup JSON`.

## Notas

- La hora se registra con la hora local del dispositivo que hace clic.
- Si un ID ya tenía hora en una hoja, el sistema no la sobrescribe; solo completa datos faltantes.
- Los IDs precargados de Hoja 1 van de 100 a 848, tal como el Excel.
- Si se trabaja con varias personas, no usar solo modo local; usar Firebase.
Deploy actualizado
