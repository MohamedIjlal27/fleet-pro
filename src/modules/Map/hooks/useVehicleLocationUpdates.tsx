import { useEffect } from 'react';
import { IVehicle } from '../../core/interfaces/interfaces';
import socketService from '../../../Socket';

export const useVehicleLocationUpdates = (
  vehicles: IVehicle[],
  updateVehicleMarkerOnWebSocket: Function
) => {
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;

    const deviceIds: string[] = vehicles
      .map(v => v.device?.deviceId?.toString())
      .filter((id): id is string => Boolean(id)); 
    const orgId = vehicles[0].organizationId;

    socketService.subscribeTodevicesLocationUpdates(deviceIds, orgId);

    const handleDeviceLocationUpdate = (data: {
      deviceId: string;
      latitude: number;
      longitude: number;
    }) => {
      updateVehicleMarkerOnWebSocket(data);
    };

    const unsubscribe = socketService.onDevicesLocationUpdates(
      handleDeviceLocationUpdate
    );

    return () => {
      unsubscribe();
    };
  }, [vehicles, updateVehicleMarkerOnWebSocket]);
};
