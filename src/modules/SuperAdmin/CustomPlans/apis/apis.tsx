import axios, { AxiosError } from "axios";
import axiosInstance from "../../../../utils/axiosConfig";

export const fetchCustomPlans = async (
  page: number = 1,
  size: number = 10,
  sortBy: string = "createdAt",
  sortOrder: string = "asc",
  search: string = ""
) => {
  try {
    const params = {
      page,
      size,
      sortBy,
      sortOrder,
      search,
    };
    const response = await axiosInstance.get("/api/custom-plan", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching custom plans data:", error);
    throw error;
  }
};

export interface CustomPlanData {
  name: string;
  description: string;
  moduleBasicId: number;
  addOns: number[];
  amount: number;
  interval: string;
  setupFee: number;
  assetDriversAmount: number;
  assetVehiclesAmount: number;
  trial_days: number;
  organizationIds: number[];
}

export const createCustomPlan = async (
  planData: CustomPlanData
): Promise<any> => {
  try {
    const response = await axiosInstance.post("/api/custom-plan", planData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(
        "Axios error creating custom plan:",
        axiosError.response?.data?.message || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.message || "Failed to create custom plan"
      );
    } else {
      console.error("Unknown error creating custom plan:", error);
      throw new Error(
        "An unknown error occurred while creating the custom plan"
      );
    }
  }
};

export const getCustomPlanById = async (id: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/custom-plans/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get custom plan"
      );
    } else {
      throw new Error(
        "An unexpected error occurred while getting the custom plan"
      );
    }
  }
};

export const updateCustomPlan = async (
  id: number,
  planData: CustomPlanData
): Promise<any> => {
  try {
    const response = await axiosInstance.patch(
      `/api/custom-plan/${id}`,
      planData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update custom plan"
      );
    } else {
      throw new Error(
        "An unexpected error occurred while updating the custom plan"
      );
    }
  }
};

export const fetchSystemPlans = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/api/system-plans/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching system plans:", error);
    throw error;
  }
};

export const getAllOrganizations = async () => {
  try {
    const response = await axiosInstance.get("/api/organizations");
    return response.data;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};
