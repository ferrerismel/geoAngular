import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayLayerConfig } from '../../../../core/models/layer-config';
import { GeoServerService } from '../../../../core/services/geoserver.service';

@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent {
  @Input() layers: OverlayLayerConfig[] = [];

  private readonly geoserver = inject(GeoServerService);

  legendUrl(layer: OverlayLayerConfig): string | null {
    if (!layer.url || !layer.layerName) return null;
    return this.geoserver.getLegendGraphic(layer.url, layer.layerName, layer.style?.sld);
  }
}

