import garageIcon from '/src/assets/maps/garage_icon.png';

export const createGarageMarkerElement = () => {
  // Create a marker element for the garage (using an icon)
  const markerElement = document.createElement('div');
  markerElement.style.width = '50px';
  markerElement.style.height = '50px';
  markerElement.style.backgroundImage = `url(${garageIcon})`;
  markerElement.style.backgroundSize = 'cover';
  markerElement.style.borderRadius = '50%';
  return markerElement;
};
