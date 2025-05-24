export interface ITelemetryDeviceForm {
    deviceId: string;
    deviceName: string;
    deviceIdent?: string;
    renewalDate?: string;
    trackingDeviceType: "FLESPI" | "GEOTAB" | undefined;
    deviceProtocol: string | undefined;
    deviceType: string | undefined;
    vehicleId?: string;
    // organizationId?: number;
    status?: "active" | "inactive" ;
}

