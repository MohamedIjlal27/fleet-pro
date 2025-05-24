import React, { useEffect, useState } from 'react';
import {
  X,
  CarFront,
  Waypoints,
  CloudUploadIcon,
  FileTextIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import mapboxgl from 'mapbox-gl';
import AddressAutocomplete from "@/modules/core/components/AddressAutocomplete";
import { getLocationDetails } from "@/utils/loadGoogleMaps";

type CircleGeometry = {
  center: { lat: number; lon: number };
  radius: number;
  type: 'circle';
};

type PolygonGeometry = {
  path: { lat: number; lon: number }[];
  type: 'polygon';
};

type Geofence = {
  id: string;
  name: string;
  isActive: boolean;
  geoFenceIdid?: string;
  geometry: CircleGeometry | PolygonGeometry;
};

const AddGeofenceForm = ({
  drawCircle,
  handleFileUpload,
  createNewPolygonGeofence,
  saveGeofences,
  handleDicline,
  isFileUploading,
  clearGeofences,
  drawRef,
  mapRef,
  isEditing,
  editGeofence,
  updateGeofence,
  isActive,
  setIsActive,
}: {
  drawCircle: (
    lon: number,
    lat: number,
    radius: number,
    name: string,
    isActive: boolean
  ) => void;
  handleFileUpload: (file: File, name: string, isActive: boolean) => void;
  createNewPolygonGeofence: (
    features: mapboxgl.GeoJSONFeature[],
    name: string
  ) => void;
  saveGeofences: () => Promise<void>;
  handleDicline: () => void;
  isFileUploading: boolean;
  clearGeofences: () => void;
  drawRef: React.RefObject<any>;
  mapRef: React.RefObject<any>;
  isEditing: boolean;
  editGeofence?: Geofence | null;
  updateGeofence: (geofenceId: string) => Promise<void>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [shapeType, setShapeType] = useState('circle');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [center, setCenter] = useState<{
    lat: number | null;
    lon: number | null;
  }>({ lat: null, lon: null });
  const [radius, setRadius] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  // Validation errors
  const [fileError, setFileError] = useState('');
  const [latLngError, setLatLngError] = useState('');
  const [radiusError, setRadiusError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<any>(null);
  const [drawnPolygonFeatures, setDrawnPolygonFeatures] = useState(null);

  useEffect(() => {
    if (file && name) {
      handleFileChange();
    }
  }, [file, name]);

  useEffect(() => {
    if (center.lat && center.lon && name && radius > 0) {
      console.log('Running drawCircle');
      if (isValidLatitude(center.lat) && isValidLongitude(center.lon)) {
        console.log('Valid lat/lon:', center.lat, center.lon);
        clearGeofences();
        drawCircle(center.lon, center.lat, radius, name, isActive);
      } else {
        console.log('Invalid lat/lon:', center.lat, center.lon);
        setLatLngError('Please enter valid latitude and longitude values');
      }
    }
  }, [center, name, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!drawRef.current || !map) return;

    const handleDrawCreate = (e: { features: any }) => {
      const features = e.features;
      setDrawnPolygonFeatures(features);
    };

    map.on('draw.create', handleDrawCreate);
    map.on('draw.update', handleDrawCreate);
  }, [mapRef, drawRef]);

  useEffect(() => {
    if (isEditing && editGeofence) {
      setName(editGeofence.name);

      if (editGeofence.geometry.type === 'circle') {
        setCenter({
          lat: editGeofence.geometry.center.lat,
          lon: editGeofence.geometry.center.lon,
        });
        setShapeType('circle');
      } else {
        setShapeType('custom');
      }
      // setRadius(editGeofence.geometry.radius);
    }
  }, [isEditing, editGeofence]);

  useEffect(() => {
    return () => {
      removeMarkersFromMap();
    };
  }, []);

  useEffect(() => {
    console.log('drawnPolygonFeatures', drawnPolygonFeatures);
    console.log('name', name);
    if (drawnPolygonFeatures && name) {
      createNewPolygonGeofence(drawnPolygonFeatures, name);
    }
  }, [name, drawnPolygonFeatures]);

  useEffect(() => {
    const putMarkerOnMap = () => {
      const lat = center.lat;
      const lon = center.lon;

      if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
        const map = mapRef.current;
        if (map) {
          map.flyTo({
            center: [lon, lat],
            zoom: 14,
            essential: true,
          });

          removeMarkersFromMap();

          const marker = new mapboxgl.Marker();
          marker.setLngLat([lon, lat]).addTo(map);

          map.currentMarker = marker;
        }
      }
    };

    if (center.lat !== null && center.lon !== null && center.lat) {
      if (isValidLatitude(center.lat) && isValidLongitude(center.lon)) {
        putMarkerOnMap();
      } else {
        setLatLngError('Please enter valid latitude and longitude values');
      }
    } else {
      removeMarkersFromMap();
    }
  }, [center]);

  const handleStatusChange = (event: any) => {
    // Convert the string value to a boolean
    setIsActive(false);
  };

  const removeMarkersFromMap = () => {
    const map = mapRef.current;
    if (map && map.currentMarker) {
      map.currentMarker.remove();
      map.currentMarker = null;
    }
  };

  const startNewPolygonDrawing = () => {
    if (!drawRef.current) return;

    // First delete any existing polygons
    const data = drawRef.current.getAll();
    const polygonIds = data.features
      .filter((f: any) => f.geometry.type === 'Polygon')
      .map((f: any) => f.id);

    // Delete all existing polygons before changing mode
    if (polygonIds.length > 0) {
      drawRef.current.delete(polygonIds);
    }

    // Now change to polygon drawing mode
    drawRef.current.changeMode('draw_polygon');
    setIsDrawingPolygon(true);
  };

  const handleFileChange = () => {
    if (file && file.type === 'text/csv') {
      handleFileUpload(file, name, isActive);
    } else {
      toast.error('Invalid file type. Please upload a CSV file.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const onAddressChange = (address: any) => {
    const locationDetails = getLocationDetails(address);
    console.log("locationDetails",locationDetails);
    setAddress(locationDetails.formatted_address);
    setCenter({
      lat: locationDetails.latitude,
      lon: locationDetails.longitude,
    });
    // setFormData((prev) => ({
    //   ...prev,
    //   address: locationDetails.formatted_address,
    //   city: locationDetails.city,
    //   province: locationDetails.province,
    //   postalCode: locationDetails.postalCode,
    //   country: locationDetails.country,
    //   googlePlaceId: locationDetails.place_id,
    //   // Only update coordinates if custom coordinates are not enabled
    //   ...(useCustomCoordinates ? {} : {
    //     latitude: locationDetails.latitude,
    //     longitude: locationDetails.longitude,
    //   }),
    // }));
  };

  const isValidLatitude = (lat: number) => {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  };

  const isValidLongitude = (lon: number) => {
    return !isNaN(lon) && lon >= -180 && lon <= 180;
  };

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      isValid = false;
    }

    if (isFileUploading) {
      if (!file) {
        isValid = false;
      }
    } else {
      if (
        shapeType === 'circle' &&
        (center.lat === null || !isValidLatitude(center.lat))
      ) {
        setLatLngError('Please enter a valid latitude (-90 to 90)');
        isValid = false;
      }

      if (
        shapeType === 'circle' &&
        (center.lon === null || !isValidLongitude(center.lon))
      ) {
        setLatLngError('Please enter a valid longitude (-180 to 180)');
        isValid = false;
      }

      if (shapeType === 'circle' && radius <= 0) {
        setRadiusError('Radius must be greater than 0');
        isValid = false;
      }
    }

    return isValid;
  };

  return (
    <div className="h-full bg-white mt-2 mr-2 rounded-lg shadow flex flex-col overflow-y-auto">
      <div className="grow p-4 px-6 pb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          {isEditing ? `Edit Geofence: ${name}` : 'Add new Geofence'}
        </h1>

        {isEditing && (
          <div className="mb-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You are currently editing an existing geofence. Re-draw the
                geofence by selecting a shape type and using the tools provided
                below.
              </p>
            </div>
          </div>
        )}

        {/* Basic Info Section */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-2">
            Basic info
          </h2>
          <div className="border border-gray-200 rounded-lg p-6">
            <label className="block text-gray-700 text-base mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEditing}
              placeholder="eg. warehouse #2"
              className={`w-full px-4 py-3 border ${
                !name.trim() && formSubmitted
                  ? 'border-red-500'
                  : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-70 disabled:cursor-not-allowed`}
              required
            />
            {!name.trim() && formSubmitted && (
              <p className="text-red-500 text-sm mt-1">Name is required</p>
            )}
          </div>
        </div>

        {isFileUploading ? (
          <>
            {/* File Upload Section */}
            <div className="mb-6">
              <h2 className="text-base font-medium text-gray-900 mb-2">
                CSV Upload
              </h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-3 text-center bg-[#0000000.02] cursor-pointer hover:bg-[#0000000.04] hover:border-blue-600 transition-all duration-200 mb-5 ${
                    !file && formSubmitted
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#1976d2';
                    e.currentTarget.style.backgroundColor =
                      'rgba(25, 118, 210, 0.04)';
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.backgroundColor =
                      'rgba(0, 0, 0, 0.02)';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.backgroundColor =
                      'rgba(0, 0, 0, 0.02)';
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const uploadedFile = e.dataTransfer.files[0];
                      if (
                        uploadedFile.type === 'text/csv' ||
                        uploadedFile.name.endsWith('.csv')
                      ) {
                        setFile(uploadedFile);
                        setFileError('');
                      } else {
                        setFileError('Only CSV files are supported');
                      }
                      e.dataTransfer.clearData();
                    }
                  }}
                  onClick={() =>
                    document.getElementById('vehicle-image-input')?.click()
                  }
                >
                  {!file ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-4xl text-gray-600 mb-1">
                        <CloudUploadIcon size={40} />
                      </div>
                      <p className="font-medium text-gray-600">
                        Drag and drop your file here
                      </p>
                      <p className="text-stone-400">or click to browse files</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Supports: CSV
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                        <FileTextIcon size={24} className="text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB • CSV
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                      >
                        Remove file
                      </button>
                    </div>
                  )}
                </div>

                {fileError && (
                  <p className="text-red-500 text-sm mb-3">{fileError}</p>
                )}

                {!file && formSubmitted && (
                  <p className="text-red-500 text-sm mb-3">
                    Please upload a CSV file
                  </p>
                )}

                <h4 className="font-normal text-base text-gray-700 mb-2">
                  CSV File Format Guidelines
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  Please ensure the CSV file follows the required format. The
                  file should include:
                </p>

                <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">
                  <li>
                    A header row with column names:{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                      lon,lat
                    </code>
                  </li>
                  <li>
                    Each row should represent a single geofence point with valid
                    longitude and latitude values
                  </li>
                  <li>All geographic coordinates in decimal degrees format</li>
                </ul>

                <div className="flex flex-col items-start mt-3">
                  <p className="text-gray-500 text-sm">
                    Download the template:
                  </p>
                  <Link
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                    target="_blank"
                    to="/download/csv/geofence-template.csv"
                  >
                    geofence-template.csv
                  </Link>
                </div>
              </div>
              <input
                id="vehicle-image-input"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const uploadedFile = e.target.files[0];
                    if (
                      uploadedFile.type === 'text/csv' ||
                      uploadedFile.name.endsWith('.csv')
                    ) {
                      setFile(uploadedFile);
                      setFileError('');
                    } else {
                      setFileError('Only CSV files are supported');
                    }
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Geofence Details Section */}
            <div className="mb-6">
              <h2 className="text-base font-medium text-gray-900 mb-2">
                Geofence Details
              </h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="block text-gray-700 text-base mb-2">
                  Find Location
                </label>
                {/* <input
                  type="text"
                  placeholder="Search by location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                /> */}
                <AddressAutocomplete
                  onAddressChange={onAddressChange}
                  initialAddress={address}
                  placeholder="Search by location"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-base mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={center.lat ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCenter({
                          ...center,
                          lat: value === '' ? null : parseFloat(value),
                        });
                        if (latLngError && isValidLatitude(parseFloat(value))) {
                          setLatLngError('');
                        }
                      }}
                      placeholder="eg.26.6646"
                      className={`w-full px-4 py-3 border ${
                        formSubmitted &&
                        shapeType === 'circle' &&
                        (center.lat === null ||
                          !isValidLatitude(center.lat) ||
                          latLngError)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
                      required
                    />
                    {formSubmitted &&
                      center.lat !== null &&
                      !isValidLatitude(center.lat) && (
                        <p className="text-red-500 text-sm mt-1">
                          Enter a valid latitude (-90 to 90)
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-base mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={center.lon ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCenter({
                          ...center,
                          lon: value === '' ? null : parseFloat(value),
                        });
                        if (
                          latLngError &&
                          isValidLongitude(parseFloat(value))
                        ) {
                          setLatLngError('');
                        }
                      }}
                      placeholder="eg.26.6646"
                      className={`w-full px-4 py-3 border ${
                        formSubmitted &&
                        shapeType === 'circle' &&
                        (center.lon === null ||
                          !isValidLongitude(center.lon) ||
                          latLngError)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
                      required
                    />
                    {formSubmitted &&
                      center.lon !== null &&
                      !isValidLongitude(center.lon) && (
                        <p className="text-red-500 text-sm mt-1">
                          Enter a valid longitude (-180 to 180)
                        </p>
                      )}
                  </div>
                </div>
                {latLngError && (
                  <p className="text-red-500 text-sm mt-2">{latLngError}</p>
                )}
              </div>
            </div>

            {/* Shape Section */}
            <div className="mb-6">
              <h2 className="text-base font-base text-gray-900 mb-2">Shape</h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex space-x-3 mb-6">
                  <button
                    className={`flex items-center px-4 py-1 rounded-full ${
                      shapeType === 'circle'
                        ? 'bg-blue-100 text-blue-600 border border-blue-300'
                        : 'border border-gray-300 text-black'
                    }`}
                    onClick={() => {
                      setShapeType('circle');
                      clearGeofences();
                      // Cancel any active drawing when switching to circle
                      if (
                        drawRef.current &&
                        drawRef.current.getMode() !== 'simple_select'
                      ) {
                        drawRef.current.changeMode('simple_select');
                      }
                    }}
                    type="button"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-current mr-2"></div>
                    Circle
                  </button>

                  <button
                    className={`flex items-center px-4 py-1 rounded-full ${
                      shapeType === 'custom'
                        ? 'bg-blue-100 text-blue-600 border border-blue-300'
                        : 'border border-gray-300 text-black'
                    }`}
                    onClick={() => {
                      setShapeType('custom');
                      setRadius(0);
                      clearGeofences();
                    }}
                    type="button"
                  >
                    <Waypoints className="w-5 h-5 mr-2" />
                    Draw Custom
                  </button>
                </div>

                {shapeType === 'circle' && (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-2">
                        Radius (KM)
                      </label>
                      <input
                        type="text"
                        value={radius}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setRadius(value === '' ? 0 : parseFloat(value));
                            if (parseFloat(value) > 0) {
                              setRadiusError('');
                            }
                          }
                        }}
                        placeholder="eg 500"
                        className={`w-full px-4 py-3 border ${
                          formSubmitted && (radius <= 0 || radiusError)
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
                        required={true}
                      />
                      {(formSubmitted &&
                        radius <= 0 &&
                        shapeType === 'circle') ||
                      radiusError ? (
                        <p className="text-red-500 text-sm mt-1">
                          Radius must be greater than 0
                        </p>
                      ) : null}
                    </div>
                  </>
                )}

                {shapeType === 'custom' && (
                  <div className="mt-4">
                    <div className="">
                      <h4 className="font-normal text-base text-gray-700 mb-2">
                        How to Draw a Custom Geofence
                      </h4>

                      <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">
                        <li>Click on the map to add your first point</li>
                        <li>
                          Continue clicking to add more points to form your
                          polygon
                        </li>
                        <li>
                          To complete the shape, click on the first point or
                          press Enter
                        </li>
                        <li>To cancel the drawing, press Escape</li>
                        <li>
                          To edit after creation, click on the shape and drag
                        </li>
                      </ul>

                      {isDrawingPolygon && (
                        <div className="flex items-center mt-3 pt-3 border-t">
                          <div className="relative w-2 h-2 bg-blue-600 rounded-full mr-2 flex items-center justify-center">
                            <span className="absolute w-4 h-4 bg-blue-100 opacity-75 rounded-full animate-ping"></span>
                          </div>
                          <span className="text-gray-700 font-medium">
                            Drawing mode active
                          </span>
                          <button
                            className="ml-auto px-3 py-1 bg-white underline rounded-md text-blue-600 hover:bg-blue-50 text-sm"
                            onClick={() => {
                              if (drawRef.current) {
                                drawRef.current.trash();
                                drawRef.current.changeMode('simple_select');
                              }
                              setIsDrawingPolygon(false);
                            }}
                            type="button"
                          >
                            Cancel Drawing
                          </button>
                        </div>
                      )}
                    </div>

                    {currentPolygon && (
                      <div className="mt-3 flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span>
                          Polygon created successfully! You can save or continue
                          editing.
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-3">
                      <button
                        className="flex grow justify-center items-center py-2 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100"
                        onClick={() => {
                          if (drawRef.current) {
                            startNewPolygonDrawing();
                          }
                        }}
                        type="button"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Polygon
                      </button>

                      <button
                        className="flex w-fit items-center px-4 py-2 border border-red-300 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        onClick={() => {
                          if (drawRef.current) {
                            // Delete the current selection
                            drawRef.current.trash();
                            setCurrentPolygon(null);
                          }
                        }}
                        type="button"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="font-medium text-gray-700">Status</label>
              <select
                value={isActive?.toString()}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <hr />
      <div className="p-4 px-6">
        <div className="flex space-x-4 float-right mt-2 mb-2">
          <button
            className="flex justify-center items-center py-2 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium"
            onClick={() => {
              removeMarkersFromMap();
              handleDicline();
            }}
            type="button"
          >
            <X className="w-5 h-5 mr-2" />
            Decline
          </button>
          {isEditing ? (
            <button
              className="flex justify-center items-center py-2 px-6 bg-[#0A1224] text-white rounded-lg font-medium disabled:opacity-50"
              onClick={async () => {
                setFormSubmitted(true);
                await updateGeofence(editGeofence?.id!).then(() => {
                  handleDicline();
                });
              }}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <CarFront className="w-5 h-5 mr-2" />
                  Update
                </>
              )}
            </button>
          ) : (
            <button
              className="flex justify-center items-center py-2 px-6 bg-[#0A1224] text-white rounded-lg font-medium disabled:opacity-50"
              onClick={async () => {
                setFormSubmitted(true);
                if (validateForm()) {
                  await saveGeofences().then(() => {
                    handleDicline();
                  });
                }
              }}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <CarFront className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGeofenceForm;
