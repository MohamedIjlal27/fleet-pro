import { useState, useEffect } from 'react';
import AddressAutocomplete from '../../../core/components/AddressAutocomplete';
import { TextField, Grid } from '@mui/material';
import axiosInstance from '../../../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { IOrganization } from '../interfaces/organization.interface';


interface EditOrganizationModalProps {
  organization: IOrganization | null;
  fecthList: () => void;
}


export default function EditOrganizationModal({ fecthList, organization = null}: EditOrganizationModalProps) {
  const [open, setOpen] = useState(false);
  const [id] = useState(organization?.id);
  const [name, setName] = useState(organization?.name);
  const [address, setAddress] = useState(organization?.address);
  const [city, setCity] = useState(organization?.city);
  const [province, setProvince] = useState(organization?.province);
  const [postalCode, setPostalCode] = useState(organization?.postalCode);
  const [email, setEmail] = useState(organization?.email);
  const [phoneNumber, setPhoneNumber] = useState(organization?.phoneNumber);
  const [country, setCountry] = useState(organization?.country);
  const [googlePlaceId, setGooglePlaceId] = useState(organization?.googlePlaceId);

  
  const handleOpen = () => setOpen(true);


  const handleClose = () => {
    setOpen(false);
    resetForm();
  }


  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setAddress(organization.address);
      setCity(organization.city);
      setProvince(organization.province);
      setPostalCode(organization.postalCode);
      setCountry(organization.country);
      setEmail(organization.email);
      setPhoneNumber(organization.phoneNumber);
      setGooglePlaceId(organization.googlePlaceId);
    }
    // resetForm();
  }, []);
  
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
    setProvince(locationDetails.state);
    setPostalCode(locationDetails.postalCode);
    setCountry(locationDetails.country);
    setGooglePlaceId(address.googlePlaceId);
    setAddress(address.address);
  };



  const handleSave = () => {
    const organization = {
      id,
      name,
      address,
      city,
      province,
      postalCode,
      country,
      email,
      phoneNumber,
      googlePlaceId,
    }; 

    axiosInstance.put(`/api/organizations/${organization.id}`, organization)
      .then(response => {
        console.log('Organization saved successfully:', response.data);
        toast.success('Updated!');
        fecthList();
        handleClose();
      })
      .catch(error => {
        console.error('Error:', error)
      });
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Edit Organization
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white p-6 rounded shadow-lg w-[50%] text-center">
            <h2 className="text-xl font-bold mb-4">Edit Organization</h2>
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

// eslint-disable-next-line
function getLocationDetails(place: any) {
    const locationDetails = {
        city: '',
        state: '',
        postalCode: '',
        country: '',
        place_id: '',
        formatted_address: ''
    };

    if (!place || !place.address_components) {
        return locationDetails;
    }
    locationDetails.place_id = place.place_id;
    locationDetails.formatted_address = place.formatted_address;

    // eslint-disable-next-line
    place.address_components.forEach((component: any) => {
        const types = component.types;

        if (types.includes('locality')) {
            locationDetails.city = component.long_name;
        }

        if (types.includes('administrative_area_level_1')) {
            locationDetails.state = component.long_name;
        }

        if (types.includes('postal_code')) {
            locationDetails.postalCode = component.long_name;
        }

        if (types.includes('country')) {
            locationDetails.country = component.long_name;
        }
    });

    return locationDetails;
}

