import { Box } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { fetchAllPins, fetchAllPinTypes, type Pin, type PinType } from "@/api/pin";

export default function HomePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinTypes, setPinTypes] = useState<PinType[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedPins, fetchedPinTypes] = await Promise.all([
          fetchAllPins(),
          fetchAllPinTypes(),
        ]);
        setPins(fetchedPins);
        setPinTypes(fetchedPinTypes);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY || "";

    const map = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_API_KEY}`,
      center: [105.8521, 21.0227],
      zoom: 13,
      maxBounds: [[102.14441, 6.5], [118.0, 23.5]],
      minZoom: 5
    });

    map.on('style.load', () => {
      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          // Hide all default Point of Interest markers and layers with icons
          if (layer.id.includes('poi') || (layer.layout && layer.layout['icon-image'])) {
            try {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
            } catch (err) {
              // Ignore errors if property can't be set
            }
          }
        });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || pins.length === 0 || pinTypes.length === 0) return;

    const markers: vietmapgl.Marker[] = [];

    // Map pinTypeId to PinType for quick lookup
    const pinTypeMap = new Map(pinTypes.map(pt => [pt.id, pt]));

    pins.forEach((pin) => {
      const pinType = pinTypeMap.get(pin.type_id);
      
      // Create a custom DOM element for the marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      const pinBody = document.createElement('div');
      // Create a map marker teardrop shape using CSS
      pinBody.style.width = '36px';
      pinBody.style.height = '36px';
      pinBody.style.background = 'var(--chakra-colors-green-500, #48BB78)';
      pinBody.style.border = '3px solid white';
      pinBody.style.borderRadius = '50% 50% 50% 0';
      pinBody.style.transform = 'rotate(-45deg)';
      pinBody.style.display = 'flex';
      pinBody.style.alignItems = 'center';
      pinBody.style.justifyContent = 'center';
      pinBody.style.boxShadow = '-2px 2px 5px rgba(0,0,0,0.3)';
      pinBody.style.cursor = 'pointer';
      pinBody.style.transition = 'transform 0.2s';
      
      // Hover effect
      el.addEventListener('mouseenter', () => pinBody.style.transform = 'rotate(-45deg) scale(1.1)');
      el.addEventListener('mouseleave', () => pinBody.style.transform = 'rotate(-45deg) scale(1)');

      const iconElement = document.createElement('div');
      iconElement.style.transform = 'rotate(45deg)';
      iconElement.style.fontSize = '18px';
      iconElement.style.userSelect = 'none';
      iconElement.innerHTML = pinType?.icon || '🍀';

      pinBody.appendChild(iconElement);
      el.appendChild(pinBody);

      // Create popup
      const popup = new vietmapgl.Popup({ offset: [0, -40] }).setHTML(`
        <div style="padding: 5px; color: black;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${pin.name}</h3>
          <p style="margin: 0; font-size: 12px;">${pin.address}</p>
        </div>
      `);

      // Add marker to map
      const marker = new vietmapgl.Marker({ element: el })
        .setLngLat([pin.long, pin.lat]) // [longitude, latitude]
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [pins, pinTypes]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Navbar />
      <Box flex="1" position="relative">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      </Box>
    </Box>
  );
}

