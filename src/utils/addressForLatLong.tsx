import React, { useState, useEffect } from 'react';
import axios from 'axios'; //purposefully using axios instead of axiosInstance, please don't change

interface LocationAddressProps {
  latitude: number;
  longitude: number;
}

const LocationAddress: React.FC<LocationAddressProps> = ({
  latitude,
  longitude,
}) => {
  const [address, setAddress] = useState<string>('Fetching address...');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // Mapbox
        // const response = await axios.get(
        //   //`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&types=address`
        //   `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
        // );
        // console.log("fetchAddress response.data",response.data);
        // const features = response.data.features;

        // if (features && features.length > 0) {
        //   setAddress(features[0].properties?.full_address || 'Address not available');
        // } else {
        //   setAddress('Address not found');
        // }

        // Google Map
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        //console.log("fetchAddress response.data",response.data);
        const results = response.data.results;

        if (results && results.length > 0) {
          setAddress(results[0].formatted_address || 'Address not available');
        } else {
          setAddress('Address not found');
        }
      } catch (err) {
        console.error('Error fetching address:', err);
        setError(true);
        setAddress('Failed to fetch address');
      }
    };

    fetchAddress();
  }, [latitude, longitude]);

  return (
    <p
      className="text-sm"
      style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
    >
      {error ? 'Failed to fetch address' : address}
    </p>
  );
};

export default LocationAddress;
