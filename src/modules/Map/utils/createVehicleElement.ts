import fleetVehicleIcon from '@/icons/fleet-vehicle.svg';
import fleetAssetIcon from '@/icons/fleet-asset.svg';

export const createVehicleElement = (
  vehicleStatus: string,
  color: string,
  heading: number | null,
  entityType: string = 'vehicle'
) => {
  // Outer container for marker + pointer
  const container = document.createElement('div');
  container.style.width = '40px';
  container.style.height = '40px';
  container.style.position = 'absolute'; // Map will use this as the anchor
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';

  // Inner circle marker (radar + icon)
  const markerElement = document.createElement('div');
  markerElement.style.width = '25px';
  markerElement.style.height = '25px';
  markerElement.style.backgroundColor = color;
  markerElement.style.borderRadius = '50%';
  markerElement.style.display = 'flex';
  markerElement.style.justifyContent = 'center';
  markerElement.style.alignItems = 'center';
  markerElement.style.position = 'relative'; // relative to allow absolute child
  markerElement.className = 'marker-element';

  let iconSrc = fleetVehicleIcon;
  if (entityType === 'asset') {
    iconSrc = fleetAssetIcon;
  }

  const iconWrapper = document.createElement('div');
  iconWrapper.innerHTML = `<img src="${iconSrc}" width="18" height="18" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%)" />`;
  const iconElement = iconWrapper.firstChild as HTMLImageElement;
  iconElement.style.position = 'absolute';
  iconElement.style.top = '50%';
  iconElement.style.left = '50%';
  iconElement.style.transform = 'translate(-50%, -50%)';

  // Radar wrapper
  const radarWrapper = document.createElement('div');
  radarWrapper.style.position = 'absolute';
  radarWrapper.style.top = '0';
  radarWrapper.style.left = '0';
  radarWrapper.style.width = '100%';
  radarWrapper.style.height = '100%';
  radarWrapper.style.borderRadius = '50%';

  const radarScan = document.createElement('div');
  radarScan.style.position = 'absolute';
  radarScan.style.top = '0';
  radarScan.style.left = '0';
  radarScan.style.width = '100%';
  radarScan.style.height = '100%';
  radarScan.style.borderRadius = '50%';

  const animationName = `pulse-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  radarScan.style.animation = `${animationName} 2s infinite`;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ${animationName} {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 ${color}B3;
      }
      70% {
        transform: scale(1.1);
        box-shadow: 0 0 0 15px ${color}00;
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 ${color}00;
      }
    }
  `;
  document.head.appendChild(style);

  // Append radar + icon into circle
  radarWrapper.appendChild(radarScan);
  radarWrapper.appendChild(iconElement);
  markerElement.appendChild(radarWrapper);

  // Pointer arrow outside the circle
  const pointerWrapper = document.createElement('div');
  pointerWrapper.style.position = 'absolute';
  pointerWrapper.style.width = '100%';
  pointerWrapper.style.height = '100%';
  pointerWrapper.style.top = '0';
  pointerWrapper.style.left = '0';
  pointerWrapper.style.transform = `rotate(${heading ?? 0}deg)`;
  pointerWrapper.style.transformOrigin = '50% 50%';
  pointerWrapper.style.display = vehicleStatus === 'driving' ? 'block' : 'none';
  pointerWrapper.className = 'pointer-wrapper';

  const pointer = document.createElement('div');
  pointer.style.position = 'absolute';
  pointer.style.top = '-5px'; // push it further from the center (adjust this as needed)
  pointer.style.left = '50%';
  pointer.style.transform = 'translateX(-50%)';
  pointer.style.width = '0';
  pointer.style.height = '0';
  pointer.style.borderLeft = '5px solid transparent';
  pointer.style.borderRight = '5px solid transparent';
  pointer.style.borderBottom = `10px solid ${color}`;
  pointer.className = 'pointer-arrow';

  pointerWrapper.appendChild(pointer);
  container.appendChild(pointerWrapper);

  // Append marker to outer container
  container.appendChild(markerElement);

  return container; // this is what gets added to the map
};
