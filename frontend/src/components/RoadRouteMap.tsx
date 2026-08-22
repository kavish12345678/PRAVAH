import { useEffect, useRef, useState } from 'react'
import { fetchRoadRoute } from '../services/api'
import type { MultiStopConsolidationCandidate, TransferItem } from '../types'

declare global {
  interface Window {
    L?: any
  }
}

interface RoadRouteMapProps {
  mode?: 'direct' | 'multistop'
  activePlanView?: 'direct' | 'multistop'
  // Direct Mode Props
  activeTransfer?:
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
  onRouteCalculated?: (data: {
    roadDistanceKm: number
    durationMin: number
    provider: string
    isCalculating: boolean
    isError: boolean
  }) => void

  // Multi-Stop Mode Props
  activeConsolidation?: MultiStopConsolidationCandidate | null
  alternativeConsolidations?: MultiStopConsolidationCandidate[]
  onSelectConsolidation?: (id: string) => void
}

export function RoadRouteMap({
  mode = 'direct',
  activePlanView = 'multistop',
  activeTransfer,
  alternativeTransfers = [],
  onSelectTransfer,
  onRouteCalculated,
  activeConsolidation,
  alternativeConsolidations = [],
  onSelectConsolidation,
}: RoadRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayersRef = useRef<any[]>([])
  const markerLayersRef = useRef<any[]>([])
  const circleLayerRef = useRef<any>(null)
  const renderedRouteKeyRef = useRef<string | null>(null)

  // Stable callback refs
  const onRouteCalculatedRef = useRef(onRouteCalculated)
  onRouteCalculatedRef.current = onRouteCalculated

  const onSelectTransferRef = useRef(onSelectTransfer)
  onSelectTransferRef.current = onSelectTransfer

  const onSelectConsolidationRef = useRef(onSelectConsolidation)
  onSelectConsolidationRef.current = onSelectConsolidation

  const alternativeTransfersRef = useRef(alternativeTransfers)
  alternativeTransfersRef.current = alternativeTransfers

  const alternativeConsolidationsRef = useRef(alternativeConsolidations)
  alternativeConsolidationsRef.current = alternativeConsolidations

  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState<boolean>(false)

  // Base coordinates for Chennai RGH Anchor
  const anchorLat = 13.081279
  const anchorLng = 80.27678

  const srcLat = activeTransfer?.source_lat ?? anchorLat
  const srcLng = activeTransfer?.source_lon ?? anchorLng
  const dstLat = activeTransfer?.destination_lat ?? 13.085
  const dstLng = activeTransfer?.destination_lon ?? 80.28
  const activeTransferId = activeTransfer?.id ?? null

  // 1. Initialize Leaflet Map once with CartoDB Positron Plain Minimalist Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = () => {
      const L = window.L
      if (!L || mapInstanceRef.current) return

      const map = L.map(mapContainerRef.current, {
        center: [anchorLat, anchorLng],
        zoom: 12,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
      })

      // Add Clean Plain Map Tiles (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Add 200 KM Service Radius Boundary Circle
      const circle = L.circle([anchorLat, anchorLng], {
        radius: 200000,
        color: '#7A1C28',
        weight: 1.5,
        dashArray: '6, 8',
        fillColor: '#7A1C28',
        fillOpacity: 0.025,
        interactive: false,
      }).addTo(map)
      circleLayerRef.current = circle

      mapInstanceRef.current = map
      setMapReady(true)

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 150)
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

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [anchorLat, anchorLng])

  // 2. Render Direct Route OR Multi-Stop Consolidation Route
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    const L = window.L
    if (!L) return

    const map = mapInstanceRef.current
    map.invalidateSize()

    // ----------------------------------------------------
    // MODE A: MULTI-STOP CONSOLIDATION MODE
    // ----------------------------------------------------
    if (mode === 'multistop') {
      if (!activeConsolidation) return

      const currentKey = `multistop:${activeConsolidation.id}:${activePlanView}`
      if (renderedRouteKeyRef.current === currentKey) return

      // Clear previous layers
      routeLayersRef.current.forEach((layer) => map.removeLayer(layer))
      routeLayersRef.current = []
      markerLayersRef.current.forEach((marker) => map.removeLayer(marker))
      markerLayersRef.current = []

      renderedRouteKeyRef.current = currentKey
      setIsLoadingRoute(true)
      setRouteError(null)

      const bounds = L.latLngBounds([])

      // Origin Primary Anchor Marker (Chennai RGH - START)
      const originIcon = L.divIcon({
        className: 'origin-anchor-marker',
        html: `<div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          padding: 4px 10px 4px 6px;
          border-radius: 9999px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          border: 2px solid #7A1C28;
          white-space: nowrap;
          cursor: pointer;
        ">
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #7A1C28;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 13px;
          ">+</div>
          <div style="line-height: 1.15;">
            <span style="font-size: 10.5px; font-weight: 900; color: #7A1C28; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">
              ● PRAVAH ANCHOR
            </span>
            <span style="font-size: 8.5px; color: #1F1B19; display: block; font-weight: 700;">
              Chennai RGH (START)
            </span>
          </div>
        </div>`,
        iconSize: [165, 30],
        iconAnchor: [22, 15],
      })

      const originMarker = L.marker([anchorLat, anchorLng], { icon: originIcon, zIndexOffset: 1000 }).addTo(map)
      originMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <span style="color: #7A1C28; font-weight: bold; font-size: 10px; text-transform: uppercase;">
            PRIMARY DISPATCH ANCHOR (START)
          </span>
          <div style="font-weight: bold; margin-top: 2px;">Government Rajiv Gandhi Medical College Hospital</div>
          <div style="color: #166534; font-weight: bold; margin-top: 3px;">
            Loading Total: ${activeConsolidation.total_units} Units ${activeConsolidation.blood_group} ${activeConsolidation.component}
          </div>
          <div style="color: #5A5451; font-size: 11px; margin-top: 3px;">
            Consolidated Single-Van Delivery Loop (${activeConsolidation.stops.length} Hospital Destinations)
          </div>
        </div>
      `)
      markerLayersRef.current.push(originMarker)
      bounds.extend([anchorLat, anchorLng])

      // IF USER IS VIEWING DIRECT PLAN ON MAP (FAN-OUT DIRECT ROUTES)
      if (activePlanView === 'direct') {
        const directPromises = activeConsolidation.stops.map((stop) =>
          fetchRoadRoute(anchorLat, anchorLng, stop.latitude, stop.longitude, false)
            .then((res) => ({
              stop,
              distance_km: res.distance_km,
              duration_min: res.duration_minutes,
              coordinates: res.geometry?.coordinates || [],
            }))
            .catch(() => ({
              stop,
              distance_km: stop.leg_distance_km,
              duration_min: stop.leg_duration_min,
              coordinates: [
                [anchorLng, anchorLat],
                [stop.longitude, stop.latitude],
              ],
            })),
        )

        Promise.all(directPromises).then((legs) => {
          setIsLoadingRoute(false)
          legs.forEach((leg, idx) => {
            const latLngs: [number, number][] = leg.coordinates.map(
              (pt: any) => [pt[1], pt[0]] as [number, number],
            )

            if (latLngs.length > 0) {
              // Base white outline
              const outlinePoly = L.polyline(latLngs, {
                color: '#FFFFFF',
                weight: 7.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map)
              routeLayersRef.current.push(outlinePoly)

              // Direct road route
              const directPoly = L.polyline(latLngs, {
                color: '#7A1C28',
                weight: 4.5,
                opacity: 0.9,
                dashArray: idx % 2 === 1 ? '4, 4' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map)

              directPoly.bindPopup(`
                <div style="font-family: sans-serif; font-size: 11px;">
                  <strong style="color: #7A1C28;">Direct Dispatch Trip #${idx + 1}</strong><br/>
                  Destination: <b>${leg.stop.name}</b><br/>
                  Road Distance: <b>${leg.distance_km} km</b> · Transit: <b>${leg.duration_min} min</b>
                </div>
              `)
              routeLayersRef.current.push(directPoly)
              latLngs.forEach((pt) => bounds.extend(pt))
            }

            // Destination Marker
            const destIcon = L.divIcon({
              className: `direct-dest-marker-${idx}`,
              html: `<div style="
                display: flex;
                align-items: center;
                gap: 5px;
                background: #FFFFFF;
                padding: 4px 8px 4px 6px;
                border-radius: 9999px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.22);
                border: 1.5px solid #7A1C28;
                white-space: nowrap;
                cursor: pointer;
              ">
                <div style="
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #7A1C28;
                  color: #FFFFFF;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 800;
                  font-size: 10px;
                ">▼</div>
                <div style="line-height: 1.15;">
                  <span style="font-size: 9.5px; font-weight: 800; color: #7A1C28; text-transform: uppercase; font-family: monospace;">
                    ${leg.stop.name}
                  </span>
                  <span style="font-size: 8px; color: #5A5451; display: block; font-weight: 600;">
                    DIRECT: ${leg.distance_km} KM (${leg.duration_min}m)
                  </span>
                </div>
              </div>`,
              iconSize: [165, 28],
              iconAnchor: [18, 14],
            })

            const marker = L.marker([leg.stop.latitude, leg.stop.longitude], { icon: destIcon }).addTo(map)
            markerLayersRef.current.push(marker)
            bounds.extend([leg.stop.latitude, leg.stop.longitude])
          })

          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 })
          }
        })
        return
      }

      // ----------------------------------------------------
      // CONSOLIDATED MULTI-STOP LOOP ON MAP
      // ----------------------------------------------------
      // Build consecutive point pairs: [Anchor -> Stop1], [Stop1 -> Stop2], [Stop2 -> Stop3]
      const stopPoints = [
        { lat: anchorLat, lon: anchorLng, name: 'Chennai RGH (Anchor)' },
        ...activeConsolidation.stops.map((s) => ({ lat: s.latitude, lon: s.longitude, name: s.name })),
      ]

      const legPromises: Promise<{
        legIndex: number
        fromName: string
        toName: string
        coordinates: [number, number][]
        distance_km: number
        duration_min: number
      }>[] = []

      for (let i = 0; i < stopPoints.length - 1; i++) {
        const fromPt = stopPoints[i]
        const toPt = stopPoints[i + 1]
        const legIdx = i

        legPromises.push(
          fetchRoadRoute(fromPt.lat, fromPt.lon, toPt.lat, toPt.lon, false)
            .then((res) => ({
              legIndex: legIdx,
              fromName: fromPt.name,
              toName: toPt.name,
              coordinates: (res.geometry?.coordinates || []) as [number, number][],
              distance_km: res.distance_km,
              duration_min: res.duration_minutes,
            }))
            .catch(() => {
              const stopFallback = activeConsolidation.stops[legIdx]
              return {
                legIndex: legIdx,
                fromName: fromPt.name,
                toName: toPt.name,
                coordinates: [
                  [fromPt.lon, fromPt.lat],
                  [toPt.lon, toPt.lat],
                ] as [number, number][],
                distance_km: stopFallback?.leg_distance_km || 3.5,
                duration_min: stopFallback?.leg_duration_min || 12.0,
              }
            }),
        )
      }

      Promise.all(legPromises).then((legs) => {
        setIsLoadingRoute(false)

        legs.forEach((leg) => {
          const latLngs: [number, number][] = leg.coordinates.map(
            (pt: any) => [pt[1], pt[0]] as [number, number],
          )

          if (latLngs.length > 0) {
            // 1. Subtle crisp white outline beneath the road for contrast on plain map
            const whiteOutlineLayer = L.polyline(latLngs, {
              color: '#FFFFFF',
              weight: 8.5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
              interactive: false,
            }).addTo(map)
            routeLayersRef.current.push(whiteOutlineLayer)

            // 2. Solid thick maroon road polyline (static, no animation)
            const legPolyLayer = L.polyline(latLngs, {
              color: '#7A1C28',
              weight: 5.2,
              opacity: 1.0,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map)

            legPolyLayer.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
                <span style="color: #7A1C28; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                  LEG ${leg.legIndex + 1}: ${leg.fromName} → ${leg.toName}
                </span>
                <div style="font-weight: bold; margin-top: 2px;">Road Distance: ${leg.distance_km} km</div>
                <div style="color: #7A1C28; font-weight: bold; margin-top: 2px;">Estimated Transit: ${leg.duration_min} min</div>
              </div>
            `)
            routeLayersRef.current.push(legPolyLayer)
            latLngs.forEach((pt) => bounds.extend(pt))

            // 3. Floating Leg Metric Badge at Midpoint of each Leg
            if (latLngs.length >= 3) {
              const midIdx = Math.floor(latLngs.length / 2)
              const midPt = latLngs[midIdx]
              if (midPt) {
                const legBadgeIcon = L.divIcon({
                  className: `leg-badge-${leg.legIndex}`,
                  html: `<div style="
                    background: #FFFFFF;
                    color: #7A1C28;
                    font-family: monospace;
                    font-size: 9.5px;
                    font-weight: 800;
                    padding: 2.5px 7px;
                    border-radius: 9999px;
                    border: 1.5px solid #7A1C28;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
                    white-space: nowrap;
                    transform: translate(-50%, -50%);
                  ">LEG ${leg.legIndex + 1}: ${leg.distance_km} km · ${leg.duration_min}m</div>`,
                  iconSize: [120, 20],
                  iconAnchor: [60, 10],
                })
                const badgeMarker = L.marker(midPt, {
                  icon: legBadgeIcon,
                  interactive: false,
                  zIndexOffset: 500,
                }).addTo(map)
                markerLayersRef.current.push(badgeMarker)
              }
            }
          }
        })

        // 4. Numbered Stop Markers along the Route (① Stop 1, ② Stop 2, ③ Stop 3)
        activeConsolidation.stops.forEach((stop) => {
          const stopNumberIcons = ['①', '②', '③', '④', '⑤', '⑥']
          const numberSymbol = stopNumberIcons[stop.stop_number - 1] || `${stop.stop_number}`

          const stopIcon = L.divIcon({
            className: `stop-marker-${stop.stop_number}`,
            html: `<div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: #FFFFFF;
              padding: 4px 10px 4px 6px;
              border-radius: 9999px;
              box-shadow: 0 3px 10px rgba(0,0,0,0.25);
              border: 2px solid #DC2626;
              white-space: nowrap;
              cursor: pointer;
            ">
              <div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #DC2626;
                color: #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                font-size: 11.5px;
              ">${numberSymbol}</div>
              <div style="line-height: 1.15;">
                <span style="font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase; font-family: monospace;">
                  STOP ${stop.stop_number}: ${stop.name}
                </span>
                <span style="font-size: 8.5px; color: #166534; display: block; font-weight: 700;">
                  DROP: ${stop.quantity} UNITS · LEG: ${stop.leg_distance_km} KM (${stop.leg_duration_min}m)
                </span>
              </div>
            </div>`,
            iconSize: [175, 30],
            iconAnchor: [22, 15],
          })

          const stopMarker = L.marker([stop.latitude, stop.longitude], {
            icon: stopIcon,
            zIndexOffset: 900 + stop.stop_number,
          }).addTo(map)

          stopMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <span style="color: #DC2626; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                CONSOLIDATED STOP #${stop.stop_number}
              </span>
              <div style="font-weight: bold; margin-top: 2px; font-size: 13px;">${stop.name}</div>
              <div style="color: #166534; font-weight: bold; margin-top: 4px;">
                Receiving: ${stop.quantity} Units ${stop.blood_group} ${stop.component}
              </div>
              <div style="color: #5A5451; font-size: 11px; margin-top: 4px; border-top: 1px solid #FAF7F5; pt-2;">
                <div>Leg from Previous: <b>${stop.leg_distance_km} km · ${stop.leg_duration_min} min</b></div>
                <div>Cumulative from Anchor: <b>${stop.cumulative_distance_km} km · ${stop.cumulative_duration_min} min</b></div>
              </div>
            </div>
          `)
          markerLayersRef.current.push(stopMarker)
          bounds.extend([stop.latitude, stop.longitude])
        })

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 })
        }
      })

      return
    }

    // ----------------------------------------------------
    // MODE B: DIRECT DISPATCH ROUTE MODE
    // ----------------------------------------------------
    if (!activeTransferId) return

    const currentKey = `direct:${activeTransferId}:${srcLat.toFixed(5)},${srcLng.toFixed(5)}->${dstLat.toFixed(5)},${dstLng.toFixed(5)}`
    if (renderedRouteKeyRef.current === currentKey) return

    // Clear previous routes & markers
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer))
    routeLayersRef.current = []
    markerLayersRef.current.forEach((marker) => map.removeLayer(marker))
    markerLayersRef.current = []

    setIsLoadingRoute(true)
    setRouteError(null)

    if (onRouteCalculatedRef.current) {
      onRouteCalculatedRef.current({
        roadDistanceKm: 0,
        durationMin: 0,
        provider: 'OSRM',
        isCalculating: true,
        isError: false,
      })
    }

    fetchRoadRoute(srcLat, srcLng, dstLat, dstLng, true)
      .then((data) => {
        renderedRouteKeyRef.current = currentKey
        setIsLoadingRoute(false)

        if (onRouteCalculatedRef.current) {
          onRouteCalculatedRef.current({
            roadDistanceKm: data.distance_km,
            durationMin: data.duration_minutes,
            provider: data.provider,
            isCalculating: false,
            isError: false,
          })
        }

        const bounds = L.latLngBounds([])
        const rawCoords: [number, number][] = data.geometry?.coordinates || []
        const primaryLatLngs: [number, number][] = rawCoords.map(([lon, lat]: [number, number]) => [lat, lon])

        // A. Draw Alternative Routes
        if (data.alternatives && data.alternatives.length > 0) {
          const currentAlts = alternativeTransfersRef.current
          data.alternatives.slice(0, 2).forEach((alt, idx) => {
            const altLatLngs: [number, number][] = (alt.geometry?.coordinates || []).map(
              ([lon, lat]: [number, number]) => [lat, lon],
            )

            if (altLatLngs.length > 0) {
              const altLayer = L.polyline(altLatLngs, {
                color: idx === 0 ? '#4B5563' : '#6B7280',
                weight: idx === 0 ? 3.5 : 2.5,
                opacity: idx === 0 ? 0.6 : 0.45,
                dashArray: '6, 6',
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map)

              const matchingAlt = currentAlts[idx]
              altLayer.bindPopup(
                `<div style="font-family: sans-serif; font-size: 11px;">
                  <strong>Alternative Road Route ${matchingAlt ? `#${matchingAlt.id}` : ''}</strong><br/>
                  Distance: <b>${alt.distance_km} km</b><br/>
                  Transit Time: <b>${alt.duration_minutes} min</b>
                </div>`,
              )
              if (matchingAlt && onSelectTransferRef.current) {
                altLayer.on('click', () => onSelectTransferRef.current?.(matchingAlt.id))
              }
              routeLayersRef.current.push(altLayer)
            }
          })
        }

        // B. Draw Recommended Road Route (Thick Solid Maroon with white outline)
        if (primaryLatLngs.length > 0) {
          const outlineLayer = L.polyline(primaryLatLngs, {
            color: '#FFFFFF',
            weight: 8.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)
          routeLayersRef.current.push(outlineLayer)

          const primaryLayer = L.polyline(primaryLatLngs, {
            color: '#7A1C28',
            weight: 5.0,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
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
                Road Distance: <b>${data.distance_km} km</b><br/>
                Estimated Transit: <b>${data.duration_minutes} min</b>
              </div>
            </div>`,
          )
          routeLayersRef.current.push(primaryLayer)
          primaryLatLngs.forEach((latlng) => bounds.extend(latlng))
        }

        // C. Midpoint Floating Metric Badge
        if (primaryLatLngs.length >= 4) {
          const midIdx = Math.floor(primaryLatLngs.length / 2)
          const midPt = primaryLatLngs[midIdx]
          if (midPt) {
            const distancePillIcon = L.divIcon({
              className: 'route-distance-pill',
              html: `<div style="
                background: #FFFFFF;
                color: #7A1C28;
                font-family: monospace;
                font-size: 10px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 9999px;
                border: 1.5px solid #7A1C28;
                box-shadow: 0 2px 6px rgba(0,0,0,0.18);
                white-space: nowrap;
                transform: translate(-50%, -50%);
              ">${data.distance_km} km · ${data.duration_minutes} min</div>`,
              iconSize: [110, 22],
              iconAnchor: [55, 11],
            })
            const pillMarker = L.marker(midPt, {
              icon: distancePillIcon,
              interactive: false,
            }).addTo(map)
            markerLayersRef.current.push(pillMarker)
          }
        }

        // D. Origin Primary Anchor Marker (Chennai RGH)
        const originIcon = L.divIcon({
          className: 'origin-anchor-marker',
          html: `<div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #FFFFFF;
            padding: 4px 8px 4px 6px;
            border-radius: 9999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.22);
            border: 1.5px solid #7A1C28;
            white-space: nowrap;
            cursor: pointer;
          ">
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #7A1C28;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
            ">+</div>
            <div style="line-height: 1.1;">
              <span style="font-size: 10px; font-weight: 800; color: #7A1C28; text-transform: uppercase; font-family: monospace;">
                ${activeTransfer?.source_bank || 'CHENNAI RGH'}
              </span>
              <span style="font-size: 8.5px; color: #5A5451; display: block; font-weight: 600;">
                PRIMARY ANCHOR
              </span>
            </div>
          </div>`,
          iconSize: [140, 28],
          iconAnchor: [20, 14],
        })

        const originMarker = L.marker([srcLat, srcLng], { icon: originIcon }).addTo(map)
        originMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #7A1C28;">${activeTransfer?.source_bank || 'Government Rajiv Gandhi Medical College Hospital'}</strong><br/>
            <span>Primary Regional Anchor</span><br/>
            <span style="color: #166534; font-weight: bold;">Verified Surplus Hub</span>
          </div>
        `)
        markerLayersRef.current.push(originMarker)
        bounds.extend([srcLat, srcLng])

        // E. Destination Hospital Marker
        const destIcon = L.divIcon({
          className: 'dest-hospital-marker',
          html: `<div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #FFFFFF;
            padding: 4px 8px 4px 6px;
            border-radius: 9999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.22);
            border: 1.5px solid #DC2626;
            white-space: nowrap;
            cursor: pointer;
          ">
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #DC2626;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 10px;
            ">▼</div>
            <div style="line-height: 1.1;">
              <span style="font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase; font-family: monospace;">
                ${activeTransfer?.destination_bank || 'DESTINATION'}
              </span>
              <span style="font-size: 8.5px; color: #5A5451; display: block; font-weight: 600;">
                DESTINATION
              </span>
            </div>
          </div>`,
          iconSize: [150, 28],
          iconAnchor: [20, 14],
        })

        const destMarker = L.marker([dstLat, dstLng], { icon: destIcon }).addTo(map)
        destMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #DC2626;">${activeTransfer?.destination_bank || 'Recipient Hospital'}</strong><br/>
            <span>Shortage Relief Recipient</span><br/>
            <span style="color: #7A1C28; font-weight: bold;">
              Transferring: ${activeTransfer?.quantity} Units ${activeTransfer?.blood_group} ${activeTransfer?.component}
            </span>
          </div>
        `)
        markerLayersRef.current.push(destMarker)
        bounds.extend([dstLat, dstLng])

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
        }
      })
      .catch((err) => {
        setIsLoadingRoute(false)
        setRouteError(err?.message || 'Failed to compute road route')
        if (onRouteCalculatedRef.current) {
          onRouteCalculatedRef.current({
            roadDistanceKm: 0,
            durationMin: 0,
            provider: 'None',
            isCalculating: false,
            isError: true,
          })
        }
      })
  }, [
    mapReady,
    mode,
    activePlanView,
    activeTransferId,
    srcLat,
    srcLng,
    dstLat,
    dstLng,
    activeTransfer,
    activeConsolidation,
  ])

  // Map Controls
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.invalidateSize()
    if (mode === 'multistop' && activeConsolidation) {
      const bounds = window.L?.latLngBounds([[anchorLat, anchorLng]])
      activeConsolidation.stops.forEach((s) => bounds?.extend([s.latitude, s.longitude]))
      if (bounds) mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 })
    } else {
      const bounds = window.L?.latLngBounds([
        [srcLat, srcLng],
        [dstLat, dstLng],
      ])
      if (bounds) mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }

  const handleResetToChennai = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.invalidateSize()
    mapInstanceRef.current.setView([anchorLat, anchorLng], 12)
  }

  return (
    <div className="relative w-full h-[480px] lg:h-[500px] rounded-3xl border border-[#E8E1DC] overflow-hidden bg-[#FAF7F5] shadow-2xs select-none">
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {isLoadingRoute && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#D5E5F0] shadow-md flex items-center gap-3 text-xs text-[#1F1B19]">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#7A1C28] border-t-transparent animate-spin" />
          <span className="font-bold">Calculating real road route...</span>
        </div>
      )}

      {/* Error Banner */}
      {routeError && (
        <div className="absolute top-4 left-4 z-10 bg-[#FCECEE] px-4 py-2.5 rounded-2xl border border-[#F5D5D9] shadow-md flex items-center gap-2 text-xs text-[#7A1C28]">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>Road route temporarily unavailable</span>
        </div>
      )}

      {/* Top-Right Active Dispatch Badge */}
      <div className="absolute top-4 right-14 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#E8E1DC] shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#7A1C28]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C28] font-mono">
          {mode === 'multistop'
            ? activePlanView === 'direct'
              ? 'DIRECT DISPATCH ROUTES'
              : `MULTI-STOP: ${activeConsolidation?.option_name || 'CONSOLIDATED LOOP'}`
            : isLoadingRoute
            ? 'CALCULATING REAL ROAD ROUTE...'
            : routeError
            ? 'ROUTE UNAVAILABLE'
            : 'ROAD ROUTE CALCULATED'}
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
          {mode === 'multistop'
            ? activePlanView === 'direct'
              ? 'DIRECT DISPATCH MAP'
              : 'MULTI-STOP MAP'
            : 'CORRIDOR MAP LEGEND'}
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C28] border border-white shadow-xs" />
          <span className="text-[#1F1B19]">● PRAVAH Anchor (Chennai RGH)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-white shadow-xs" />
          <span className="text-[#1F1B19]">
            {mode === 'multistop' && activePlanView === 'multistop'
              ? '① Stop 1, ② Stop 2, ③ Stop 3'
              : 'Recipient Facilities'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded-full bg-[#7A1C28] border border-white" />
          <span className="text-[#7A1C28] font-bold">
            {mode === 'multistop' && activePlanView === 'multistop'
              ? '━━ Recommended Multi-Stop Route'
              : '━━ Road Route Corridor'}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#7A1C28]" />
          <span className="text-[#7A7471]">200 KM Service Network</span>
        </div>
      </div>
    </div>
  )
}
