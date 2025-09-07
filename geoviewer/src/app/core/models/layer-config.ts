export type LayerProtocol = 'WMS' | 'WFS' | 'WMST';
export type LayerType = 'raster' | 'vector' | 'temporal';

export interface TimeConfig {
  enabled: boolean;
  default?: string;
  range?: { start: string; end: string };
}

export interface StyleConfig {
  sld?: string;
  opacity?: number; // 0..1
}

export interface BaseMapConfig {
  id: string;
  type: 'raster';
  title: string;
  provider: 'osm';
  visible?: boolean;
}

export interface OverlayLayerConfig {
  id: string;
  type: LayerType;
  protocol: LayerProtocol;
  title: string;
  url: string;
  layerName: string;
  outputFormat?: string; // for WFS
  style?: StyleConfig;
  time?: TimeConfig; // for WMST
  queryable?: boolean;
  visible?: boolean;
}

export interface LayerCatalogConfig {
  baseMaps: BaseMapConfig[];
  overlays: OverlayLayerConfig[];
}

