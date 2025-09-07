import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LayerRegistryService } from '../../core/services/layer-registry.service';
import { LayerCatalogConfig, OverlayLayerConfig } from '../../core/models/layer-config';
import { Observable } from 'rxjs';
import { LegendComponent } from './controls/legend/legend.component';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatListModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    LegendComponent
  ],
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {
  private readonly registry = inject(LayerRegistryService);

  catalog$!: Observable<LayerCatalogConfig>;
  opacityControls = new Map<string, FormControl<number>>();

  ngOnInit(): void {
    this.catalog$ = this.registry.getCatalog();
  }

  toggleLayer(layer: OverlayLayerConfig, event: any): void {
    this.registry.setLayerVisibility(layer.id, event.checked);
  }
}

