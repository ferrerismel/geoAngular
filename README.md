# GeoViewer Angular + GeoServer (Arquitectura, Setup y Configuración de Capas)

Este documento describe cómo construir una aplicación web en Angular orientada a la visualización dinámica de mapas y capas geoespaciales servidas desde GeoServer, cumpliendo con:

- Integración de servicios WMS/WFS/WMST
- Selección dinámica de capas, estilos, opacidad y parámetros temporales
- UI modular y responsiva (panel de control, mapa, leyenda, escala, herramientas)
- Arquitectura desacoplada con servicios Angular y OpenLayers
- Configuración extensible basada en JSON
- Pruebas automatizadas (Jasmine/Karma)

## 1) Estructura propuesta del proyecto

```
geoviewer/
  src/
    app/
      core/
        services/
          geoserver.service.ts
          layer-registry.service.ts
        models/
          layer-config.ts
        utils/
          ol-factories.ts
      features/
        map/
          map.component.ts
          map.component.html
          map.component.scss
        control-panel/
          control-panel.component.ts
          control-panel.component.html
          control-panel.component.scss
          controls/
            layer-list/
            time-slider/
            legend/
            scale/
      shared/
        components/
        directives/
        pipes/
    assets/
      layers/
        catalog.json
      styles/
    environments/
  angular.json
  package.json
  README.md
```

## 2) Librerías

- Angular 17/18
- OpenLayers (`ol`)
- Angular Material (`@angular/material` + `@angular/animations`)
- RxJS

## 3) Instalación y scaffold

Si el entorno lo permite:

```bash
npx -y @angular/cli@18 new geoviewer --routing --style=scss --package-manager=npm --defaults
cd geoviewer
npm i ol @angular/material @angular/animations
ng add @angular/material --skip-confirmation
```

## 4) Configuración de capas basada en JSON

Archivo: `src/assets/layers/catalog.json`. Ejemplo mínimo:

```json
{
  "baseMaps": [
    {
      "id": "osm",
      "type": "raster",
      "title": "OpenStreetMap",
      "provider": "osm"
    }
  ],
  "overlays": [
    {
      "id": "municipios",
      "type": "vector",
      "protocol": "WFS",
      "title": "Municipios",
      "url": "https://<GEOSERVER>/geoserver/wfs",
      "layerName": "workspace:municipios",
      "outputFormat": "application/json",
      "style": {
        "sld": "workspace:municipios_style",
        "opacity": 0.8
      },
      "queryable": true,
      "visible": true
    },
    {
      "id": "temperatura",
      "type": "raster",
      "protocol": "WMS",
      "title": "Temperatura",
      "url": "https://<GEOSERVER>/geoserver/wms",
      "layerName": "workspace:temp",
      "style": {
        "sld": "workspace:temp_sld",
        "opacity": 0.7
      },
      "time": {
        "enabled": true,
        "default": "2024-01-01T00:00:00Z",
        "range": {
          "start": "2023-01-01T00:00:00Z",
          "end": "2025-01-01T00:00:00Z"
        }
      },
      "visible": false
    }
  ]
}
```

Esquema (conceptual):

- `type`: `raster` | `vector` | `temporal`
- `protocol`: `WMS` | `WFS` | `WMST`
- `style.sld`: nombre del estilo publicado en GeoServer
- `time`: activa el control deslizante temporal para capas WMST

## 5) Servicio `GeoServerService`

Responsabilidades:

- Construir URLs y parámetros para peticiones WMS/WFS/WMST
- Proveer observables para el estado de mapa y capas
- Gestionar carga asíncrona con tolerancia a fallos (reintentos/backoff)
- Exponer helpers para leyenda (GetLegendGraphic) y descripciones (DescribeFeatureType)

Endpoints típicos:

- WMS: `/wms?service=WMS&request=GetMap&layers=...&styles=...&format=image/png&transparent=true&time=...`
- WFS: `/wfs?service=WFS&request=GetFeature&typeName=...&outputFormat=application/json&srsName=EPSG:3857`
- Leyenda: `/wms?service=WMS&request=GetLegendGraphic&format=image/png&layer=...&style=...`

## 6) OpenLayers y manejo de capas

- `TileLayer` + `TileWMS` para WMS/WMST
- `VectorLayer` + `VectorSource` (formato GeoJSON) para WFS
- Controles: `ScaleLine`, `Zoom`, `Attribution`, `FullScreen`
- Interacciones: `DragPan`, `MouseWheelZoom`

Eventos clave:

- Cambio de visibilidad/estilo/opacidad -> actualizar capa
- Cambio de tiempo (WMST) -> actualizar parámetro `TIME` y refrescar tiles

## 7) Panel de control y formularios

- Lista de capas con toggles
- Formularios reactivos para: estilo (select), opacidad (slider), fecha (date/time picker)
- Validaciones: rangos de fechas, opacidad [0..1], requeridos
- Errores: mostrar `mat-snack-bar` con mensajes amigables

## 8) Time Slider (WMST)

- Componente reutilizable que emite `Date | string`
- Vinculado a capas `time.enabled === true`
- Paso configurable (hora/día/mes)

## 9) Pruebas

- Unit: servicios (URLs, parámetros, manejo de errores)
- Componentes: render, interacción, bindings
- Integración: cargar `catalog.json`, crear mapa y añadir capas

## 10) Extensibilidad

- La `LayerRegistryService` lee `catalog.json` y registra fábricas de capas
- Diseñar interfaces para permitir futuros motores (MapServer, QGIS Server)

## 11) Comandos útiles

```bash
# Desarrollo
npm start

# Linter y pruebas
npm run lint
npm test

# Compilación prod
npm run build
```

## 12) Requisitos de GeoServer

- Publicar capas con estilos SLD nombrados y CRS soportado (EPSG:3857/4326)
- Habilitar dimensión temporal para WMST (`TIME`), y verificar rango
- CORS habilitado o uso de proxy inverso

## 13) Alternativas Open Source

- MapLibre GL JS, Leaflet, CesiumJS (3D)
- Para edición vectorial: `ol/interaction/Draw/Modify/Snap`

---

Sigue la estructura anterior para implementar componentes y servicios. Puedes iniciar el scaffold localmente y copiar los archivos de `assets/layers/catalog.json` y servicios según esta guía.
