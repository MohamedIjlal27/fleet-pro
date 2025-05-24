
/* eslint-disable */
export function loadGoogleMaps(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
            // Google Maps is already loaded
            resolve(window.google.maps);
            return;
        }

        const existingScript = document.getElementById('googleMapsScript');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.google.maps));
            return;
        }

        const script = document.createElement('script');
        script.id = 'googleMapsScript';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = (error) => reject(error);

        document.head.appendChild(script);
    });
}

export function getLocationDetails(place: any) {
    const locationDetails = {
        city: '',
        province: '',  
        postalCode: '',
        country: '',
        place_id: '',
        formatted_address: '',
        latitude: 0,
        longitude: 0,
    };

    if (!place || !place.address_components) {
        return locationDetails;
    }
    locationDetails.place_id = place.place_id;
    locationDetails.formatted_address = place.formatted_address;
    locationDetails.latitude = place.geometry.location.lat();
    locationDetails.longitude = place.geometry.location.lng();

    // eslint-disable-next-line
    place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('locality')) {
            locationDetails.city = component.long_name;
        }

        if (types.includes('administrative_area_level_1')) {
            locationDetails.province = component.long_name;
        }

        if (types.includes('postal_code')) {
            locationDetails.postalCode = component.long_name;
        }

        if (types.includes('country')) {
            locationDetails.country = component.long_name;
        }
    });
    console.log("locationDetails", locationDetails);
    return locationDetails;
}
