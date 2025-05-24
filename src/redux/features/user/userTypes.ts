export interface UserState {
  id: number;
  email: string;
  username: string;
  picture: string;
  organizationId: number | null;
  firstName: string;
  lastName: string;
  roles: Array<Record<string, string>>;
  permissions: Array<Record<string, string>>;
  subscribedPlans: Array<string>;
  modules: Record<string, string>;
}

export interface SetUserPayload {
  id: number;
  email: string;
  username: string;
  picture: string;
  organizationId: number;
  firstName: string;
  lastName: string;
  roles: Array<Record<string, string>>;
  permissions: Array<Record<string, string>>;
  subscribedPlans: Array<string>;
  modules: Record<string, string>;
}
