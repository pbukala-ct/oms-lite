// components/OrderManagement.js
import React, { useState } from 'react';
import TabbedOrderTable from './TabbedOrderTable';
import OrderDetail from './OrderDetail';

const OrderManagement = ({ orders, onUpdateOrderState, orderStates, actionLabels }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleTabChange = () => {
    setExpandedOrder(null);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  };

  return (
    <div className="flex-grow flex overflow-hidden">
      <div className={`w-full transition-all duration-300 ease-in-out ${
        expandedOrder ? 'mr-[30rem]' : ''
      }`}>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-semibold text-ct-blue-dark">Dispatching In-Store Orders</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">In-store Order Fulfillment for commercetools</p>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 overflow-x-auto">
            <TabbedOrderTable
              orders={orders}
              onUpdateOrderState={onUpdateOrderState}
              orderStates={orderStates}
              actionLabels={actionLabels}
              onOrderExpand={setExpandedOrder}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </div>
      <div 
        className={`fixed top-16 right-0 bottom-0 w-[30rem] bg-white shadow-lg overflow-y-auto transition-all duration-300 ease-in-out transform ${
          expandedOrder ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <OrderDetail order={expandedOrder} onOrderUpdate={handleOrderUpdate} />
      </div>
    </div>
  );
};

export default OrderManagement;