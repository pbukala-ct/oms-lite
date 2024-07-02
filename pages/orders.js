import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router';
import Layout from '../components/Layout'
import { fetchChannels } from '../utils/channels';
import { apiRoot } from '../utils/commercetools-client'
import OrderManagement from '../components/OrderManagement';
import { paymentCapture } from '../utils/paymentCapture';

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

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/login');
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch channels first
    const channels = await fetchChannels();
    const channelMap = channels.reduce((acc, channel) => {
      acc[channel.id] = channel.name;
      return acc;
    }, {});

    // Get the selected channel and allStores state from localStorage
    const selectedChannel = localStorage.getItem('selectedChannel');
    const allStores = JSON.parse(localStorage.getItem('allStores') || 'true');

    // Prepare the query
    let where = null;
    
    console.log("Selected channel: " + selectedChannel);

    if (!allStores && selectedChannel) {
      where = `custom(fields(channel(id="${selectedChannel}")))`;
    }

      const response = await apiRoot
        .orders()
        .get({
          queryArgs: {
            limit: 100,
            expand: ['state', 'lineItems[*].variant', 'paymentInfo.payments[*]','custom.type', 'custom.fields.channel'],
            sort: ['createdAt desc'],
            where: where
          },
        })
        .execute()

      
  
      console.log('Response received:', response);

        // Fetch all order states
        const statesResponse = await apiRoot
        .states()
        .get({
        queryArgs: {
            where: 'type="OrderState"',
        },
        })
        .execute()

        const orderStates = statesResponse.body.results.reduce((acc, state) => {
        acc[state.key] = state;
        return acc;
        }, {});

        console.log('Order states:', orderStates);

  
       


      const formattedOrders = response.body.results
      .filter(order => {
        const hasValidState = order.state && order.state.obj;
       // console.log(`Order ${order.id} has valid state: ${hasValidState}`);
        return hasValidState;
      })
        .map(order => ({

          //const channelId = order.custom?.fields?.channel?.obj?.id;


          id: order.id,
          version: order.version,
          createdAt: order.createdAt,
          customer: order.customerEmail || 'N/A',
          customerName: order.shippingAddress.firstName +' ' + order.shippingAddress.lastName,
          orderState: order.state.obj.key,
          orderStateObj: orderStates[order.state.obj.key],
          paymentState: order.paymentState,
          shippingInfo: order.shippingInfo,
          shippingAddress: order.shippingAddress,
          status: order.state.obj.key,
          paymentInfo: order.paymentInfo,
          notes: order.custom?.fields?.['order-notes'] || [],
          statusDescription: order.state.obj.description.en || order.state.obj.key,
          allocatedStore: order.custom?.fields?.channel?.obj?.id ? {
            id: order.custom?.fields?.channel?.obj?.id,
            name: channelMap[order.custom?.fields?.channel?.obj?.id] || 'Unknown Store'
          } : null,
          
          total: `$${(order.totalPrice.centAmount / 100).toFixed(2)} ${order.totalPrice.currencyCode}`,
          lineItems: order.lineItems.map(item => ({
            productKey: item.productKey,
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
          })),
          paymentTransactions: order.paymentInfo?.payments
          .flatMap(payment => payment.obj.transactions.map(transaction => ({
            type: transaction.type,
            state: transaction.state,
            amount: `${(transaction.amount.centAmount / 100).toFixed(2)} ${transaction.amount.currencyCode}`
          }))) || []
          }));
        
  
      console.log('Formatted orders:', formattedOrders);
  
      setOrders(formattedOrders)
      setOrderStates(orderStates)  // Add this line

      setLoading(false)
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  }, [selectedChannel, allStores]);

 
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

   


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
        console.log("Trying to capture payemnts");
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
      
        
    } catch (error) {
      console.error('Failed to update order state:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };


  const handleStoreFilterChange = useCallback((channel, allStores) => {
    console.log("handleStoreFilterChange: " + channel)
    setSelectedChannel(channel);
    setAllStores(allStores);
  }, []);


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
      <OrderManagement
        orders={orders}
        onUpdateOrderState={onUpdateOrderState}
        orderStates={orderStates}
        actionLabels={actionLabels}
      />
    </Layout>
  );
}