import { useState } from 'react';
import AddressAutocomplete from '../../../core/components/AddressAutocomplete';
import { TextField, Grid } from '@mui/material';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { IOrganization } from '../interfaces/organization.interface';
import { getLocationDetails } from '../../../../utils/loadGoogleMaps';


interface OrganizationModalProps {
  organization: IOrganization | null;
  fecthList: () => void;
}


export default function AddOrganizationModal({ fecthList}: OrganizationModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  
  const handleOpen = () => setOpen(true);


  const handleClose = () => {
    setOpen(false);
    resetForm();
  }


  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setProvince('');
    setPostalCode('');
    setCountry('');
    setEmail('');
    setPhoneNumber('');
    setGooglePlaceId('');
  };

  // eslint-disable-next-line
  const handleAddressChange = (address: any) => {
    const locationDetails = getLocationDetails(address);
    setCity(locationDetails.city);
    setProvince(locationDetails.province);
    setPostalCode(locationDetails.postalCode);
    setCountry(locationDetails.country);
    setGooglePlaceId(address.place_id);
    setAddress(address.formatted_address);
    setLatitude(locationDetails.latitude);
    setLongitude(locationDetails.longitude);
  };



  const handleSave = () => {
    const organization = {
      name,
      address,
      city,
      province,
      postalCode,
      country,
      email,
      phoneNumber,
      googlePlaceId,
      latitude,
      longitude,
    }; 
    console.log("handleSave", organization);
    axiosInstance.post('/api/organizations', organization)
      .then(response => {
        console.log('Organization saved successfully:', response.data);
        toast.success('Created!');
        fecthList();
        handleClose();
      })
      .catch(error => {
        console.error('Error saving organization:', error)
      });
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Organization
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white p-6 rounded shadow-lg w-[50%] text-center">
            <h2 className="text-xl font-bold mb-4">Create Organization</h2>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                /> 
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="State/Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                /> 
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}   
                /> 
              </Grid>
            </Grid>
           
            <AddressAutocomplete onAddressChange={handleAddressChange} initialAddress={""} />
            <div className="flex justify-end space-x-4">
            <button
                onClick={handleClose}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Save
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




