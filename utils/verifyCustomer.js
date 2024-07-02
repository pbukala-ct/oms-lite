import { apiRoot } from './commercetools-client'

export const verifyCustomer = async (email) => {
    try {
      const response = await apiRoot
        .customers()
        .get({
          queryArgs: {
            where: `email="${email}"`,
            expand: ['custom.type', 'custom.fields.store']
          }
        })
        .execute();
  
      if (response.body.results.length === 0) {
        return { success: false, message: 'Customer not found' };
      }
  
      const customer = response.body.results[0];

      console.log("customer: " + JSON.stringify(customer.custom));
      
      if (!customer.custom || customer.custom.type.obj.key !== 'inStore' || !customer.custom.fields.store) {
        return { success: false, message: 'This user is not an In-Store operator' };
      }
  
      const storeId = customer.custom.fields.store.obj.id;
      return { success: true, storeId };
    } catch (error) {
      console.error('Error verifying customer:', error);
      return { success: false, message: 'An error occurred while verifying the customer' };
    }
  };