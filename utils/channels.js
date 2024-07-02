import { apiRoot } from './commercetools-client'

export const fetchChannels = async () => {
    try {
      const response = await apiRoot
        .channels()
        .get({
          queryArgs: {
            where: 'roles contains any ("InventorySupply")',
            expand: ['custom.type', 'custom.fields.isStore'],
            limit: 500 // Adjust as needed
          }
        })
        .execute();
  
      const filteredChannels = response.body.results.filter(channel => 
        channel.custom?.fields?.isStore === true
      );
  
      return filteredChannels.map(channel => ({
        id: channel.id,
        key: channel.key,
        name: channel.name.en || channel.key
      }));
    } catch (error) {
      console.error("Error fetching channels:", error);
      throw error;
    }
  };