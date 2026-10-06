import { Field } from '@/components/EntityForm';

const active: Field = { key: 'isActive', label: 'Active', type: 'checkbox', only: 'edit' };

export const AREA_FIELDS: Field[] = [
  { key: 'name', label: 'Name', required: true }, { key: 'province', label: 'Province' },
  { key: 'country', label: 'Country', hint: 'Defaults to South Korea' }, active,
];
export const PROGRAM_FIELDS: Field[] = [
  { key: 'name', label: 'Name', required: true }, { key: 'visaType', label: 'Visa type', hint: 'e.g. D-2, D-4' },
  { key: 'duration', label: 'Duration' }, { key: 'description', label: 'Description', type: 'textarea' }, active,
];
export const INTAKE_FIELDS: Field[] = [
  { key: 'name', label: 'Name', required: true, hint: 'e.g. SEPTEMBER-2026' }, { key: 'description', label: 'Description', type: 'textarea' }, active,
];
export const MAJOR_FIELDS: Field[] = [
  { key: 'name', label: 'Name', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, active,
];

export const APPLICANT_FIELDS: Field[] = [
  { key: 's1', label: 'Account & passport', type: 'section' },
  { key: 'passportNumber', label: 'Passport number', required: true },
  { key: 'password', label: 'Password', type: 'password', required: true, only: 'create', hint: 'Min 8 characters. Applicant logs in with this.' },
  { key: 'passportExpiryDate', label: 'Passport expiry', type: 'date' },
  { key: 's2', label: 'Personal information', type: 'section' },
  { key: 'firstName', label: 'First name', required: true }, { key: 'lastName', label: 'Last name' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE', 'OTHER'].map((v) => ({ value: v, label: v })) },
  { key: 'nationality', label: 'Nationality' },
  { key: 's3', label: 'Contact', type: 'section' },
  { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email', type: 'email' },
  { key: 'city', label: 'City' }, { key: 'country', label: 'Country' }, { key: 'address', label: 'Address', type: 'textarea' },
  { key: 's4', label: 'Sponsor & bank details', type: 'section' },
  { key: 'sponsor', label: 'Sponsor' }, { key: 'referencePerson', label: 'Reference person' },
  { key: 'fundUsd', label: 'Fund (USD)', type: 'number' },
  { key: 'bankOpenDate', label: 'Bank open date', type: 'date' }, { key: 'bankIssueDate', label: 'Bank issue date', type: 'date' },
  { key: 'bankMaturity', label: 'Bank maturity', type: 'date' },
];
