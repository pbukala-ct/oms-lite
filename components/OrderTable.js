import { format } from 'date-fns';
import { useState, Fragment } from 'react';
import Image from 'next/image';
import ImagePopover from './ImagePopover';
import { generatePackingSlip } from '../utils/printPackingSlip';


const predefinedStatusOrder = [
    'open',
    'store-allocated',
    'store-confirmed',
    'payment-confirmation',
    'print',
    'ship',
    'manifest',
    'collection',
    'completed'
  ];

export default function OrderTable({ orders = [], onUpdateOrderState, orderStates, actionLabels, expandedOrder, onOrderExpand }) {
  const [updatingOrder, setUpdatingOrder] = useState(null);
  // const [expandedOrder, setExpandedOrder] = useState(null);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-500 text-gray-100';
      case 'store-confirmed':
        return 'bg-yellow-400 text-yellow-900';
      case 'store-allocated':
        return 'bg-purple-400 text-purple-900';
      case 'payment-confirmation':
        return 'bg-purple-400 text-purple-900';
      case 'print':
        return 'bg-indigo-600 text-gray-100';
      case 'ship':
          return 'bg-cyan-600 text-gray-100';  
      case 'complete':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatShippingAddress = (address) => {
    if (!address) return 'N/A';
    const { streetName, city, state } = address;
    return [streetName, city, state].filter(Boolean).join(', ');
  };

  const truncateOrderId = (orderId) => {
    return orderId.substring(0, 8);
  };

  const getNextState = (currentState) => {
    const currentIndex = predefinedStatusOrder.indexOf(currentState.toLowerCase());
    if (currentIndex === -1 || currentIndex === predefinedStatusOrder.length - 1) {
      return null;
    }
    const nextStateKey = predefinedStatusOrder[currentIndex + 1];
    //console.log("*** nextStateKey: " + nextStateKey)
    return {
      key: nextStateKey,
      name: { en: actionLabels[currentState] || currentState.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
    };
  };


  const handleUpdateState = async (orderId, nextState) => {
    setUpdatingOrder(orderId);
    await onUpdateOrderState(orderId, nextState.key);
    setUpdatingOrder(null);
  };


  const getAttributeValue = (attributes, attributeName, valueName) => {
    const attribute = attributes.find(attr => attr.name === attributeName);
    if (attribute && Array.isArray(attribute.value)) {
      const valueObj = attribute.value.find(val => val.name === valueName);
      return valueObj ? valueObj.value : 'N/A';
    }
    return 'N/A';
  };

  const handlePrintingPackingSlip = (order) => {
    generatePackingSlip(order);
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center py-4">No orders in this status.</div>;
  }

  return (
    <div className="relative">  {/* Add this wrapper div */}

    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-ct-blue-light">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Order ID
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Order Date
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Customer
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Order Status
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Payment State
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Shipping Method
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Shipping Address
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Total
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ct-blue-dark uppercase tracking-wider">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map((order) => (
          <Fragment key={order.id}>
             <tr 
              className={`hover:bg-purple-50 cursor-pointer transition-colors duration-150 ease-in-out
                ${expandedOrder === order.id ? 'bg-purple-100' : ''}`}
                onClick={() => onOrderExpand(order.id)} >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{truncateOrderId(order.id)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderState)}`}>
                  {order.orderState}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentState}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shippingInfo?.shippingMethodName || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatShippingAddress(order.shippingAddress)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex items-center space-x-3">
                {getNextState(order.orderState) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateState(order, getNextState(order.orderState));
                    }}
                    disabled={updatingOrder === order.id}
                    className="bg-ct-blue hover:bg-ct-blue-dark text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                    >
                    {updatingOrder === order.id ? 'Updating...' : `${getNextState(order.orderState).name.en}`}
                  </button>
                )}
                {order.orderState === 'store-allocated' && (
                    <button
                      // onClick={() => onUpdateOrderState(order, 'open')}

                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOrderState(order, 'open');
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                    >
                      Reject
                    </button>
                  )}
                   {order.orderState === 'print' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                       // Print PDF packing slip
                       handlePrintingPackingSlip(order);
                      }}
                      className="bg-lime-700 hover:bg-lime-800 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                    >
                      Print Pick Slip
                    </button>
                  )}
                  </div>
              </td>
            </tr>
            {expandedOrder === order.id && (
              <tr className="bg-purple-50">
                <td colSpan="9">
                  <table className="min-w-full divide-y divide-purple-200">
                    <thead className="bg-purple-20">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Image</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Barcode</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Colour</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-purple-100">
                      {order.lineItems.map((item, index) => (
                        <tr key={`${order.id}-item-${index}`} className="hover:bg-purple-50 transition-colors duration-150 ease-in-out">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-10 h-10 group">
                            <ImagePopover
                              src={item.variant.images[0].url}
                              alt={item.name.en}
                            />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productKey}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name.en}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getAttributeValue(item.variant.attributes, 'variantColour', 'colour')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getAttributeValue(item.variant.attributes, 'variantSize', 'size')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
    </div>
  );
}