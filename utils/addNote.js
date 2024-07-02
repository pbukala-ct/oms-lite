import { apiRoot } from './commercetools-client'

export const addNoteToOrder = async (orderId, orderVersion, currentNotes, newNote) => {
    
    
    try {
      const updatedOrder = await apiRoot
        .orders()
        .withId({ ID: orderId })
        .post({
          body: {
            version: orderVersion,
            actions: [
              {
                action: 'setCustomField',
                name: 'order-notes',
                value: [...currentNotes, newNote]
              }
            ]
          }
        })
        .execute();
  
      return updatedOrder.body;
    } catch (error) {
      console.error('Error adding note to order:', error);
      throw error;
    }
  };