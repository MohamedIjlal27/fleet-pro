import car_alt_solid from '/src/assets/maps/car_alt_solid.svg';
import vehicle_icon from '/src/assets/maps/vehicle_icon.png';

export const createPulastingVehicleMarkerElement = () => {
  // Create a marker element for the vehicle (container)
  const markerElement = document.createElement('div');
  markerElement.style.position = 'relative';

  // Inner vehicle icon (center of the marker)
  const innerIcon = document.createElement('div');
  innerIcon.style.width = '30px';
  innerIcon.style.height = '30px';
  innerIcon.style.backgroundImage = `url(${vehicle_icon})`;
  innerIcon.style.backgroundSize = 'cover';
  innerIcon.style.borderRadius = '50%';
  innerIcon.style.position = 'absolute';
  innerIcon.style.top = '50%';
  innerIcon.style.left = '50%';
  innerIcon.style.transform = 'translate(-50%, -50%)';

  // Outer pulsating ring
  const outerCircle = document.createElement('div');
  outerCircle.style.width = '70px'; // Larger than the icon
  outerCircle.style.height = '70px';
  outerCircle.style.borderRadius = '50%';
  outerCircle.style.backgroundColor = 'rgba(5, 172, 92, 0.3)';
  outerCircle.style.position = 'absolute';
  outerCircle.style.top = '50%';
  outerCircle.style.left = '50%';
  outerCircle.style.transform = 'translate(-50%, -50%)';
  outerCircle.style.animation = 'pulse 2s infinite ease-out';

  // Pulsing animation
  const styles = `
    @keyframes pulse {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
        }
    }
  `;

  // Append animation styles to the document head
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Append the icon and the ring to the marker element
  markerElement.appendChild(outerCircle);
  markerElement.appendChild(innerIcon);

  return markerElement;
};
