import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid2 as Grid,
  Button,
  Divider,
} from '@mui/material';
import {
  fetchSettingsPreference,
  fetchSettingsDefaultMapCenter,
  updateSettingsPreference,
  updateSettingsDefaultMapCenter,
} from '../apis/apis'; // Import the API function
import { useEffect, useRef, useState } from 'react';
import { customCoordinate } from '../../../../utils/constants';
import mapboxgl from 'mapbox-gl';
import { toast } from 'react-toastify';
import { systemPlan, systemModule } from '@/utils/constants';
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from '@/modules/core/pages/Error404Page';
import LockedFeature from '@/modules/core/components/LockedFeature';

export const PreferencePage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsPreference)) {
    return checkPlanExists(systemPlan.FreeTrial) ? (
      <LockedFeature featureName="Preference" />
    ) : (
      <Error404Page />
    );
  }

  const savedInterfaceLanguage = localStorage.getItem('locale') || 'en';
  const savedTimeZone = localStorage.getItem('timezone') || 'America/Toronto';

  const [data, setData] = useState([]);
  const [currentPreference, setCurrentPreference] = useState({
    locale: savedInterfaceLanguage,
    timezone: savedTimeZone,
  });
  const [currentDefaultMapCenter, setCurrentDefaultMapCenter] = useState({
    lat: 0,
    lng: 0,
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  //const [map,setMap] = useState<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const loadSettingsPreference = async () => {
      const response_data = await fetchSettingsPreference();
      if (response_data) {
        setData(response_data);
        setCurrentPreference({
          ...currentPreference,
          locale: response_data.settings.locale,
          timezone: response_data.settings.timezone,
        });
      }
    };

    const loadSettingsDefaultMapCenter = async () => {
      const response_data = await fetchSettingsDefaultMapCenter();
      if (response_data) {
        setCurrentDefaultMapCenter({
          ...currentPreference,
          lat: response_data.metadata.lat,
          lng: response_data.metadata.lng,
        });
      }
    };

    loadSettingsPreference();
    loadSettingsDefaultMapCenter();

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [customCoordinate.longitude, customCoordinate.latitude],
      zoom: 9,
    });

    // Add default zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());

    // setMap(map);
    mapRef.current = map;

    return () => map.remove();
  }, []);

  //create a useEffect when the garages state changes, call the markGarageOnMap function
  useEffect(() => {
    markLocationOnMap(mapRef);
  }, [currentPreference]);

  const markLocationOnMap = (mapRef: React.RefObject<mapboxgl.Map>) => {
    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Set the map center to the first garage's coordinates
    mapRef.current!.setCenter([
      currentDefaultMapCenter.lng,
      currentDefaultMapCenter.lat,
    ]);

    const actualMarker = new mapboxgl.Marker({
      draggable: true,
      color: 'red',
    })
      .setLngLat([currentDefaultMapCenter.lng, currentDefaultMapCenter.lat])
      .addTo(mapRef.current!);
    markersRef.current.push(actualMarker);

    function onDragEnd() {
      const lngLat = actualMarker.getLngLat();
      //console.log(`Longitude: ${lngLat.lng} Latitude: ${lngLat.lat}`);
      setCurrentDefaultMapCenter({
        ...currentDefaultMapCenter,
        lat: lngLat.lat,
        lng: lngLat.lng,
      });
    }

    actualMarker.on('dragend', onDragEnd);
  };

  const handleSave = async () => {
    // Update existing settings perference via API
    try {
      //save language & timezone to local storage
      localStorage.setItem('interfaceLanguage', currentPreference.locale);
      localStorage.setItem('timeZone', currentPreference.timezone);

      const updatedPreference = await updateSettingsPreference(
        data.id,
        currentPreference
      );
      const updatedDefaultMapCenter = await updateSettingsDefaultMapCenter(
        data.id,
        currentDefaultMapCenter
      );

      // Update the leads state with the updated lead data from the API
      /*setData((prevData) =>
          prevData.map((item) =>
              item.id === updatedLead.id ? { ...item, ...updatedLead } : item
          )
      );*/
      toast.success('Preference updated successfully.');
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Preference Settings
          </h1>
        </div>
      </div>
      <Box padding="16px" bgcolor="#f9f9f9" marginTop="15px">
        <Box>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Grid container spacing={2} marginBottom={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    select
                    label="Interface Language"
                    InputLabelProps={{ shrink: true }}
                    value={currentPreference.locale}
                    onChange={(e) =>
                      setCurrentPreference({
                        ...currentPreference,
                        locale: e.target.value,
                      })
                    }
                  >
                    <MenuItem key="en" value="en">
                      English
                    </MenuItem>
                    <MenuItem key="fr" value="fr">
                      French
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    select
                    label="Time Zone"
                    InputLabelProps={{ shrink: true }}
                    value={currentPreference.timezone}
                    onChange={(e) =>
                      setCurrentPreference({
                        ...currentPreference,
                        timezone: e.target.value,
                      })
                    }
                  >
                    <MenuItem disabled value="Africa">
                      Africa
                    </MenuItem>
                    {[
                      'Abidjan',
                      'Accra',
                      'Addis_Ababa',
                      'Algiers',
                      'Asmara',
                      'Bamako',
                      'Bangui',
                      'Banjul',
                      'Bissau',
                      'Blantyre',
                      'Brazzaville',
                      'Bujumbura',
                      'Cairo',
                      'Casablanca',
                      'Ceuta',
                      'Conakry',
                      'Dakar',
                      'Dar_es_Salaam',
                      'Djibouti',
                      'Douala',
                      'El_Aaiun',
                      'Freetown',
                      'Gaborone',
                      'Harare',
                      'Johannesburg',
                      'Juba',
                      'Kampala',
                      'Khartoum',
                      'Kigali',
                      'Kinshasa',
                      'Lagos',
                      'Libreville',
                      'Lome',
                      'Luanda',
                      'Lubumbashi',
                      'Lusaka',
                      'Malabo',
                      'Maputo',
                      'Maseru',
                      'Mbabane',
                      'Mogadishu',
                      'Monrovia',
                      'Nairobi',
                      'Ndjamena',
                      'Niamey',
                      'Nouakchott',
                      'Ouagadougou',
                      'Porto-Novo',
                      'Sao_Tome',
                      'Tripoli',
                      'Tunis',
                      'Windhoek',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Africa/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="America">
                      America
                    </MenuItem>
                    {[
                      'Adak',
                      'Anchorage',
                      'Anguilla',
                      'Antigua',
                      'Araguaina',
                      'Argentina/Buenos_Aires',
                      'Argentina/Catamarca',
                      'Argentina/Cordoba',
                      'Argentina/Jujuy',
                      'Argentina/La_Rioja',
                      'Argentina/Mendoza',
                      'Argentina/Rio_Gallegos',
                      'Argentina/Salta',
                      'Argentina/San_Juan',
                      'Argentina/San_Luis',
                      'Argentina/Tucuman',
                      'Argentina/Ushuaia',
                      'Aruba',
                      'Asuncion',
                      'Atikokan',
                      'Bahia',
                      'Bahia_Banderas',
                      'Barbados',
                      'Belem',
                      'Belize',
                      'Blanc-Sablon',
                      'Boa_Vista',
                      'Bogota',
                      'Boise',
                      'Cambridge_Bay',
                      'Campo_Grande',
                      'Cancun',
                      'Caracas',
                      'Cayenne',
                      'Cayman',
                      'Chicago',
                      'Chihuahua',
                      'Ciudad_Juarez',
                      'Costa_Rica',
                      'Creston',
                      'Cuiaba',
                      'Curacao',
                      'Danmarkshavn',
                      'Dawson',
                      'Dawson_Creek',
                      'Denver',
                      'Detroit',
                      'Dominica',
                      'Edmonton',
                      'Eirunepe',
                      'El_Salvador',
                      'Fort_Nelson',
                      'Fortaleza',
                      'Glace_Bay',
                      'Goose_Bay',
                      'Grand_Turk',
                      'Grenada',
                      'Guadeloupe',
                      'Guatemala',
                      'Guayaquil',
                      'Guyana',
                      'Halifax',
                      'Havana',
                      'Hermosillo',
                      'Indiana/Indianapolis',
                      'Indiana/Knox',
                      'Indiana/Marengo',
                      'Indiana/Petersburg',
                      'Indiana/Tell_City',
                      'Indiana/Vevay',
                      'Indiana/Vincennes',
                      'Indiana/Winamac',
                      'Inuvik',
                      'Iqaluit',
                      'Jamaica',
                      'Juneau',
                      'Kentucky/Louisville',
                      'Kentucky/Monticello',
                      'Kralendijk',
                      'La_Paz',
                      'Lima',
                      'Los_Angeles',
                      'Lower_Princes',
                      'Maceio',
                      'Managua',
                      'Manaus',
                      'Marigot',
                      'Martinique',
                      'Matamoros',
                      'Mazatlan',
                      'Menominee',
                      'Merida',
                      'Metlakatla',
                      'Mexico_City',
                      'Miquelon',
                      'Moncton',
                      'Monterrey',
                      'Montevideo',
                      'Montserrat',
                      'Nassau',
                      'New_York',
                      'Nome',
                      'Noronha',
                      'North_Dakota/Beulah',
                      'North_Dakota/Center',
                      'North_Dakota/New_Salem',
                      'Nuuk',
                      'Ojinaga',
                      'Panama',
                      'Paramaribo',
                      'Phoenix',
                      'Port-au-Prince',
                      'Port_of_Spain',
                      'Porto_Velho',
                      'Puerto_Rico',
                      'Punta_Arenas',
                      'Rankin_Inlet',
                      'Recife',
                      'Regina',
                      'Resolute',
                      'Rio_Branco',
                      'Santarem',
                      'Santiago',
                      'Santo_Domingo',
                      'Sao_Paulo',
                      'Scoresbysund',
                      'Sitka',
                      'St_Barthelemy',
                      'St_Johns',
                      'St_Kitts',
                      'St_Lucia',
                      'St_Thomas',
                      'St_Vincent',
                      'Swift_Current',
                      'Tegucigalpa',
                      'Thule',
                      'Tijuana',
                      'Toronto',
                      'Tortola',
                      'Vancouver',
                      'Whitehorse',
                      'Winnipeg',
                      'Yakutat',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'America/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Antarctica">
                      Antarctica
                    </MenuItem>
                    {[
                      'Casey',
                      'Davis',
                      'DumontDUrville',
                      'Macquarie',
                      'Mawson',
                      'McMurdo',
                      'Palmer',
                      'Rothera',
                      'Syowa',
                      'Troll',
                      'Vostok',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Antarctica/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Arctic">
                      Arctic
                    </MenuItem>
                    {['Longyearbyen'].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Arctic/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Asia">
                      Asia
                    </MenuItem>
                    {[
                      'Aden',
                      'Almaty',
                      'Amman',
                      'Anadyr',
                      'Aqtau',
                      'Aqtobe',
                      'Ashgabat',
                      'Atyrau',
                      'Baghdad',
                      'Bahrain',
                      'Baku',
                      'Bangkok',
                      'Barnaul',
                      'Beirut',
                      'Bishkek',
                      'Brunei',
                      'Chita',
                      'Choibalsan',
                      'Colombo',
                      'Damascus',
                      'Dhaka',
                      'Dili',
                      'Dubai',
                      'Dushanbe',
                      'Famagusta',
                      'Gaza',
                      'Hebron',
                      'Ho_Chi_Minh',
                      'Hong_Kong',
                      'Hovd',
                      'Irkutsk',
                      'Jakarta',
                      'Jayapura',
                      'Jerusalem',
                      'Kabul',
                      'Kamchatka',
                      'Karachi',
                      'Kathmandu',
                      'Khandyga',
                      'Kolkata',
                      'Krasnoyarsk',
                      'Kuala_Lumpur',
                      'Kuching',
                      'Kuwait',
                      'Macau',
                      'Magadan',
                      'Makassar',
                      'Manila',
                      'Muscat',
                      'Nicosia',
                      'Novokuznetsk',
                      'Novosibirsk',
                      'Omsk',
                      'Oral',
                      'Phnom_Penh',
                      'Pontianak',
                      'Pyongyang',
                      'Qatar',
                      'Qostanay',
                      'Qyzylorda',
                      'Riyadh',
                      'Sakhalin',
                      'Samarkand',
                      'Seoul',
                      'Shanghai',
                      'Singapore',
                      'Srednekolymsk',
                      'Taipei',
                      'Tashkent',
                      'Tbilisi',
                      'Tehran',
                      'Thimphu',
                      'Tokyo',
                      'Tomsk',
                      'Ulaanbaatar',
                      'Urumqi',
                      'Ust-Nera',
                      'Vientiane',
                      'Vladivostok',
                      'Yakutsk',
                      'Yangon',
                      'Yekaterinburg',
                      'Yerevan',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Asia/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Atlantic">
                      Atlantic
                    </MenuItem>
                    {[
                      'Azores',
                      'Bermuda',
                      'Canary',
                      'Cape_Verde',
                      'Faroe',
                      'Madeira',
                      'Reykjavik',
                      'South_Georgia',
                      'St_Helena',
                      'Stanley',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Atlantic/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Australia">
                      Australia
                    </MenuItem>
                    {[
                      'Adelaide',
                      'Brisbane',
                      'Broken_Hill',
                      'Darwin',
                      'Eucla',
                      'Hobart',
                      'Lindeman',
                      'Lord_Howe',
                      'Melbourne',
                      'Perth',
                      'Sydney',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Australia/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Europe">
                      Europe
                    </MenuItem>
                    {[
                      'Amsterdam',
                      'Andorra',
                      'Astrakhan',
                      'Athens',
                      'Belgrade',
                      'Berlin',
                      'Bratislava',
                      'Brussels',
                      'Bucharest',
                      'Budapest',
                      'Busingen',
                      'Chisinau',
                      'Copenhagen',
                      'Dublin',
                      'Gibraltar',
                      'Guernsey',
                      'Helsinki',
                      'Isle_of_Man',
                      'Istanbul',
                      'Jersey',
                      'Kaliningrad',
                      'Kirov',
                      'Kyiv',
                      'Lisbon',
                      'Ljubljana',
                      'London',
                      'Luxembourg',
                      'Madrid',
                      'Malta',
                      'Mariehamn',
                      'Minsk',
                      'Monaco',
                      'Moscow',
                      'Oslo',
                      'Paris',
                      'Podgorica',
                      'Prague',
                      'Riga',
                      'Rome',
                      'Samara',
                      'San_Marino',
                      'Sarajevo',
                      'Saratov',
                      'Simferopol',
                      'Skopje',
                      'Sofia',
                      'Stockholm',
                      'Tallinn',
                      'Tirane',
                      'Ulyanovsk',
                      'Vaduz',
                      'Vatican',
                      'Vienna',
                      'Vilnius',
                      'Volgograd',
                      'Warsaw',
                      'Zagreb',
                      'Zurich',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Europe/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Indian">
                      Indian
                    </MenuItem>
                    {[
                      'Antananarivo',
                      'Chagos',
                      'Christmas',
                      'Cocos',
                      'Comoro',
                      'Kerguelen',
                      'Mahe',
                      'Maldives',
                      'Mauritius',
                      'Mayotte',
                      'Reunion',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Indian/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                    <MenuItem disabled value="Pacific">
                      Pacific
                    </MenuItem>
                    {[
                      'Apia',
                      'Auckland',
                      'Bougainville',
                      'Chatham',
                      'Chuuk',
                      'Easter',
                      'Efate',
                      'Fakaofo',
                      'Fiji',
                      'Funafuti',
                      'Galapagos',
                      'Gambier',
                      'Guadalcanal',
                      'Guam',
                      'Honolulu',
                      'Kanton',
                      'Kiritimati',
                      'Kosrae',
                      'Kwajalein',
                      'Majuro',
                      'Marquesas',
                      'Midway',
                      'Nauru',
                      'Niue',
                      'Norfolk',
                      'Noumea',
                      'Pago_Pago',
                      'Palau',
                      'Pitcairn',
                      'Pohnpei',
                      'Port_Moresby',
                      'Rarotonga',
                      'Saipan',
                      'Tahiti',
                      'Tarawa',
                      'Tongatapu',
                      'Wake',
                      'Wallis',
                    ].map((tzone) => (
                      <MenuItem
                        key={tzone}
                        value={'Pacific/' + tzone}
                        sx={{ marginLeft: '10px' }}
                      >
                        {tzone}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Typography variant="h6" fontWeight="bold" marginBottom={3}>
                Default Map Center
              </Typography>
              <Grid container spacing={2} marginBottom={3}>
                <Grid size={6}>
                  <TextField
                    required
                    fullWidth
                    label="Latitude"
                    InputLabelProps={{ shrink: true }}
                    value={currentDefaultMapCenter.lat}
                    onChange={(e) =>
                      setCurrentDefaultMapCenter({
                        ...currentDefaultMapCenter,
                        lat: Number(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    required
                    fullWidth
                    label="Longitude"
                    InputLabelProps={{ shrink: true }}
                    value={currentDefaultMapCenter.lng}
                    onChange={(e) =>
                      setCurrentDefaultMapCenter({
                        ...currentDefaultMapCenter,
                        lng: Number(e.target.value),
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={6}>
              <div className="h-full items-center justify-center">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ textTransform: 'none', marginRight: 2 }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default PreferencePage;
