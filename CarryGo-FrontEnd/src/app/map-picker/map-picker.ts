import {
  Component, EventEmitter, Output, OnInit, OnDestroy, OnChanges, SimpleChanges,
  AfterViewInit, Input, ViewChild, ElementRef, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as L from 'leaflet';

export interface MapPickerResult {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropAddress: string;
  dropLat: number;
  dropLng: number;
  distanceKm: number;
  durationMin: number;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-picker.html',
  styleUrl: './map-picker.css',
})
export class MapPickerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() isOpen = false;

  @Output() confirmed = new EventEmitter<MapPickerResult>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('mapEl') mapElRef!: ElementRef<HTMLDivElement>;

  phase: 'pickup' | 'drop' = 'pickup';

  pickupAddress = '';
  pickupLat?: number;
  pickupLng?: number;

  dropAddress = '';
  dropLat?: number;
  dropLng?: number;

  distanceKm = 0;
  durationMin = 0;
  isRouting = false;

  searchQuery = '';
  suggestions: any[] = [];
  isSearching = false;
  showSuggestions = false;

  private map: any;
  private pickupMarker: any;
  private dropMarker: any;
  private routeLayer: any;
  private mapReady = false;
  private leafletLoaded = false;
  private pendingMapInit = false;

  private searchSubject = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    const sub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
    ).subscribe(q => {
      if (q.length >= 3) this.runSearch(q);
      else { this.suggestions = []; this.showSuggestions = false; this.cdr.detectChanges(); }
    });
    this.subs.push(sub);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.fixLeafletIcons();
    this.leafletLoaded = true;

    if (this.pendingMapInit) {
      this.pendingMapInit = false;
      setTimeout(() => { this.initMap(); this.mapReady = true; }, 50);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']) return;

    const nowOpen: boolean = changes['isOpen'].currentValue;

    if (nowOpen) {
      this.resetState();

      if (!this.leafletLoaded) {
        this.pendingMapInit = true;
      } else if (!this.mapReady) {
        setTimeout(() => {
          this.initMap();
          this.mapReady = true;
          setTimeout(() => { if (this.map) this.map.invalidateSize(true); }, 50);
        }, 50);
      } else {
        setTimeout(() => {
          if (this.map) this.map.invalidateSize(true);
        }, 80);
      }
    }
  }

  private fixLeafletIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
  }

  private initMap(): void {
    if (!this.mapElRef?.nativeElement) return;

    this.map = L.map(this.mapElRef.nativeElement, {
      center: [20.5937, 78.9629],
      zoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.zone.run(() => this.handleMapClick(lat, lng));
    });
  }

  private handleMapClick(lat: number, lng: number): void {
    if (this.phase === 'pickup') {
      this.applyPickup(lat, lng, `${lat}, ${lng}`);
    } else {
      this.applyDrop(lat, lng, `${lat}, ${lng}`);
    }
  }

  private applyPickup(lat: number, lng: number, address: string): void {
    this.pickupLat = lat;
    this.pickupLng = lng;
    this.pickupAddress = address;

    if (this.pickupMarker) this.pickupMarker.remove();

    this.pickupMarker = L.marker([lat, lng]).addTo(this.map);

    this.phase = 'drop';
  }

  private applyDrop(lat: number, lng: number, address: string): void {
    this.dropLat = lat;
    this.dropLng = lng;
    this.dropAddress = address;

    if (this.dropMarker) this.dropMarker.remove();

    this.dropMarker = L.marker([lat, lng]).addTo(this.map);
  }

  private runSearch(query: string): void {
    this.isSearching = true;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;

    this.http.get<any[]>(url).subscribe({
      next: res => {
        this.suggestions = res;
        this.showSuggestions = true;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: () => this.isSearching = false
    });
  }

  private resetState(): void {
    this.phase = 'pickup';

    if (this.pickupMarker) this.pickupMarker.remove();
    if (this.dropMarker) this.dropMarker.remove();
    if (this.routeLayer) this.routeLayer.remove();

    this.pickupLat = this.pickupLng = this.dropLat = this.dropLng = undefined;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.map) this.map.remove();
  }
}
