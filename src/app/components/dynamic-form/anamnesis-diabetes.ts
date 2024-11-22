// export const mockup = {
//     postUrl: 'https://example.com/api/submitWizardForm',
//     steps: [
//       {
//         title: 'Personal, Address and Payment Information',
//         containerConfig: {
//           cssClass: 'combined-info-container',
//         },
//         groups: [
//           {
//             groupName: 'Personal Information',
//             groupConfig: {
//               cssClass: 'personal-info-group',
//             },
//             rows: [
//               {
//                 fields: [
//                   {
//                     name: 'firstName',
//                     label: 'First Name',
//                     type: 'text',
//                     value: '',
//                     validators: ['required', 'minlength:2'],
//                     cssClass: 'col-md-6', // 50% width on medium and larger screens
//                   },
//                   {
//                     name: 'lastName',
//                     label: 'Last Name',
//                     type: 'text',
//                     value: '',
//                     validators: ['required'],
//                     cssClass: 'col-md-6', // 50% width on medium and larger screens
//                   },
//                 ],
//               },
//               {
//                 fields: [
//                   {
//                     name: 'email',
//                     label: 'Email',
//                     type: 'email',
//                     value: '',
//                     validators: ['required', 'email'],
//                     cssClass: 'col-md-12', // Full width on medium and larger screens
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             groupName: 'Address Details',
//             groupConfig: {
//               cssClass: 'address-info-group',
//             },
//             rows: [
//               {
//                 fields: [
//                   {
//                     name: 'country',
//                     label: 'Country',
//                     type: 'autocomplete',
//                     apiUrl: 'https://example.com/api/countries',
//                     value: '',
//                     validators: ['required'],
//                     cssClass: 'col-md-6',
//                   },
//                   {
//                     name: 'state',
//                     label: 'State',
//                     type: 'autocomplete',
//                     apiUrl: 'https://example.com/api/states',
//                     dependsOn: 'country',
//                     queryParam: 'country',
//                     value: '',
//                     validators: ['required'],
//                     cssClass: 'col-md-6',
//                   },
//                 ],
//               },
//               {
//                 fields: [
//                   {
//                     name: 'city',
//                     label: 'City',
//                     type: 'autocomplete',
//                     apiUrl: 'https://example.com/api/cities',
//                     dependsOn: 'state',
//                     queryParam: 'state',
//                     value: '',
//                     validators: ['required'],
//                     cssClass: 'col-md-12',
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             groupName: 'Payment Information',
//             groupConfig: {
//               cssClass: 'payment-info-group',
//             },
//             rows: [
//               {
//                 fields: [
//                   {
//                     name: 'cardNumber',
//                     label: 'Credit Card Number',
//                     type: 'number',
//                     value: '',
//                     validators: ['required', 'minlength:16', 'maxlength:16'],
//                     cssClass: 'col-md-6',
//                   },
//                   {
//                     name: 'expirationDate',
//                     label: 'Expiration Date',
//                     type: 'date',
//                     value: '',
//                     validators: ['required'],
//                     format: 'MM/YY',
//                     cssClass: 'col-md-6',
//                   },
//                 ],
//               },
//               {
//                 fields: [
//                   {
//                     name: 'cvv',
//                     label: 'CVV',
//                     type: 'number',
//                     value: '',
//                     validators: ['required', 'minlength:3', 'maxlength:4'],
//                     cssClass: 'col-md-12',
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };
  
  const anamnesis = {
    patientId: 12313213,
    medicamentos: [{},{}],
    caracteristicasFisicas: {
      peso: 100,
      altura: 170,
      imc: 10,
      cintura: 100
    },
    signosVitales: {},
    anamnesis:{}
  }

  export const mockup = {
    postUrl: 'https://example.com/api/submitWizardForm',
    stepType: 0, //0 = wizard horizontal, 1= wizard vertical, 2= accordion, 3= tabs
    specialAction: '',
    steps: [
      {
        title: 'Step 1: Personal Information',
        containerConfig: {
          cssClass: 'personal-info-container',
        },
        groups: [
          {
            groupName: 'Personal Information',
            groupConfig: {
              cssClass: 'personal-info-group',
            },
            rows: [
              {
                fields: [
                  {
                    name: 'firstName',
                    label: 'First Name',
                    type: 'text',
                    value: '',
                    validators: ['required', 'minlength:2'],
                    cssClass: 'col-md-6', // 50% width on medium and larger screens
                  },
                  {
                    name: 'lastName',
                    label: 'Last Name',
                    type: 'text',
                    value: '',
                    validators: ['required'],
                    cssClass: 'col-md-6', // 50% width on medium and larger screens
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    value: '',
                    validators: ['required', 'email'],
                    cssClass: 'col-md-12', // Full width on medium and larger screens
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Step 2: Address Information',
        containerConfig: {
          cssClass: 'address-info-container',
        },
        groups: [
          {
            groupName: 'Address Details',
            groupConfig: {
              cssClass: 'address-info-group',
            },
            rows: [
              {
                fields: [
                  {
                    name: 'country',
                    label: 'Country',
                    type: 'autocomplete',
                    apiUrl: 'https://example.com/api/countries',
                    value: '',
                    validators: ['required'],
                    cssClass: 'col-md-4',
                  },
                  {
                    name: 'state',
                    label: 'State',
                    type: 'autocomplete',
                    apiUrl: 'https://example.com/api/states',
                    dependsOn: 'country',
                    queryParam: 'country',
                    value: '',
                    validators: ['required'],
                    cssClass: 'col-md-4',
                  },
                  {
                    name: 'city',
                    label: 'City',
                    type: 'autocomplete',
                    apiUrl: 'https://example.com/api/cities',
                    dependsOn: 'state',
                    queryParam: 'state',
                    value: '',
                    validators: ['required'],
                    cssClass: 'col-md-4',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Step 3: Payment Information',
        containerConfig: {
          cssClass: 'payment-info-container',
        },
        groups: [
          {
            groupName: 'Payment Information',
            groupConfig: {
              cssClass: 'payment-info-group',
            },
            rows: [
              {
                fields: [
                  {
                    name: 'cardNumber',
                    label: 'Credit Card Number',
                    type: 'number',
                    value: '',
                    validators: ['required', 'minlength:16', 'maxlength:16'],
                    cssClass: 'col-md-6',
                  },
                  {
                    name: 'expirationDate',
                    label: 'Expiration Date',
                    type: 'date',
                    value: '',
                    validators: ['required'],
                    format: 'MM/YY',
                    cssClass: 'col-md-6',
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'cvv',
                    label: 'CVV',
                    type: 'number',
                    value: '',
                    validators: ['required', 'minlength:3', 'maxlength:4'],
                    cssClass: 'col-md-12',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  
  