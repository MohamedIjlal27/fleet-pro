import React, { useState } from "react";
import { Typography, Button, Menu, MenuItem, Dialog } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { toast } from "react-toastify";
import { deleteBill, downloadBillPdf, sendBillEmail } from "../apis/apis"; // Import API function
interface DetailsMenuProps {
  id: number;
  status: string;
  hasDeletePermission: boolean;
  customerUrl?: string;
  noInvoiceStatusArray: string[];
  loadBills: () => void;
  isEdit?: boolean;
  bill: any;
  handleOpenDetails: (
    bill: any | null,
    mode: "edit" | "create" | "refund"
  ) => void;
}

const DetailsMenu: React.FC<DetailsMenuProps> = ({
  id,
  status,
  hasDeletePermission,
  customerUrl,
  noInvoiceStatusArray,
  handleOpenDetails,
  bill,
  loadBills,
  isEdit = true,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const confirmAndRefund = async () => {
    try {
      setLoading(true);
      // Add your refund API call here

      loadBills();
      handleOpenDetails(bill, `refund`);
    } catch (error) {
      toast.error("Failed to process refund. Please try again.");
      console.error("Error processing refund:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this payment record?"
    );
    if (isConfirmed) {
      try {
        await deleteBill(id);
        toast.success("Payment record deleted successfully!");
        loadBills(); // Refresh the bills after successful deletion
      } catch (error) {
        toast.error("Failed to delete the payment record. Please try again.");
        console.error("Error deleting bill:", error);
      }
    }
  };

  const handleSendBillEmail = async (id: number) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to send email to cusomter?"
    );
    if (isConfirmed) {
      try {
        await sendBillEmail(id);
        toast.success("email send successfully!");
      } catch (error) {
        toast.error("Failed to send email. Please try again.");
        console.error("Error sendBillEmail:", error);
      }
    }
  };

  const handleDownloadPDF = async (id: number) => {
    setLoading(true);

    try {
      // Call the API to get the PDF blob
      const pdfBlob = await downloadBillPdf(id);

      // Create a Blob object from the PDF data
      const blob = new Blob([pdfBlob], { type: "application/pdf" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary <a> element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bill_${id}.pdf`; // Set the desired filename

      // Append the link to the document, trigger the click, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the Blob URL
      window.URL.revokeObjectURL(url);

      toast.success("Download Bill PDF successfully!");
    } catch (error) {
      toast.error("Failed to download Bill PDF. Please try again.");
      console.error("Error downloading Bill PDF:", error);
    }

    setLoading(false);
  };

  const menuItems = [];

  // Add ACTIONS section
  if (!noInvoiceStatusArray.includes(status)) {
    menuItems.push(
      <MenuItem
        key="download-pdf"
        disabled={loading}
        onClick={() => handleDownloadPDF(id)}
        sx={{ color: "blue", fontSize: "0.875rem" }}
      >
        Download PDF
      </MenuItem>,
      <MenuItem
        key="send-email"
        onClick={() => handleSendBillEmail(id)}
        sx={{ color: "blue", fontSize: "0.875rem" }}
      >
        Send Email
      </MenuItem>
    );
  }

  if (hasDeletePermission) {
    if (status === "Unpaid") {
      menuItems.push(
        <MenuItem
          key="delete"
          onClick={() => handleDeleteBill(id)}
          sx={{ color: "blue", fontSize: "0.875rem" }}
        >
          Delete
        </MenuItem>,
        <MenuItem
          key="pay"
          onClick={() =>
            window.confirm("Are you sure you want to pay this bill?") &&
            console.log(`Pay bill with ID: ${id}`)
          }
          sx={{ color: "blue", fontSize: "0.875rem" }}
        >
          Pay
        </MenuItem>
      );
    } else if (["Paid", "PartRefunded"].includes(status)) {
      menuItems.push(
        <MenuItem
          key="refund"
          onClick={() => confirmAndRefund(id)}
          sx={{ color: "blue", fontSize: "0.875rem" }}
        >
          Refund
        </MenuItem>
      );
    }
  }

  // Add CONNECTIONS section
  if (!customerUrl && isEdit) {
    menuItems.push(
      <Typography
        key="connections"
        variant="subtitle1"
        sx={{ fontWeight: "bold", padding: "8px 16px", fontSize: "1rem" }}
      >
        CONNECTIONS
      </Typography>,
      <MenuItem
        key="view-customer"
        onClick={() => console.log(`Redirect to customer URL: ${customerUrl}`)}
        sx={{ color: "blue", fontSize: "0.875rem" }}
      >
        View Customer
      </MenuItem>
    );
  }

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {menuItems.length > 0 && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", padding: "8px 16px", fontSize: "1rem" }}
            >
              ACTIONS
            </Typography>
            {menuItems}
          </>
        )}
      </Menu>
    </div>
  );
};

export default DetailsMenu;
