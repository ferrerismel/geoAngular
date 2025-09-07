import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, retry } from 'rxjs';

export interface WmsParams {
  service?: 'WMS';
  request: 'GetMap' | 'GetLegendGraphic';
  layers: string;
  styles?: string;
  format?: string;
  transparent?: boolean;
  version?: '1.1.1' | '1.3.0';
  time?: string;
}

@Injectable({ providedIn: 'root' })
export class GeoServerService {
  private readonly http = inject(HttpClient);

  buildWmsUrl(baseUrl: string, params: WmsParams): string {
    const defaults = { service: 'WMS', version: '1.3.0', format: 'image/png', transparent: true };
    const q = new HttpParams({ fromObject: { ...defaults, ...params } as any });
    return `${baseUrl}?${q.toString()}`;
  }

  getLegendGraphic(baseUrl: string, layer: string, style?: string): string {
    const url = this.buildWmsUrl(baseUrl, {
      request: 'GetLegendGraphic',
      layers: layer,
      styles: style
    });
    return url;
  }

  getWfsGeoJson(baseUrl: string, typeName: string, srsName = 'EPSG:3857'): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName,
        outputFormat: 'application/json',
        srsName
      }
    });
    return this.http
      .get(`${baseUrl}?${params.toString()}`)
      .pipe(
        retry({ count: 3 }),
        catchError(() => of({ type: 'FeatureCollection', features: [] }))
      );
  }
}

