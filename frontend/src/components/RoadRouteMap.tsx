import { useEffect, useRef, useState } from 'react'
import { fetchRoadRoute } from '../services/api'
import type { TransferItem } from '../types'

declare global {
  interface Window {
    L?: any
  }
}

interface RoadRouteMapProps {
  activeTransfer:
    | (TransferItem & {
        distance_km?: number
        travel_time_min?: number
        source_lat?: number
        source_lon?: number
        source_city?: string
        destination_lat?: number
        destination_lon?: number
        destination_city?: string
        route_score?: number
        urgency_level?: string
      })
    | null
  alternativeTransfers?: TransferItem[]
  onSelectTransfer?: (id: number) => void
  onRouteCalculated?: (data: { roadDistanceKm: number; durationMin: number }) => void
}

export function RoadRouteMap({
  activeTransfer,
  alternativeTransfers = [],
  onSelectTransfer,
  onRouteCalculated,
}: RoadRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayersRef = useRef<any[]>([])
  const markerLayersRef = useRef<any[]>([])
  const circleLayerRef = useRef<any>(null)
  const renderedRouteIdRef = useRef<number | null>(null)

  // Keep callback refs stable to prevent re-render loops
  const onRouteCalculatedRef = useRef(onRouteCalculated)
  onRouteCalculatedRef.current = onRouteCalculated

  const onSelectTransferRef = useRef(onSelectTransfer)
  onSelectTransferRef.current = onSelectTransfer

  const alternativeTransfersRef = useRef(alternativeTransfers)
  alternativeTransfersRef.current = alternativeTransfers

  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState<boolean>(false)

  // Anchor coordinates (Government Rajiv Gandhi Medical College Hospital, Chennai)
  const anchorLat = activeTransfer?.source_lat ?? 13.081279
  const anchorLon = activeTransfer?.source_lon ?? 80.27678
  const activeTransferId = activeTransfer?.id ?? null
  const srcLat = activeTransfer?.source_lat ?? 13.081279
  const srcLon = activeTransfer?.source_lon ?? 80.27678
  const dstLat = activeTransfer?.destination_lat ?? 13.085
  const dstLon = activeTransfer?.destination_lon ?? 80.28

  // 1. Initialize Leaflet Map once with Clean CartoDB Positron Tiles (Simple Light India Map, No Road Clutter)
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = () => {
      const L = window.L
      if (!L || mapInstanceRef.current) return

      const map = L.map(mapContainerRef.current, {
        center: [anchorLat, anchorLon],
        zoom: 10,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
      })

      // Add CartoDB Positron Tiles (Clean, minimalist light map without dense street/road clutter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Add Single Subtle 200 KM Service Radius Boundary Circle
      const circle = L.circle([anchorLat, anchorLon], {
        radius: 200000, // 200 km in meters
        color: '#7A1C28',
        weight: 1.2,
        dashArray: '5, 8',
        fillColor: '#7A1C28',
        fillOpacity: 0.015,
        interactive: false,
      }).addTo(map)
      circleLayerRef.current = circle

      mapInstanceRef.current = map
      setMapReady(true)
    }

    if (window.L) {
      initMap()
    } else {
      const interval = setInterval(() => {
        if (window.L) {
          clearInterval(interval)
          initMap()
        }
      }, 100)
      return () => clearInterval(interval)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [anchorLat, anchorLon])

  // 2. Fetch and Draw Static Real Road Geometry on Clean Light Map (Runs strictly once per transfer ID)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !activeTransferId) return

    // Prevent re-rendering if this route is already drawn
    if (renderedRouteIdRef.current === activeTransferId) {
      return
    }

    const L = window.L
    if (!L) return

    const map = mapInstanceRef.current

    // Clear previous routes & markers
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer))
    routeLayersRef.current = []
    markerLayersRef.current.forEach((marker) => map.removeLayer(marker))
    markerLayersRef.current = []

    setIsLoadingRoute(true)
    setRouteError(null)

    fetchRoadRoute(srcLat, srcLon, dstLat, dstLon, true)
      .then((data) => {
        renderedRouteIdRef.current = activeTransferId
        setIsLoadingRoute(false)

        if (onRouteCalculatedRef.current) {
          onRouteCalculatedRef.current({
            roadDistanceKm: data.distance_km,
            durationMin: data.duration_minutes,
          })
        }

        const bounds = L.latLngBounds([])

        // A. Draw Static Alternative Routes (Subtle Muted Gray Lines, max 2)
        if (data.alternatives && data.alternatives.length > 0) {
          const currentAlts = alternativeTransfersRef.current
          data.alternatives.slice(0, 2).forEach((alt, idx) => {
            const altGeoJson = {
              type: 'Feature',
              geometry: alt.geometry,
              properties: {},
            }
            const altLayer = L.geoJSON(altGeoJson, {
              style: {
                color: idx === 0 ? '#6B7280' : '#9CA3AF',
                weight: idx === 0 ? 2.8 : 2.0,
                opacity: idx === 0 ? 0.5 : 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              },
            }).addTo(map)

            const matchingAlt = currentAlts[idx]
            altLayer.bindPopup(
              `<div style="font-family: sans-serif; font-size: 11px;">
                <strong>Alternative Route ${matchingAlt ? `#${matchingAlt.id}` : ''}</strong><br/>
                Distance: <b>${alt.distance_km} km</b><br/>
                Transit Time: <b>${alt.duration_minutes} min</b>
              </div>`,
            )
            if (matchingAlt && onSelectTransferRef.current) {
              altLayer.on('click', () => onSelectTransferRef.current?.(matchingAlt.id))
            }
            routeLayersRef.current.push(altLayer)
          })
        }

        // B. Draw Static Recommended Route (Double-layered Corridor: Outer 8px 0.25 opacity + Inner 5px 1.0 opacity)
        const primaryGeoJson = {
          type: 'Feature',
          geometry: data.geometry,
          properties: {},
        }

        // Outer dark burgundy track (8px width, 0.25 opacity)
        const glowLayer = L.geoJSON(primaryGeoJson, {
          style: {
            color: '#58121B',
            weight: 8.0,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round',
          },
        }).addTo(map)
        routeLayersRef.current.push(glowLayer)

        // Inner solid PRAVAH burgundy line (5px width, 1.0 opacity)
        const primaryLayer = L.geoJSON(primaryGeoJson, {
          style: {
            color: '#7A1C28',
            weight: 5.0,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
          },
        }).addTo(map)

        primaryLayer.bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <span style="color: #7A1C28; font-weight: bold; font-size: 10px; text-transform: uppercase;">
              RECOMMENDED ROUTE #${activeTransfer?.id}
            </span>
            <div style="font-weight: bold; margin-top: 2px;">${activeTransfer?.route}</div>
            <div style="color: #166534; font-weight: bold; margin-top: 3px;">
              ${activeTransfer?.quantity} Units ${activeTransfer?.blood_group} ${activeTransfer?.component}
            </div>
            <div style="color: #5A5451; font-size: 11px; margin-top: 3px;">
              Distance: <b>${data.distance_km} km</b> · Transit: <b>${data.duration_minutes} min</b>
            </div>
          </div>`,
        )
        routeLayersRef.current.push(primaryLayer)

        // Add coordinates to bounds
        const coords = data.geometry?.coordinates || []
        coords.forEach((coord: [number, number]) => {
          bounds.extend([coord[1], coord[0]])
        })

        // C. Add 2 to 4 Static Checkpoint Dots along the corridor
        if (coords.length >= 4) {
          const checkpointFractions = [0.25, 0.50, 0.75]
          checkpointFractions.forEach((frac) => {
            const idx = Math.min(coords.length - 2, Math.max(1, Math.floor(coords.length * frac)))
            const pt = coords[idx]
            if (pt) {
              const checkpointIcon = L.divIcon({
                className: 'static-checkpoint-dot',
                html: `
                  <div style="width: 10px; height: 10px; background: #7A1C28; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.35);"></div>
                `,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              })
              const cpMarker = L.marker([pt[1], pt[0]], { icon: checkpointIcon }).addTo(map)
              markerLayersRef.current.push(cpMarker)
            }
          })
        }

        // D. Midpoint Distance & Duration Badge on the Route
        if (coords.length > 0) {
          const midPt = coords[Math.floor(coords.length / 2)]
          const midBadgeIcon = L.divIcon({
            className: 'midpoint-route-badge',
            html: `
              <div style="background: #7A1C28; color: #FFFFFF; font-weight: bold; font-family: monospace; font-size: 10px; padding: 3px 9px; border-radius: 12px; border: 1.5px solid #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.3); white-space: nowrap; transform: translate(-50%, -50%);">
                ${data.distance_km} km • ${data.duration_minutes} min
              </div>
            `,
            iconSize: [0, 0],
          })
          const midMarker = L.marker([midPt[1], midPt[0]], { icon: midBadgeIcon }).addTo(map)
          markerLayersRef.current.push(midMarker)
        }

        // E. Add Source Anchor Marker (Chennai RGH Hub with Static Cross and Clean Label)
        const sourceIcon = L.divIcon({
          className: 'custom-anchor-marker',
          html: `
            <div style="display: flex; align-items: center; gap: 8px; transform: translate(-14px, -14px);">
              <div style="width: 28px; height: 28px; background: #7A1C28; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #FFFFFF; font-size: 13px; font-weight: bold; line-height: 1;">✚</span>
              </div>
              <div style="background: rgba(255,255,255,0.96); padding: 3px 8px; border-radius: 6px; border: 1px solid #D5E5F0; box-shadow: 0 2px 4px rgba(0,0,0,0.12); white-space: nowrap;">
                <div style="color: #7A1C28; font-weight: 800; font-size: 10px; letter-spacing: 0.5px; font-family: sans-serif; line-height: 1.1;">CHENNAI RGH</div>
                <div style="color: #5A5451; font-weight: 600; font-size: 8px; text-transform: uppercase;">PRIMARY ANCHOR</div>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const srcMarker = L.marker([srcLat, srcLon], { icon: sourceIcon }).addTo(map)
        srcMarker.bindPopup(
          `<div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #7A1C28;">● PRIMARY ANCHOR (SURPLUS ORIGIN)</strong><br/>
            <b>${activeTransfer?.source_bank}</b><br/>
            ${activeTransfer?.source_city || 'Chennai, Tamil Nadu'}
          </div>`,
        )
        markerLayersRef.current.push(srcMarker)
        bounds.extend([srcLat, srcLon])

        // F. Add Destination Recipient Marker (Clinical Red Marker with Label)
        const destIcon = L.divIcon({
          className: 'custom-dest-marker',
          html: `
            <div style="display: flex; align-items: center; gap: 8px; transform: translate(-12px, -12px);">
              <div style="width: 24px; height: 24px; background: #DC2626; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
              </div>
              <div style="background: rgba(255,255,255,0.96); padding: 3px 8px; border-radius: 6px; border: 1px solid #D5E5F0; box-shadow: 0 2px 4px rgba(0,0,0,0.12); white-space: nowrap;">
                <div style="color: #DC2626; font-weight: 800; font-size: 10px; letter-spacing: 0.5px; font-family: sans-serif; line-height: 1.1;">
                  ${activeTransfer?.destination_bank ? activeTransfer.destination_bank.slice(0, 24) : 'Recipient'}
                </div>
                <div style="color: #5A5451; font-weight: 600; font-size: 8px; text-transform: uppercase;">RECIPIENT DESTINATION</div>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const dstMarker = L.marker([dstLat, dstLon], { icon: destIcon }).addTo(map)
        dstMarker.bindPopup(
          `<div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #DC2626;">● SHORTAGE RECIPIENT (HOSPITAL)</strong><br/>
            <b>${activeTransfer?.destination_bank}</b><br/>
            ${activeTransfer?.destination_city || 'Regional Center'}
          </div>`,
        )
        markerLayersRef.current.push(dstMarker)
        bounds.extend([dstLat, dstLon])

        // Auto-fit map to route bounds with clean framing (maxZoom: 11 ensures regional Tamil Nadu / India geographic context)
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 11,
            animate: false,
          })
        }
      })
      .catch((err) => {
        setIsLoadingRoute(false)
        setRouteError(err instanceof Error ? err.message : 'Road routing service unavailable')
      })
  }, [mapReady, activeTransferId, srcLat, srcLon, dstLat, dstLon, activeTransfer])

  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return
    if (routeLayersRef.current.length > 0) {
      const bounds = window.L.latLngBounds([])
      routeLayersRef.current.forEach((layer) => {
        if (layer.getBounds) {
          bounds.extend(layer.getBounds())
        }
      })
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 11, animate: false })
      }
    } else {
      mapInstanceRef.current.setView([anchorLat, anchorLon], 10)
    }
  }

  const handleResetToChennai = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView([13.081279, 80.27678], 10)
  }

  return (
    <div className="relative w-full h-full min-h-[680px] lg:min-h-[720px] rounded-3xl border border-[#E8E1DC] overflow-hidden bg-[#F3F4F6] shadow-2xs select-none">
      {/* Real Simple Light India Map (CartoDB Positron) */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[680px] lg:min-h-[720px] z-0" />

      {/* Loading Overlay */}
      {isLoadingRoute && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#D5E5F0] shadow-md flex items-center gap-3 text-xs text-[#1F1B19]">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#7A1C28] border-t-transparent animate-spin" />
          <span className="font-bold">Calculating corridor...</span>
        </div>
      )}

      {/* Error Banner */}
      {routeError && (
        <div className="absolute top-4 left-4 z-10 bg-[#FCECEE] px-4 py-2.5 rounded-2xl border border-[#F5D5D9] shadow-md flex items-center gap-2 text-xs text-[#7A1C28]">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>Corridor routing unavailable: {routeError}</span>
        </div>
      )}

      {/* Top-Right Active Dispatch Badge */}
      <div className="absolute top-4 right-14 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#E8E1DC] shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#7A1C28]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
          RECOMMENDED ROUTE ACTIVE
        </span>
      </div>

      {/* Compact Map Control Shortcuts (Top-Left) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-[#D5E5F0] shadow-md text-xs">
        <button
          onClick={handleFitBounds}
          className="px-3 py-1.5 hover:bg-[#FAF7F5] rounded-xl text-[#5A5451] hover:text-[#1F1B19] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
          title="Fit Route to View"
        >
          <span className="material-symbols-outlined text-[15px]">fit_screen</span>
          <span>Fit Route</span>
        </button>
        <button
          onClick={handleResetToChennai}
          className="px-3 py-1.5 hover:bg-[#FAF7F5] rounded-xl text-[#5A5451] hover:text-[#1F1B19] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
          title="Center on Chennai RGH"
        >
          <span className="material-symbols-outlined text-[15px]">center_focus_strong</span>
          <span>Chennai RGH</span>
        </button>
      </div>

      {/* Clean Compact Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-[#D5E5F0] text-[10px] space-y-1.5 shadow-md font-sans">
        <span className="font-bold text-[#1F1B19] uppercase tracking-wider block text-[9px]">
          CORRIDOR MAP LEGEND
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C28] border border-white shadow-xs" />
          <span className="text-[#1F1B19]">PRAVAH Anchor (Chennai RGH)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-white shadow-xs" />
          <span className="text-[#1F1B19]">Destination Blood Centre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded-full bg-[#7A1C28]" />
          <span className="text-[#7A1C28] font-bold">Recommended Road Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full bg-[#6B7280]" />
          <span className="text-[#7A7471]">Alternative Route</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#7A1C28]" />
          <span className="text-[#7A7471]">200 KM Service Network</span>
        </div>
      </div>
    </div>
  )
}
