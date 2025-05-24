import React from "react";
import { OrdersPage } from "@/modules/Orders/pages/OrdersPage";

interface OrderHistoryTabPros {
  customerId?: number;
}

export const OrderHistoryTab: React.FC<OrderHistoryTabPros> = ({customerId}) => {
  return <OrdersPage
    isEdit={false}
    customerId={customerId}
  />
};
