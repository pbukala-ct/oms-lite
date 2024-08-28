import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router';
import Layout from '../components/Layout'
import { fetchChannels } from '../utils/channels';
import { apiRoot } from '../utils/commercetools-client'
import OrderManagement from '../components/OrderManagement';
import { paymentCapture } from '../utils/paymentCapture';
import { fetchOrders } from '../utils/fetchOrders';
// import { useNotifications } from '../components/Notifications';
import { useNotification } from '../context/NotificationContext';



export default function Orders() {

    const actionLabels = {
        'open': 'Manual Allocation',
        'store-allocated': 'Confirm',
        'store-confirmed': 'Allocate',
        'payment-confirmation': 'Process Payments',
        'print': 'Ready to Ship',
        'ship': 'Confrim Shippment',
        'collection': 'Confirm Pick Up',
        'completed': 'Contact Support',
        // Add any additional states and their corresponding labels here
      };


  const router = useRouter();
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderStates, setOrderStates] = useState({});
  const [selectedChannel, setSelectedChannel] = useState('');
  const [allStores, setAllStores] = useState(true);
  const { addNotification } = useNotification();

  // useEffect(() => {
  //   fetchOrders();
  // }, [selectedChannel, allStores]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/login');
    }
  }, [router]);

  const fetchOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      const selectedChannel = localStorage.getItem('selectedChannel');
      const allStores = JSON.parse(localStorage.getItem('allStores') || 'true');
      
      const { formattedOrders, orderStates } = await fetchOrders(selectedChannel, allStores);
      
      setOrders(formattedOrders);
      setOrderStates(orderStates);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  },  [selectedChannel, allStores]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

   


  const onUpdateOrderState = async (order, nextState) => {
    try {

      // console.log("Updating order state: " + JSON.stringify(order.id))
       console.log("Updating order state: " + JSON.stringify(nextState))

      // Extract the state ID based on the nextState key
      const stateId = orderStates[nextState]?.id;
      const newState = orderStates[nextState];



      // If the next state is 'print' (which comes after 'payment-confirmation'),
      // we need to capture the payment first
      if (nextState === 'print') {
        console.log("Capturing payment with commercetools checkout APIs");
        const authorizedPayment = order.paymentInfo?.payments.find(payment => 
          payment.obj?.transactions.some(transaction => 
            transaction.type === 'Authorization' && transaction.state === 'Success'
          )
        );

        if (authorizedPayment) {
          const authorizedTransaction = authorizedPayment.obj.transactions.find(
            transaction => transaction.type === 'Authorization' && transaction.state === 'Success'
          );

          await paymentCapture(
            authorizedPayment.id,
            authorizedTransaction.amount.centAmount,
            authorizedTransaction.amount.currencyCode
          );
        } else {
          console.warn('No authorized payment found for order:', order.id);
        }
      }

      const currentTimestamp = new Date().toISOString();

      const updatedOrder = await apiRoot
        .orders()
        .withId({ ID: order.id })
        .post({
            body:{
            version: order.version, 
            actions: [
              {
                action: 'transitionState',
                state: {
                    typeId: "state",
                    id: stateId
                }
              },
              {
                action : "setCustomField",
                name: "timestamp",
                value: currentTimestamp
              }
            ]
        }
        })
        .execute();
        setOrders(prevOrders => {
            const newOrders =  prevOrders.map(order => 
              order.id === updatedOrder.body.id ? {
                ...order,
                ...updatedOrder.body,
                orderState: nextState,
                status: nextState,
                statusDescription: newState.description.en || newState.key,
                version: updatedOrder.body.version
              } : order
            );
            console.log('Updated orders:', newOrders);
            return newOrders;
     } );
      
     showSuccess('Order Updated', `Order ${order.id} has been moved to ${nextState} state.`);
  
    } catch (error) {
      console.error('Failed to update order state:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };


  const handleStoreFilterChange = useCallback((channel, allStores) => {
    console.log("handleStoreFilterChange: " + channel)
    setSelectedChannel(channel);
    setAllStores(allStores);
    addNotification('Store has been changed', 'info');
  }, []);

  const testNotification = () => {
    addNotification('This is a test notification', 'info');
  };




  if (loading) {
    return (
      <Layout onStoreFilterChange={handleStoreFilterChange}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ct-blue"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout onStoreFilterChange={handleStoreFilterChange}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onStoreFilterChange={handleStoreFilterChange}>

{/* <button onClick={testNotification}>Test Notification</button> */}


      <OrderManagement
        orders={orders}
        onUpdateOrderState={onUpdateOrderState}
        orderStates={orderStates}
        actionLabels={actionLabels}
      />
    </Layout>
  );
}