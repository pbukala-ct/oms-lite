import { apiRoot } from './commercetools-client'
import fetch from 'node-fetch';


const AUTH_HOST = 'auth.australia-southeast1.gcp.commercetools.com'; 
const CLIENT_ID = 'UQQEGRZoTshhDlsD784Ui-Gh';
const CLIENT_SECRET = '64DdbsCDBy5HTFEDu5hAkRgcTJ1yffCA';
const PROJECT_KEY = 'country-road'
const SCOPE = `manage_project:${PROJECT_KEY}`;


const getAuthToken = async () => {
  const response = await fetch(`https://${AUTH_HOST}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(SCOPE)}`
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};


export const paymentCapture = async (paymentId, amount, currencyCode) => {
  const projectKey = 'country-road'
  const region = 'australia-southeast1.gcp' 

  const token = await getAuthToken();


  console.log("Capturing payemnt: " + paymentId)
  const response = await fetch(`https://checkout.${region}.commercetools.com/${projectKey}/payment-intents/${paymentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actions: [{
        action: 'capturePayment',
        amount: {
          centAmount: amount,
          currencyCode: currencyCode,
        },
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to capture payment: ${response.statusText}`);
  }

  return await response.json();
};