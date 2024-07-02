import { useState, useMemo, useEffect, useRef } from 'react';
import OrderTable from './OrderTable';
import {
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CreditCardIcon,
  PrinterIcon,
  CheckIcon,
  TruckIcon,
  DocumentIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const statusIcons = {
  'open': ShoppingCartIcon,
  'store-allocated': BuildingStorefrontIcon,
  'store-confirmed': CheckCircleIcon,
  'payment-confirmation': CreditCardIcon,
  'print': PrinterIcon,
  'completed': CheckIcon,
  'ship': TruckIcon,
  'manifest': DocumentIcon,
  'collection': UserCircleIcon
};

const predefinedStatusOrder = [
    { key: 'open', label: 'Open', desc: 'Currently not processed orders' },
    { key: 'store-allocated', label: 'Store Allocated', desc: 'Currently outstanding orders' },
    { key: 'store-confirmed', label: 'Store Confirmed', desc: 'Orders ready for allocation' },
    { key: 'payment-confirmation', label: 'Confirm', desc: 'Awaiting payment confirmation' },
    { key: 'print', label: 'Print', desc: 'Ready for printing' },
    { key: 'ship', label: 'Ship', desc: 'Ready for shipping' },
    { key: 'manifest', label: 'Manifest', desc: 'Included in shipping manifest' },
    { key: 'collection', label: 'Collection', desc: 'Waitinf for collection' },
    { key: 'completed', label: 'Completed', desc: 'Fully processed orders' }
  ];

export default function TabbedOrderTable({ orders, onUpdateOrderState, orderStates, actionLabels, onOrderExpand, onTabChange }) {
    const [activeTab, setActiveTab] = useState(predefinedStatusOrder[0].key);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const tabsRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);



  useEffect(() => {
    const checkForArrows = () => {
      if (tabsRef.current) {
        setShowLeftArrow(tabsRef.current.scrollLeft > 0);
        setShowRightArrow(
          tabsRef.current.scrollWidth > tabsRef.current.clientWidth &&
          tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth
        );
      }
    };

    checkForArrows();
    window.addEventListener('resize', checkForArrows);
    return () => window.removeEventListener('resize', checkForArrows);
  }, []);

  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = tabsRef.current.clientWidth / 2;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
 



    const handleOrderExpand = (orderId) => {
      const newExpandedOrder = expandedOrder === orderId ? null : orderId;
      setExpandedOrder(newExpandedOrder);
      onOrderExpand(newExpandedOrder ? orders.find(order => order.id === newExpandedOrder) : null);
    };

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      const status = order.status.toLowerCase();
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(order);
      return acc;
    }, {});
  }, [orders]);

  // Sort status keys based on the predefined order and any new statuses
  const sortedStatusKeys = useMemo(() => {
    const statusKeys = Object.keys(ordersByStatus);
    return statusKeys.sort((a, b) => {
      const indexA = predefinedStatusOrder.indexOf(a);
      const indexB = predefinedStatusOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [ordersByStatus]);



  const handleUpdateOrderState = async (orderId, nextState) => {
    await onUpdateOrderState(orderId, nextState); 
  };

  

  const renderOrderTable = (status, orders, onUpdateOrderState, orderStates) => {
    if (!orders || orders.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            There are currently no orders with the status "{status}".
          </div>
        );
      }
        return <OrderTable orders={orders} 
                          onUpdateOrderState={handleUpdateOrderState} 
                          orderStates={orderStates} 
                          actionLabels={actionLabels}  
                          expandedOrder={expandedOrder}
                          onOrderExpand={handleOrderExpand}
                          />;

  };

  if (orders.length === 0) {
    return <div>No orders found.</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">

      <div className="relative">
              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white to-transparent px-2"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                </button>
              )}
              {showRightArrow && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white to-transparent px-2"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <div 
                ref={tabsRef}
                className="border-b border-gray-200 overflow-x-auto scrollbar-hide"
                onScroll={() => {
                  setShowLeftArrow(tabsRef.current.scrollLeft > 0);
                  setShowRightArrow(
                    tabsRef.current.scrollWidth > tabsRef.current.clientWidth &&
                    tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth
                  );
                }}
              >

      {/* <div className="border-b border-gray-200"> */}
      <nav className="flex" aria-label="Tabs">
          {predefinedStatusOrder.map((status) => {
            const IconComponent = statusIcons[status.key];
            return (
              <button
                key={status.key}
                onClick={() => setActiveTab(status.key)}
                className={`
                  flex items-center space-x-2 flex-shrink-0 px-6 py-4 text-sm font-medium
                  border-b-2 focus:outline-none transition-all duration-200
                  ${activeTab === status.key
                    ? 'bg-ct-blue text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {IconComponent && <IconComponent className="w-5 h-5" />}
                <span>{status.label}</span>
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {ordersByStatus[status.key]?.length || 0}
                </span>
              </button>
            );
          })}
        </nav>
        </div>
      </div>
      {activeTab && (
        <div className="bg-ct-blue-light border-l-4 border-ct-blue px-6 py-3 mb-4">
        <p className="text-ct-blue font-semibold text-base">
          {predefinedStatusOrder.find(status => status.key === activeTab)?.desc}
        </p>
      </div>
      )}
      <div className="overflow-x-auto">
        {renderOrderTable(activeTab, ordersByStatus[activeTab])}
      </div>
    </div>
  );
}