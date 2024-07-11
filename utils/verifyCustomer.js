import { apiRoot } from './commercetools-client'

export const verifyCustomer = async (email, password) => {
  try {
    const response = await apiRoot
      .login()
      .post({
        body: {
          email: email,
          password: password,
        }
      })
      .execute();

    if (response.body.customer) {
      const customerResponse = await apiRoot
        .customers()
        .withId({ ID: response.body.customer.id })
        .get({
          queryArgs: {
            expand: ['custom.type', 'custom.fields.store']
          }
        })
        .execute();

      const customer = customerResponse.body;

      if (!customer.custom || customer.custom.type.obj.key !== 'inStore' || !customer.custom.fields.store) {
        return { success: false, message: 'This user is not an In-Store operator' };
      }

      const storeId = customer.custom.fields.store.obj.id;
      return { success: true, storeId, token: response.body.token };
    } else {
      return { success: false, message: 'Invalid email or password' };
    }
  } catch (error) {
    console.error('Error verifying customer:', error);
    if (error.statusCode === 400 && error.message) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'An error occurred while verifying the customer' };
  }
};