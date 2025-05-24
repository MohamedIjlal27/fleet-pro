export interface ITelemetryDevice {
    id: number;
    deviceId: number;
    deviceName: string;
    ident?: number;
    type: "FLESPI" | "GEOTAB" | '';
    deviceProtocol: string;
    deviceType: string;
    status: "active" | "inactive" | '';
    metadata?: any;
    vehicleId?: number;
    createdAt: string;
    updatedAt: string;
}

