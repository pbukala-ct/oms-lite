import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk'
import { ClientBuilder } from '@commercetools/sdk-client-v2'

const projectKey = 'country-road'
const scopes = ['manage_project:country-road']

const ctpClient = new ClientBuilder()
  .withClientCredentialsFlow({
    host: 'https://auth.australia-southeast1.gcp.commercetools.com',
    projectKey,
    credentials: {
      clientId: 'UQQEGRZoTshhDlsD784Ui-Gh',
      clientSecret: '64DdbsCDBy5HTFEDu5hAkRgcTJ1yffCA',
    },
    scopes,
  })
  .withHttpMiddleware({
    host: 'https://api.australia-southeast1.gcp.commercetools.com',
  })
  .build()

const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey })

export { apiRoot }