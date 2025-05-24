// import axiosInstance from "@/utils/axiosConfig"; // Commented out for demo mode
// Commented out for local development without backend
// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const BASE_URL = ''; // Disabled for local development
import { useAppDispatch } from "@/redux/app/store";
import { clearUser } from "@/redux/features/user";

export const fetchInspectionReport = async (id: string) => {
  try {
    console.log(`[DEMO MODE] fetchInspectionReport for id: ${id}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo inspection report data
    const demoReport = {
      id: Number(id),
      createdAt: new Date().toISOString(),
      vin: "1FTDS1EF5DDA12345",
      rating: [
        { item: "Engine", points: "8" },
        { item: "Brakes", points: "9" },
        { item: "Tires", points: "7" }
      ],
      operationNotes: "Vehicle inspected and found to be in good condition with minor wear on tires.",
      inspectionItems: [
        { desc: "Engine oil level and quality checked", item: "Engine Oil" },
        { desc: "Brake pads and fluid checked", item: "Brake System" },
        { desc: "Tire pressure and tread depth verified", item: "Tires" },
        { desc: "All lights functioning properly", item: "Lights" }
      ],
      aiImages: [
        "https://via.placeholder.com/300x200/007ACC/FFFFFF?text=AI+Image+1",
        "https://via.placeholder.com/300x200/28A745/FFFFFF?text=AI+Image+2"
      ],
      images: [
        "https://via.placeholder.com/300x200/DC3545/FFFFFF?text=Upload+1",
        "https://via.placeholder.com/300x200/FD7E14/FFFFFF?text=Upload+2"
      ],
      imagesInfo: {
        capturedCount: 2,
        uploadedCount: 2
      },
      orderInfo: {
        status: 1,
        serviceType: 1
      },
      customerInfo: {
        phone: "+1-555-123-4567",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        address: "123 Main Street, Toronto, ON M5V 3A8",
        licenseNumber: "D123456789",
        expiryDate: "2025-12-31",
        age: "35"
      },
      vehicleDetail: {
        plateNumber: "ABC-123",
        make: "Ford",
        model: "Transit",
        "KM in": "45000",
        "KM out": "45025"
      },
      companyInfo: {
        name: "Synops AI Fleet Management",
        address: "456 Business Ave, Toronto, ON M4B 1B3"
      }
    };
    
    console.log("[DEMO MODE] Returning demo inspection report:", demoReport);
    return demoReport;
  } catch (error) {
    console.error("Error fetching inspection report (demo mode):", error);
    throw error;
  }
};

export const signReport = async (id: number, base64Data: string) => {
  try {
    console.log(`[DEMO MODE] signReport for id: ${id}, signature length: ${base64Data.length}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo response
    const demoResponse = {
      data: {
        success: true,
        message: "Signature saved successfully",
        inspectionReportId: id,
        signatureId: Date.now()
      },
      status: 200
    };
    
    console.log("[DEMO MODE] Signature saved successfully");
    return demoResponse;
  } catch (error) {
    console.error("Error signing report (demo mode):", error);
    throw error;
  }
};

export const reSetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    console.log(`[DEMO MODE] reSetPassword for token: ${token.substring(0, 10)}...`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoResponse = {
      data: {
        success: true,
        message: "Password reset successfully"
      },
      status: 200
    };
    
    console.log("[DEMO MODE] Password reset successfully");
    return demoResponse;
  } catch (error) {
    console.error("Error resetting password (demo mode):", error);
    throw error;
  }
};

export const SetNewPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    console.log(`[DEMO MODE] SetNewPassword for token: ${token.substring(0, 10)}...`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoResponse = {
      data: {
        success: true,
        message: "New password set successfully"
      },
      status: 200
    };
    
    console.log("[DEMO MODE] New password set successfully");
    return demoResponse;
  } catch (error) {
    console.error("Error setting new password (demo mode):", error);
    throw error;
  }
};

export const logout = async () => {
  // Demo mode logout - just clear localStorage
  try {
    localStorage.removeItem('demoUser');
    console.log('Logged out successfully (demo mode)');
    return Promise.resolve();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUserInfoByToken = async (token: string) => {
  try {
    console.log(`[DEMO MODE] getUserInfoByToken for token: ${token.substring(0, 10)}...`);
    // Attempt to logout first
    await logout();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoResponse = {
      data: {
        id: 1,
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        role: "admin",
        organizationId: 1
      },
      status: 200
    };
    
    console.log("[DEMO MODE] User info retrieved successfully");
    return demoResponse;
  } catch (error) {
    console.error("Error fetching user info (demo mode):", error);
    throw error;
  }
};
