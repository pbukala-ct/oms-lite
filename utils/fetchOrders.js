// utils/fetchOrders.js
import { apiRoot } from './commercetools-client';
import { fetchChannels } from './channels';

export const fetchOrders = async (selectedChannel, allStores) => {
  try {
    // Fetch channels first
    const channels = await fetchChannels();
    const channelMap = channels.reduce((acc, channel) => {
      acc[channel.id] = channel.name;
      return acc;
    }, {});

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
          sort: ['createdAt asc'],
          where: where
        },
      })
      .execute();

    console.log('Response received:', response);

    // Fetch all order states
    const statesResponse = await apiRoot
      .states()
      .get({
        queryArgs: {
          where: 'type="OrderState"',
        },
      })
      .execute();

    const orderStates = statesResponse.body.results.reduce((acc, state) => {
      acc[state.key] = state;
      return acc;
    }, {});

    console.log('Order states:', orderStates);

    const formattedOrders = response.body.results
      .filter(order => {
        const hasValidState = order.state && order.state.obj;
        return hasValidState;
      })
      .map(order => ({
        id: order.id,
        version: order.version,
        createdAt: order.createdAt,
        customer: order.customerEmail || 'N/A',
        customerName: order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName,
        orderState: order.state.obj.key,
        orderStateObj: orderStates[order.state.obj.key],
        paymentState: order.paymentState,
        shippingInfo: order.shippingInfo,
        shippingAddress: order.shippingAddress,
        status: order.state.obj.key,
        paymentInfo: order.paymentInfo,
        timestamp:  order.custom?.fields?.timestamp,
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

    return { formattedOrders, orderStates };
  } catch (err) {
    console.error('Error fetching orders:', err);
    throw new Error('Failed to fetch orders. Please try again.');
  }
};