export interface IMaintenanceDummy {
    id: number;
    startDate: string;
    plateNumber: string;
    makeModel: string;
    coverImage: string;
    make: string;
    model: string;
    trim: string;
    year: string;
    color: string;
    service: string;
    status: string;
    bodyShopLocation: string;
}


  export interface IMaintenanceDetail {
    id: number;
    carId: number;
    userId: number;
    plateNumber: string;
    startTime: string;
    status: number;
    statusName: string;
    serviceType: number;
    serviceTypeName: string;
    coverImage: string;
    make: string;
    model: string;
    year: number;
    color: string;
    amount?: number;
    work_shop?: string;
    notes?: string;
    service_detail?: string;
    estimated_cost?: number;
    practical_cost: number;
    paid_date?: string;
    paid_resource?: string;
    maintenanceRecordFiles?: object[];
    repairEta?: string;
    endTime?: string;
    odometer?: number;
    fuelType?: string;
    vin?: string;
    garage_name?: string;
    garage_address?: string;
    pickupAssigneeId?: number;
    pickupScheduleDate?: string;
    dropOffAssigneeId?: number;
    dropOffScheduleDate?: string;
    maintenanceDeliveryReturn?: object;
    maintenanceDelivery?: object;
    user?:any;
    vehicle?: {
        plateNumber: string;
        coverImage: string;
        make: string;
        model: string;
        year: number;
        color: string;
    };
}