export enum endpoints {
  // user
  SESSION = 'user/session',
  LOGIN = 'user/login',
  REGISTER_WITH_PROVIDERS = 'user/register-with-provider',
  EMAIL_VALIDATION = 'user/email-validation',

  // health
  HEALTH_PATIENTS = 'health/patient',
  HEALTH_PATIENT = 'health/patient/patient',
  HEALTH_INVOICES = 'health/invoices/invoices',
  HEALTH_INVOICE = 'health/invoices/invoice',
  HEALTH_INVOICE_CONFIRM = 'health/invoices/confirm',
  HEALTH_INVOICE_CONFIRM_FILES = 'health/invoices/confirm-files',
  HEALTH_INVOICE_APPROVE = 'health/invoices/approve',
  HEALTH_INVOICE_INVOICE_SIGNATURE = 'health/invoices/invoice-signature',
  HEALTH_INVOICE_REJECT = 'health/invoices/reject',
  HEALTH_INVOICE_REJECT_REASONS = 'health/invoices/reject-reasons',
  HEALTH_INVOICE_CONFIRM_CREDIT_NOTE = 'health/invoices/confirm-credit',
  HEALTH_INVOICE_CLOSE_CREDIT_NOTE = 'health/invoices/close-credit',
  HEALTH_INVOICE_RECEIPT = 'health/invoices/download-invoice-signature-file',
  HEALTH_INVOICE_SET_STATUS = 'health/invoices/invoice-set-status',
  HEALTH_INVOICE_REDEMPTION_LOTS = 'health/presentations/forlot?',
  HEALTH_PRESENTATIONS_LOTS = 'health/presentations',

  // anamnesis
  HEALTH_ANAMNESIS = 'health/treatment/anamnesis/',
  HEALTH_ANAMNESIS_REPORT = 'health/treatment/anamnesis/report',

  // comercial
  COMERCIAL_SEGMENTATION_SCORING = 'scoring/scorings',

  // crm
  CRM_LEADS = 'crm/leads/leads',
  CRM_LEADS_APPROVE = 'crm/leads/approve',
  CRM_LEADS_REJECT = 'crm/leads/reject',
  CRM_LEADS_SET_ACTIVITY = 'crm/leads/setactivity',

  //Messages
  MESSAGE_GET = 'Messages',
  MESSAGE_LEADS = 'Messages/Leads',
  MESSAGE_NEW_THREAD = 'Messages/AddMessageThread',
  MESSAGE_NEW_REPLY = 'Messages/AddMessage',

  //Calendar
  CALENDAR_NEW = 'Calendar/Add',
  CALENDARS_LIST = 'Calendar/GetCalendarsByEntity',
  CALENDARS_GET = 'Calendar/GetCalendarsByEvent',

  //EVENT
  EVENT_NEW = 'Event/AddEventEntity',
  EVENT_EDIT = 'Event/EditEvent',
  EVENT_ENTITY_GET = 'Event/events',
  EVENT_DELETE = 'Event/DeleteEvent',

  //statistics
  STATISTICS_LEADS = 'statistics/leads',
  STATISTICS_HEALTH_INVOICES = 'statistics/healthinvoices',

  // ??
  LOOKUP_AFFILIATES = 'health/affiliates/affiliates',
  LOOKUP_AFFILIATES_BY_PROVIDER = 'health/affiliatesbyprovider', // temporal
  LOOKUP_PRACTICES_BY_AFFILIATE_AND_PROVIDER = 'health/practicesByAffiliateAndProvider', // temporal

  //Drugs
  DRUGS_NEW = 'Drugs/add',

  // top documents
  TOP_DOCUMENTS = 'TopDocuments',

  // lookups
  LOOKUP_TAX_CONDITIONS = 'lookup/health/taxconditions',
  LOOKUP_PERIOD = 'lookup/periods',
  LOOKUP_HEALTH_SERVICES = 'lookup/health/services',
  LOOKUP_HEALTH_SERVICES_V2 = 'lookup/v2/health/services',
  LOOKUP_HEALTH_SERVICES_PLANS = 'lookup/health/serviceplans',
  LOOKUP_PLACES = 'lookup/places',
  LOOKUP_HEALTH_AFFILIATES = 'lookup/health/affiliates',
  LOOKUP_HEALTH_PRODUCT = 'lookup/health/products',
  LOOKUP_DRUGS = 'lookup/drugs',
  LOOKUP_DOCTORS = 'lookup/doctors',

  //TREATMENT
  TREATMENT_DRUG_NEW = 'health/treatment/drugs/addOrUpdate',
  TREATMENT_DRUGS = 'health/treatment/drugs',
  TREATMENT_DELETE = 'health/treatment/drugs/delete',

  //WORKFLOW
  WORKFLOW_GET = 'Workflow',

  //claims
  CLAIMS_GET = 'claims/claims',
  CLAIMS_SET_ACTIVITY = 'claims/setactivity',
  CLAIMS_REJECT = 'claims/reject',
}
