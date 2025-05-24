export function getVehicleStatus(
  ignition: boolean | undefined,
  movement: boolean | undefined
): 'Driving' | 'Idling' | 'Parking' {
  if (ignition === true && movement) {
    return 'Driving';
  } else if (ignition === true && !movement) {
    return 'Idling';
  } else {
    return 'Parking';
  }
}