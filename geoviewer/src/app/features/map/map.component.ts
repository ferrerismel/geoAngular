import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { LayerRegistryService } from '../../core/services/layer-registry.service';
import { OverlayLayerConfig } from '../../core/models/layer-config';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapRef', { static: true }) mapRef!: ElementRef<HTMLDivElement>;

  private readonly registry = inject(LayerRegistryService);
  private map!: Map;

  private overlayLayers = new Map<string, TileLayer<TileWMS> | VectorLayer<VectorSource>>();

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapRef.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() })
      ],
      view: new View({ center: [0, 0], zoom: 2 }),
      controls: defaultControls().extend([new ScaleLine()])
    });

    this.registry.listVisibleOverlays().subscribe(overlays => this.syncOverlays(overlays));
  }

  private syncOverlays(overlays: OverlayLayerConfig[]): void {
    const desired = new Set(overlays.map(o => o.id));

    // remove missing
    Array.from(this.overlayLayers.keys()).forEach(id => {
      if (!desired.has(id)) {
        const layer = this.overlayLayers.get(id);
        if (layer) {
          this.map.removeLayer(layer);
          this.overlayLayers.delete(id);
        }
      }
    });

    // add/update
    overlays.forEach(cfg => {
      const exists = this.overlayLayers.get(cfg.id);
      if (exists) {
        // update style/opacity/time if needed
        if (cfg.style?.opacity !== undefined) {
          exists.setOpacity(cfg.style.opacity);
        }
        if (cfg.protocol === 'WMS' || cfg.protocol === 'WMST') {
          const src = exists.getSource() as TileWMS;
          const params: any = { LAYERS: cfg.layerName };
          if (cfg.style?.sld) params.STYLES = cfg.style.sld;
          if (cfg.time?.enabled && cfg.time.default) params.TIME = cfg.time.default;
          src.updateParams(params);
        }
        return;
      }

      if (cfg.protocol === 'WMS' || cfg.protocol === 'WMST') {
        const params: any = { LAYERS: cfg.layerName, TILED: true, TRANSPARENT: true, FORMAT: 'image/png' };
        if (cfg.style?.sld) params.STYLES = cfg.style.sld;
        if (cfg.protocol === 'WMST' && cfg.time?.enabled && cfg.time.default) params.TIME = cfg.time.default;
        const layer = new TileLayer({
          opacity: cfg.style?.opacity ?? 1,
          source: new TileWMS({ url: cfg.url, params })
        });
        this.overlayLayers.set(cfg.id, layer);
        this.map.addLayer(layer);
      } else if (cfg.protocol === 'WFS') {
        const source = new VectorSource({
          format: new GeoJSON(),
          url: () => {
            const params = new URLSearchParams({
              service: 'WFS',
              version: '2.0.0',
              request: 'GetFeature',
              typeName: cfg.layerName,
              outputFormat: cfg.outputFormat || 'application/json',
              srsName: 'EPSG:3857'
            });
            return `${cfg.url}?${params.toString()}`;
          }
        });
        const layer = new VectorLayer({ source, opacity: cfg.style?.opacity ?? 1 });
        this.overlayLayers.set(cfg.id, layer);
        this.map.addLayer(layer);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) this.map.setTarget(undefined as any);
  }
}

