
export const createMarkerElement = (color: string = '#3367D6') => {
    // Create a marker element for live location (blue circle with transparent ring)
    const markerElement = document.createElement('div');
    markerElement.style.position = 'relative';

    // Inner blue circle (live location center)
    const innerCircle = document.createElement('div');
    innerCircle.style.width = '12px';
    innerCircle.style.height = '12px';
    innerCircle.style.backgroundColor = color;
    innerCircle.style.borderRadius = '50%';
    innerCircle.style.position = 'absolute';
    innerCircle.style.top = '50%';
    innerCircle.style.left = '50%';
    innerCircle.style.transform = 'translate(-50%, -50%)';

    // Outer transparent circle (pulsating ring)
    const outerCircle = document.createElement('div');
    outerCircle.style.width = '30px';
    outerCircle.style.height = '30px';
    outerCircle.style.borderRadius = '50%';
    outerCircle.style.backgroundColor = 'rgba(66, 133, 244, 0.3)';
    outerCircle.style.position = 'absolute';
    outerCircle.style.top = '50%';
    outerCircle.style.left = '50%';
    outerCircle.style.transform = 'translate(-50%, -50%)';
    outerCircle.style.animation = 'pulse 2s infinite ease-out';

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
    .marker {
        width: 30px; /* Adjust size as needed */
        height: 30px; /* Adjust size as needed */
        background-color: red; /* Marker color */
        border-radius: 50%; /* Make it circular */
        position: relative;
        animation: pulse 1.5s infinite; /* Apply the pulse animation */
    }
`;

    // Create a style element and append it to the head
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;

    // Append the circles to the marker element
    markerElement.appendChild(outerCircle);
    markerElement.appendChild(innerCircle);
    document.head.appendChild(styleSheet);
    return markerElement;
}


