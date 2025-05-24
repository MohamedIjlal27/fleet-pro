export interface IOrganizationSettingsFormData {
  login_sms: string;
  ordering_sms: string;
  order_payment_request_sms: string;
  customer_signature_sms: string;
  task_assigned_sms: string;
  bill_payment_request_sms: string;
}

interface IMetadata {
  login_sms?: string;
  ordering_sms?: string;
  order_payment_request_sms?: string;
  customer_signature_sms?: string;
  task_assigned_sms?: string;
  bill_payment_request_sms?: string;
}

export interface IOrganizationSettingsData {
  id: number;
  organizationId: number;
  type: number;
  metadata?: IMetadata;
  createdAt: string;
  updatedAt: string;
}