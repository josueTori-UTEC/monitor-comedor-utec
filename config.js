/*
  Configuración general.

  MODO LOCAL:
  - Déjalo como está para guardar la data solo en el navegador.
  - Útil para probar la página en GitHub Pages.

  MODO MULTIUSUARIO REAL:
  - Crea una Firebase Realtime Database.
  - Cambia enabled a true.
  - Pega tu databaseURL.
  - Todas las personas verán y actualizarán la misma data.
*/
window.APP_CONFIG = {
  appName: "Monitor comedor",
  storageKey: "monitor-comedor-escenarios-v1",
  firebase: {
    enabled: true,
    databaseURL: "https://halogen-base-482102-d3-default-rtdb.firebaseio.com",
    path: "comedormonitor"
  }
};
