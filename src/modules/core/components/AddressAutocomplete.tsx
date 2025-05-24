/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { TextField } from '@mui/material';
import { loadGoogleMaps } from '../../../utils/loadGoogleMaps';
import { Search } from 'lucide-react';
declare global {
  interface Window {
    google: any;
  }
}

interface AddressAutocompleteProps {
  onAddressChange: (address: string) => void;
  initialAddress: string;
  placeholder?: string;
  containerClassName?: string;
  showSearchIcon?: boolean;
  iconClassName?: string;
  inputClassName?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressChange,
  initialAddress,
  placeholder,
  containerClassName,
  showSearchIcon,
  iconClassName,
  inputClassName,
}) => {
  const [googleMaps, setGoogleMaps] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    loadGoogleMaps().then((google) => {
      setGoogleMaps(google);
    });
    setAddress(initialAddress);
  }, [initialAddress]);

  // useEffect(() => {
  //   setAddress(initialAddress); // Update address state when initialAddress changes
  //   console.log("initialAddress", initialAddress);
  // }, [initialAddress]);

  useEffect(() => {
    if (googleMaps && inputRef.current) {
      const autocomplete = new googleMaps.places.Autocomplete(inputRef.current, {
        types: ['address'], // Restrict the search to addresses
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place) {
          setAddress(place.formatted_address); // Update address state with selected place
          onAddressChange(place); // Notify parent component
        }
      });
    }
  }, [inputRef.current, googleMaps]);

  return (
    <div className={`${containerClassName ?? ''}`}>
      {showSearchIcon && <Search className={`${iconClassName ?? ''}`} />}
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder ?? 'Enter an address'}
        value={address ?? ''} // Set the value to the address state
        onChange={(e) => {
          setAddress(e.target.value); // Update address state on input change
          onAddressChange(e.target.value); // Call onAddressChange with the new value
        }}
        // style={{ width: '100%', padding: '8px' }}
        className={`${
          inputClassName ??
          'w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
        }`}
      />
    </div>
  );
};

export default AddressAutocomplete;
