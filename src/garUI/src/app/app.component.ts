import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeoJSON, geoJSON, icon, latLng, LeafletMouseEvent, Map, Marker, marker, point, Polygon, tileLayer } from 'leaflet';
import { MatSidenav, MatSnackBar } from '@angular/material';
import { PathsService } from './paths.service';
import { SkylineComponent } from './skyline/skyline.component';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('drawer') sidebar: MatSidenav;
  @ViewChild(SkylineComponent) private skyline: SkylineComponent;
  @ViewChild(SettingsComponent) private settings: SettingsComponent;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  displayedContent = 'map';

  garMap: Map;
  pickedPoint: string;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
    private pathsService: PathsService) {}

  // Define our base layers so we can reference them multiple times
  streetMaps = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  wMaps = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  start: Marker;
  startComputed: Marker;
  end: Marker;
  endComputed: Marker;
  boundaryRectangle: GeoJSON<Polygon>;
  routes = [];

  skylineData = [];
  routesProperties = [];
  palette = ['#002db3', '#0033cc', '#0039e6', '#0040ff', '#1a53ff', '#3366ff',
    '#4d79ff', '#668cff', '#809fff', '#99b3ff', '#b3c6ff', '#ccd9ff'];
  currentColor = 0;

  subscription: Subscription;
  loading = -1;

  // Layers control object with our two base layers and the three overlay layers
  layersControl = {
    baseLayers: {
      'Street Maps': this.streetMaps,
      'Wikimedia Maps': this.wMaps
    },
    overlays: {}
  };


  // Set the initial set of displayed layers (we could also use the leafletLayers input binding for this)
  options = {
    layers: [ this.streetMaps ],
    zoom: 13,
    center: latLng([ 57.0366, 9.9223 ])
  };

  togglePick(garPoint: string): void {
    if (this.pickedPoint === garPoint) {
      this.snackBar.dismiss();
      this.pickedPoint = undefined;
    } else {
      this.pickedPoint = garPoint;
      this.displayedContent = 'map';
      this.snackBar.open('Click on the map to set the point');
    }
    this.isHandset$.subscribe(
      (opened) => {
        if (opened) {
          this.sidebar.close();
        }
      }
    );
  }

  onMapReady(garMap: Map): void {
    this.garMap = garMap;
  }

  mapClick(e: LeafletMouseEvent): void {
    this.snackBar.dismiss();
    if (this.pickedPoint === 'start' && !this.start) {
      this.start = createMarker(e.latlng, 'green');
      this.start.addTo(this.garMap);
      this.layersControl.overlays['Original start'] = this.start;
    } else if (this.pickedPoint === 'start' && this.start) {
      this.start.setLatLng(e.latlng);
    } else if (this.pickedPoint === 'end' && !this.end) {
      this.end = createMarker(e.latlng, 'red');
      this.end.addTo(this.garMap);
      this.layersControl.overlays['Original end'] = this.end;
    } else if (this.pickedPoint === 'end' && this.end) {
      this.end.setLatLng(e.latlng);
    }
    this.pickedPoint = undefined;
  }

  deletePoint(garPoint: Marker, name: string): void {
    garPoint.removeFrom(this.garMap);
    delete this.layersControl.overlays[name];
  }

  generatePaths(): void {
    this.loading = 0;
    this.generationMessage('Finding the nearest road nodes...');
    this.clearComputedPoints();

    this.subscription = this.pathsService.getPaths([
        this.start.getLatLng().lng,
        this.start.getLatLng().lat
      ], [
        this.end.getLatLng().lng,
        this.end.getLatLng().lat
      ],
      this.settings.simplificationFormControl.value,
      this.settings.topKFormControl.value,
      this.settings.maxNearestFormControl.value,
      this.settings.mbrMarginFormControl.value,
      this.settings.selectedCostFunction,
      this.settings.skyline,
      this.settings.yenKeep
    ).subscribe((chunk) => {
        const nextObject = chunk as unknown as object;
        const status = nextObject['status'];
        const data = nextObject['data'];

        this.loading += this.addProgress(status);

        switch (status) {
          case 'error':
            this.cancelGenerating(`An error occurred: ${data}`);
            break;
          case 'foundNearestRoads':
            this.addPoints([data.computedStart, data.computedEnd]);
            break;
          case 'computedBoundaryRectangle':
            this.addPolygon(data);
            this.garMap.fitBounds(this.boundaryRectangle.getBounds());
            break;
          case 'foundTopK':
            this.skylineData = data;
            break;
          case 'computedSkyline':
            // console.log(data);
            break;
          case 'finished':
            this.finishGeneration(data);
            break;
        }
      },
      (error) => {
        this.cancelGenerating(`An error occurred: ${error.message}`);
      });
  }

  finishGeneration(data: string): void {
    this.loading = -1;
    this.subscription.unsubscribe();
    const paths = JSON.parse(data);

    const points = paths.features.filter((feature) => feature.geometry.type === 'Point').slice(0, 2);
    const altPaths = paths.features.filter((feature) => feature.geometry.type === 'LineString');

    this.clearMapData();

    this.addPoints(points);

    this.addPaths(altPaths);

    for (const route of this.routes.reverse()) { // make sure #0 is on top
      route.addTo(this.garMap);
    }

    this.routesProperties = altPaths.map((path) => path.properties);

    this.garMap.fitBounds(this.routes[0].getBounds(), { // recenter the map
      padding: point(24, 24),
      animate: true
    });
  }

  cancelGenerating(message: string = 'Path generation stopped'): void {
    console.log(message);
    this.loading = -1;
    if (this.boundaryRectangle) {
      this.boundaryRectangle.removeFrom(this.garMap);
    }
    this.snackBar.open(message, 'Close');

    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  pickColor(): string {
    return 'blue';
  }

  setPoint(mapPoint: Marker, name: string): any {
    switch (name) {
      case 'Original start':
        return this.start = mapPoint;
      case 'Original end':
        return this.end = mapPoint;
      case 'Computed start':
        return this.startComputed = mapPoint;
      case 'Computed end':
        return this.endComputed = mapPoint;
      default:
        return;
    }
  }

  clearMapData(computed: boolean = false): void {
    if (this.boundaryRectangle) {
      this.boundaryRectangle.removeFrom(this.garMap);
    }

    for (const route of this.routes) {
      route.removeFrom(this.garMap);
    }
    this.routes = [];
    this.routesProperties = [];
    this.currentColor = 0;
    if (this.start) {
      this.deletePoint(this.start, 'Original start');
    }
    if (this.end) {
      this.deletePoint(this.end, 'Original end');
    }
    if (computed) {
      this.clearComputedPoints();
    }
  }

  clearComputedPoints(): void {
    if (this.startComputed) {
      this.deletePoint(this.startComputed, 'Computed start');
    }
    if (this.endComputed) {
      this.deletePoint(this.endComputed, 'Computed end');
    }
  }

  addPoints(points): void {
    geoJSON(points, {
      onEachFeature: (feature) => {
        geoJSON(feature, {
          pointToLayer: (geoJsonPoint, latlng) => {
            const newPoint = createMarker(
              latlng,
              getColor(feature.properties.name),
              getDrag(feature.properties.name));
            this.layersControl.overlays[feature.properties.name] = newPoint;
            this.setPoint(newPoint, feature.properties.name);
            return newPoint;
          }})
          .bindPopup((layer) => layer['feature'].properties.name)
          .addTo(this.garMap);
      }
    });
  }

  addPaths(paths): void {
    geoJSON(paths, {
      onEachFeature: (feature) => {
        const newPath = geoJSON(feature, {
          style: () => ({color: this.pickColor()})})
          .bindPopup((fLayer) => fLayer['feature'].properties.name);
        this.routes.push(newPath);
        this.layersControl.overlays[feature.properties.name] = newPath;
      }
    });
  }

  addPolygon(polygon): void {
    this.boundaryRectangle = geoJSON(polygon).bindPopup(() => 'Boundary rectangle').addTo(this.garMap);
    this.layersControl.overlays['Boundary rectangle'] = this.boundaryRectangle;
  }

  addProgress(step: string): number {
    switch (step) {
      case 'foundNearestRoads':
        this.generationMessage('Computing the boundary rectangle...');
        return 20;
      case 'computedBoundaryRectangle':
        this.generationMessage('Finding all roads within the boundary rectangle...');
        return 5;
      case 'foundRoadsWithin':
        this.generationMessage('Building the graph...');
        return 40;
      case 'builtGraph':
        this.generationMessage('Simplifying the graph...');
        return 25;
      case 'simplifiedGraph':
        this.generationMessage('Finding the top K paths...');
        return 5;
      case 'foundTopK':
        this.generationMessage('Computing the skyline...');
        return 10;
      case 'computedSkyline':
        this.snackBar.open('Done!', null, {
          duration: 3000
        });
        return 5;
      default:
        return 0;
    }
  }

  generationMessage(message: string): void {
    this.snackBar
      .open(message, 'Cancel')
      .afterDismissed()
      .subscribe(info => {
        if (info.dismissedByAction === true) {
          this.cancelGenerating();
        }
      });
  }

  changeContent(name: string): void {
    this.displayedContent = name;
    if (name === 'skyline') {
      this.skyline.drawSkyline(this.skylineData);
    }
    window.dispatchEvent(new Event('resize'));
    this.garMap.invalidateSize();
  }
}

function createMarker(latlng, iconType: string, drag: boolean = true): Marker {
  let markerIcon: string;
  switch (iconType) {
    case 'red':
      markerIcon = 'marker-icon-red.png';
      break;
    case 'light red':
      markerIcon = 'marker-icon-light-red.png';
      break;
    case 'green':
      markerIcon = 'marker-icon-green.png';
      break;
    case 'light green':
      markerIcon = 'marker-icon-light-green.png';
      break;
    case 'default':
      markerIcon = 'marker-icon.png';
      break;
  }

  return marker(latlng, {
    icon: icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
      iconUrl: `assets/${markerIcon}`,
      shadowUrl: 'leaflet/marker-shadow.png',
    }),
    draggable: drag
  });
}

function getColor(name: string): string {
  switch (name) {
    case 'Original start':
      return 'green';
    case 'Original end':
      return 'red';
    case 'Computed start':
      return 'light green';
    case 'Computed end':
      return 'light red';
    default:
      return 'blue';
  }
}

function getDrag(name: string): boolean {
  switch (name) {
    case 'Original start':
    case 'Original end':
      return true;
    case 'Computed start':
    case 'Computed end':
      return false;
    default:
      return false;
  }
}
