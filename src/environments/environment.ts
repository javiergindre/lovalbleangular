export const environment: Environment = {
  production: false,
  apiUrl: 'https://localhost:51071/api/',
  // apiUrl: 'https://arventcloudapidev.azurewebsites.net/api/',
  defaultTenant: 'osmmedt',
  allowMultitenant: true,
  tenants: [


    {
      code: 'osmmedt',
      name: 'OSMMEDT',
      settings: {
        theme: 'dark',
        logo: './assets/images/tenants/osmmedt/logo.png',
        logo_mobile: './assets/images/tenants/osmmedt/logo_mobile.png',
        favicon: './assets/images/tenants/osmmedt/favicon.ico',
        language: 'es',
        skinDev: false,
      },
    },
    {
      code: 'italcred',
      name: 'Italcred',
      settings: {
        theme: 'light',
        logo: './assets/images/tenants/italcred/logo.png',
        logo_mobile: './assets/images/tenants/italcred/logo_mobile.svg',
        favicon: './assets/images/tenants/italcred/favicon.ico',
        language: 'en',
        skinDev: false,
      },
    },
    {
      code: 'brenson',
      name: 'brenson',
      settings: {
        theme: 'light',
        logo: './assets/images/tenants/brenson/logo.png',
        logo_mobile: './assets/images/tenants/brenson/logo.png',
        favicon: './assets/images/tenants/brenson/favicon.ico',
        language: 'en',
        skinDev: false,
      },
    },
    // Add more tenants as needed
  ],
};

export interface Environment {
  production: boolean;
  apiUrl: string;
  defaultTenant: string;
  allowMultitenant: boolean;
  tenants: Tenant[];
}

export interface Tenant {
  code: string;
  name: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  theme: string;
  logo: string;
  logo_mobile: string;
  favicon: string;
  language: string;
  skinDev: boolean;
}
