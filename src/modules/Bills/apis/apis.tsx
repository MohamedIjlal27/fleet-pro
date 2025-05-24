import axios, { AxiosError } from "axios";
import axiosInstance from "../../../utils/axiosConfig";
import { IBillDetailsData } from "../interfaces/interfaces";

export const fetchBills = async (
  page: number = 1,
  size: number = 10,
  search: string = ``,
  status: string = "",
  type: string = "",
  customerId: number | null = null
) => {
  try {
    const params = {
      page: page,
      size: size,
      search: search,
      status: status,
      type: type,
      customerId: customerId,
    };
    const response = await axiosInstance.get("/api/bills", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching bills data:", error);
  }
};

export const fetchBillFilters = async () => {
  try {
    const response = await axiosInstance.get("/api/bills/filters");
    return response.data;
  } catch (error) {
    console.error("Error fetching bills data:", error);
  }
};

export const fetchBillDetails = async (billId: number) => {
  try {
    const response = await axiosInstance.get(`/api/bills/${billId}`);
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error(
      "Error fetchBillDetails:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetchBillDetails. Please try again."
    );
  }
};

export const createBill = async (billData: IBillDetailsData) => {
  try {
    const response = await axiosInstance.post(`/api/bills`, billData);
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error(
      "Error creating bill:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to create bill. Please try again."
    );
  }
};

export const fetchBillById = async (billId: number) => {
  try {
    //const response = await axiosInstance.get(`/api/bills/${billId}`);
    //return response.data;
  } catch (error) {
    console.error("Failed to fetch bill details:", error);
    throw error;
  }
};

export const deleteBill = async (billId: number) => {
  try {
    const response = await axiosInstance.delete(`/api/bills/${billId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete bill ${billId}:`, error);
    throw error;
  }
};

export const fetchBillChart = async () => {
  try {
    const response = await axiosInstance.get("/api/bills/chart/bill-status");
    return response.data;
  } catch (error) {
    console.error("Error fetching bills chart:", error);
  }
};

export const sendBillEmail = async (billId: number) => {
  try {
    const response = await axiosInstance.post(
      `/api/bills/actions/send-email/${billId}`
    );
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to send email. Please try again."
    );
  }
};

export const updateBill = async (
  billId: number,
  billData: IBillDetailsData
) => {
  try {
    const response = await axiosInstance.put(`/api/bills/${billId}`, billData);
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error("Error edit bill:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to edit bill. Please try again."
    );
  }
};

export const downloadBillPdf = async (billId: number) => {
  try {
    console.log("downloadBillPdf Payload:", billId);

    // Make the API call with responseType set to 'blob'
    const response = await axiosInstance.post(
      `/api/bills/actions/download-pdf/${billId}`,
      null, // No body required for the POST request
      {
        responseType: "blob", // Ensure the response is treated as binary
      }
    );

    console.log("downloadBillPdf successfully:", response);

    return response.data; // Return the binary PDF data
  } catch (error: any) {
    console.error(
      "Error downloadBillPdf:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to downloadBillPdf. Please try again."
    );
  }
};

export const refundBill = async (
  billId: number,
  refundAmount: number,
  refundReason: string
) => {
  try {
    const response = await axiosInstance.post(
      `/api/bills/actions/refund/${billId}`,
      {
        refund_amount: refundAmount,
        refund_reason: refundReason,
      }
    );
    return response.data; // Return the data from the response
  } catch (error: any) {
    console.error(
      "Error refunding bill:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to refund bill. Please try again."
    );
  }
};
