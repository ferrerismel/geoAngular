import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LayerCatalogConfig, OverlayLayerConfig } from '../models/layer-config';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayerRegistryService {
  private readonly http = inject(HttpClient);

  private readonly catalog$ = this.http
    .get<LayerCatalogConfig>('assets/layers/catalog.json')
    .pipe(shareReplay(1));

  private readonly visibleLayerIds$ = new BehaviorSubject<Set<string>>(new Set());
  private readonly layerOpacity$ = new BehaviorSubject<Map<string, number>>(new Map());
  private readonly layerTime$ = new BehaviorSubject<Map<string, string>>(new Map());

  getCatalog(): Observable<LayerCatalogConfig> {
    return this.catalog$;
  }

  getOverlayById(id: string): Observable<OverlayLayerConfig | undefined> {
    return this.catalog$.pipe(map(c => c.overlays.find(o => o.id === id)));
  }

  listVisibleOverlays(): Observable<OverlayLayerConfig[]> {
    return this.catalog$.pipe(
      map(c => c.overlays.filter(o => this.visibleLayerIds$.value.has(o.id) || o.visible)),
      catchError(() => of([]))
    );
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    const next = new Set(this.visibleLayerIds$.value);
    if (visible) next.add(layerId); else next.delete(layerId);
    this.visibleLayerIds$.next(next);
  }

  getVisibilityChanges(): Observable<Set<string>> {
    return this.visibleLayerIds$.asObservable();
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    const next = new Map(this.layerOpacity$.value);
    next.set(layerId, opacity);
    this.layerOpacity$.next(next);
  }

  getOpacityChanges(): Observable<Map<string, number>> {
    return this.layerOpacity$.asObservable();
  }

  setLayerTime(layerId: string, isoTime: string): void {
    const next = new Map(this.layerTime$.value);
    next.set(layerId, isoTime);
    this.layerTime$.next(next);
  }

  getTimeChanges(): Observable<Map<string, string>> {
    return this.layerTime$.asObservable();
  }
}

