import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { geoJSON, icon, latLng, Map, marker, point, tileLayer } from 'leaflet';
import { ErrorStateMatcher, MatSidenav, MatSnackBar } from '@angular/material';
import { PathsService } from './paths.service';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('drawer') sidebar: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  garMap;
  pickedPoint;

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

  start;
  startComputed;
  end;
  endComputed;
  boundaryRectangle;
  routes = [];

  routesProperties = [];
  palette = ['#002db3', '#0033cc', '#0039e6', '#0040ff', '#1a53ff', '#3366ff',
    '#4d79ff', '#668cff', '#809fff', '#99b3ff', '#b3c6ff', '#ccd9ff'];
  currentColor = 0;

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

  simplificationFormControl = new FormControl(5, [
    Validators.required,
    Validators.min(0),
    Validators.max(10)
  ]);
  topKFormControl = new FormControl(5, [
    Validators.required,
    Validators.min(0),
    Validators.max(30)
  ]);
  matcher = new MyErrorStateMatcher();

  togglePick(garPoint: string): void {
    if (this.pickedPoint === garPoint) {
      this.pickedPoint = undefined;
    } else {
      this.pickedPoint = garPoint;
    }
    this.isHandset$.subscribe(
      (opened) => {
        if (opened) {
          this.sidebar.close();
        }
      }
    );
    this.snackBar.open('Click on the map to set the point', null, {
      duration: 5000
    });
  }

  onMapReady(garMap: Map) {
    this.garMap = garMap;
  }

  mapClick(e) {
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

  deletePoint(garPoint, name: string): void {
    garPoint.removeFrom(this.garMap);
    delete this.layersControl.overlays[name];
  }

  generatePaths(): void {
    this.loading = 0;
    this.snackBar.open('Finding the nearest road nodes...', null, {
      duration: 5000
    });
    this.clearComputedPoints();
    const subscription = this.pathsService.getPaths([
      this.start.getLatLng().lng,
      this.start.getLatLng().lat
    ], [
      this.end.getLatLng().lng,
      this.end.getLatLng().lat
    ],
      this.simplificationFormControl.value,
      this.topKFormControl.value
    ).subscribe((chunk) => {
        const nextObject = chunk as unknown as object;
        const status = nextObject['status'];
        const data = nextObject['data'];

        this.loading += this.addProgress(status);

        if (status === 'error') {
          console.log('Error caught!', data);
          this.loading = -1;
          if (this.boundaryRectangle) {
            this.boundaryRectangle.removeFrom(this.garMap);
          }
          this.snackBar.open(`An error occurred: ${data}`, null, {
            duration: 5000
          });
          subscription.unsubscribe();
        } else if (status === 'foundNearestRoads') {
          this.addPoints([data.computedStart, data.computedEnd]);
        } else if (status === 'computedBoundaryRectangle') {
          this.addPolygon(data);
          this.garMap.fitBounds(this.boundaryRectangle.getBounds());
        } else if (status === 'finished') {
          this.loading = -1;
          subscription.unsubscribe();
          const paths = JSON.parse(data);

          const points = paths.features.filter((feature) => feature.geometry.type === 'Point').slice(0, 2);
          const altPaths = paths.features.filter((feature) => feature.geometry.type === 'LineString').slice(0, 20);

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
      },
      (error) => {
        console.log('Error caught!', error);
        this.loading = -1;
        if (this.boundaryRectangle) {
          this.boundaryRectangle.removeFrom(this.garMap);
        }
        this.snackBar.open(`An error occurred: ${error.message}`, null, {
          duration: 5000
        });
        subscription.unsubscribe();
      });
  }

  pickColor(): string {
    return this.currentColor + 1 === this.palette.length ? this.palette[this.currentColor] : this.palette[this.currentColor++];
  }

  setPoint(p, name: string): void {
    switch (name) {
      case 'Original start':
        return this.start = p;
      case 'Original end':
        return this.end = p;
      case 'Computed start':
        return this.startComputed = p;
      case 'Computed end':
        return this.endComputed = p;
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
        this.snackBar.open('Computing the boundary rectangle...', null, {
          duration: 100000
        });
        return 20;
      case 'computedBoundaryRectangle':
        this.snackBar.open('Finding all roads within the boundary rectangle...', null, {
          duration: 100000
        });
        return 5;
      case 'foundRoadsWithin':
        this.snackBar.open('Building the graph...', null, {
          duration: 100000
        });
        return 40;
      case 'builtGraph':
        this.snackBar.open('Simplifying the graph...', null, {
          duration: 100000
        });
        return 25;
      case 'simplifiedGraph':
        this.snackBar.open('Finding the top K paths...', null, {
          duration: 100000
        });
        return 5;
      case 'foundTopK':
        this.snackBar.open('Computing the skyline...', null, {
          duration: 100000
        });
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
}

function createMarker(latlng, iconType: string, drag: boolean = true) {
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
