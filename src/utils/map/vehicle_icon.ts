import vehicle_icon from '/src/assets/maps/vehicle_icon.png';

export const createVehicleMarkerElement = () => {
  // Create a marker element for the garage (using an icon)
  const markerElement = document.createElement('div');
  markerElement.style.width = '50px';
  markerElement.style.height = '50px';
  markerElement.style.backgroundImage = `url(${vehicle_icon})`;
  markerElement.style.backgroundSize = 'cover';
  markerElement.style.borderRadius = '50%';
  return markerElement;
};
