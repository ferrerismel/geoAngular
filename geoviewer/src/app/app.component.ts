import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ControlPanelComponent } from './features/control-panel/control-panel.component';
import { MapComponent } from './features/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, MatSidenavModule, MatListModule, ControlPanelComponent, MapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }

