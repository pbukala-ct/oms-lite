// components/OrderDetail.js
import React, { useState, useEffect } from 'react';
import NotesTable from './NotesTable';
import { addNoteToOrder } from '../utils/addNote';
import { PlusCircleIcon } from '@heroicons/react/16/solid';

import {
    ShoppingCartIcon,
    BuildingStorefrontIcon,
    CheckCircleIcon,
    CreditCardIcon,
    PrinterIcon,
    CheckIcon,
    TruckIcon,
    DocumentIcon
  } from '@heroicons/react/24/outline';
  
  const orderStates = [
    { key: 'open', label: 'Open', icon: ShoppingCartIcon, color: 'bg-red-500' },
    { key: 'store-allocated', label: 'Store Allocated', icon: BuildingStorefrontIcon, color: 'bg-purple-400' },
    { key: 'store-confirmed', label: 'Store Confirmed', icon: CheckCircleIcon, color: 'bg-yellow-400' },
    { key: 'payment-confirmation', label: 'Payment Confirmation', icon: CreditCardIcon, color: 'bg-purple-500' },
    { key: 'print', label: 'Print', icon: PrinterIcon, color: 'bg-indigo-500' },
    { key: 'completed', label: 'Completed', icon: CheckIcon, color: 'bg-green-700' },
    { key: 'ship', label: 'Ship', icon: TruckIcon, color: 'bg-blue-700' },
    { key: 'manifest', label: 'Manifest', icon: DocumentIcon, color: 'bg-gray-700' }
  ];


const OrderDetail = ({ order, onOrderUpdate }) => {

    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [localNotes, setLocalNotes] = useState([]);

    useEffect(() => {
        // Initialize localNotes with order.notes if it exists, otherwise use an empty array
        if(order?.notes !== undefined){
            setLocalNotes(order.notes)
        }else{
            setLocalNotes([]);
        }
        
      }, [order]);

    if (!order) return null;
    const currentStateIndex = orderStates.findIndex(state => state.key === order.orderState);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
          case 'open':
            return 'bg-red-500 text-gray-100';
            case 'store-confirmed':
            return 'bg-yellow-400 text-yellow-900';
            case 'store-allocated':
            return 'bg-purple-400 text-purple-900';
            case 'print':
                return 'bg-blue-400 text-blue-900';
            case 'payment-confirmation':
                return 'bg-purple-400 text-purple-900';
            case 'ship':
            return 'bg-red-400 text-red-900';
            case 'complete':
           return 'bg-red-400 text-red-900';
          default:
            return 'bg-gray-400 text-gray-900';
        }
      };

      const sectionHeaderClass = "px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg text-white text-lg font-semibold";


      const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
    
        setIsAddingNote(true);
        try {
          const updatedOrder = await addNoteToOrder(order.id, order.version, order.notes, newNote);
            // Update local state
            setLocalNotes([...localNotes, newNote]);
            setNewNote('');
            
            // Update parent component
            onOrderUpdate({
                ...order,
                notes: [...localNotes, newNote],
                version: updatedOrder.version
      });
        } catch (error) {
          console.error('Failed to add note:', error);
          // Here you might want to show an error message to the user
        } finally {
          setIsAddingNote(false);
        }
      };


  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-8 py-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
      </div>
      <div className="p-8 space-y-8">
       {/* Order Workflow Status */}
       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
       <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg text-white text-lg font-semibold">
            <h3 className="text-lg leading-6 font-medium text-white">Order Workflow Status</h3>
        </div>
          <div className="border-t border-gray-200 px-2 py-3 sm:p-0">
            <div className="flex items-start justify-between px-2 py-3 sm:px-4 sm:py-5">
              {orderStates.map((state, index) => {
                const IconComponent = state.icon;
                const isCurrent = index === currentStateIndex;
                const isPast = index < currentStateIndex;
                return (
                  <div key={state.key} className="flex flex-col items-center flex-1 relative">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center mb-1
                      ${isCurrent ? state.color : isPast ? 'bg-gray-500' : 'bg-gray-200'}
                    `}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-2xs text-center h-8 overflow-hidden">
                      <span className={isCurrent ? 'font-bold' : ''}>{state.label}</span>
                    </div>
                    {index < orderStates.length - 1 && (
                      <div className={`absolute top-3 left-1/2 w-full h-0.5 ${isPast ? 'bg-gray-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Order Summary</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.orderState)}`}>
                {order.orderState}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <p className="text-blue-200 text-sm">Order ID</p>
                <p className="font-mono text-lg">{order.id}</p>
                </div>
                <div>
                <p className="text-blue-200 text-sm">Order Date</p>
                <p className="text-lg">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                <p className="text-blue-200 text-sm">Total Amount</p>
                <p className="text-lg font-semibold">{order.total}</p>
                </div>
                <div>
                    <p className="text-blue-200 text-sm">Allocated Store</p>
                    <p className="text-lg">{order.allocatedStore ? order.allocatedStore.name : 'Not allocated'}</p>
                </div>
                <div>
                <p className="text-blue-200 text-sm">Payment Status</p>
                <p className="text-lg">{order.paymentState}</p>
                </div>
            </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
          <h3 className={sectionHeaderClass}>Customer Information</h3>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customerName}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.shippingAddress?.streetName}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                </dd>
              </div>
            </dl>
          </div>
        </div>

       

        {/* Order Items */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <h3 className={sectionHeaderClass}>Order Items</h3>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {order.lineItems.map((item, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16">
                      <img className="h-16 w-16 rounded-md object-cover" src={item.variant.images[0]?.url} alt={item.name.en} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name.en}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-900 font-medium">${(item.variant.prices[0].value.centAmount / 100).toFixed(2)}</p>                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Transactions */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <h3 className={sectionHeaderClass}>Payment Transactions</h3>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.paymentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.state === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Notes Section */}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
          <h3 className={sectionHeaderClass}>Order Notes</h3>
      
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <NotesTable notes={localNotes} />
            {/* Add Note Form */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h4>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label htmlFor="new-note" className="sr-only">
                    New Note
                  </label>
                  <textarea
                    id="new-note"
                    name="new-note"
                    rows="3"
                    className="shadow-sm focus:ring-ct-blue focus:border-ct-blue block w-full sm:text-sm border-gray-300 rounded-md"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ct-blue hover:bg-ct-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ct-blue ${
                      (isAddingNote || !newNote.trim()) && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default OrderDetail;