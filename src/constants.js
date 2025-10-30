export const DB_NAME = "derma-care";

export const OTP_EXPIRY_TIME = 10 * 60 * 1000; 
export const MAX_RESENDS_PER_HOUR = 3;

export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'system', 'root', 'owner', 'support',
  'moderator', 'staff', 'api', 'null', 'undefined', 'me', 'you'
];

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'USER', 'MEMBER'];

export const PERMISSIONS = [
  'READ_USERS', 'CREATE_USERS', 'UPDATE_USERS', 'DELETE_USERS',
  'READ_ROLES', 'CREATE_ROLES', 'UPDATE_ROLES', 'DELETE_ROLES',
  'READ_PERMISSIONS', 'ASSIGN_PERMISSIONS', 'REVOKE_PERMISSIONS',
  'VIEW_DASHBOARD', 'EDIT_PROFILE', 'MANAGE_SETTINGS',
  'ACCESS_REPORTS', 'EXPORT_DATA', 'IMPORT_DATA'
];


// constants.js

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [...PERMISSIONS], // all permissions
  ADMIN: [
    'READ_USERS', 'CREATE_USERS', 'UPDATE_USERS',
    'READ_ROLES', 'READ_PERMISSIONS',
    'VIEW_DASHBOARD', 'EDIT_PROFILE', 'MANAGE_SETTINGS'
  ],
  MEMBER: [
    'VIEW_DASHBOARD', 'EDIT_PROFILE'
  ],
  USER: [
    'EDIT_PROFILE',
    'POST_SHIPMENTS', 'VIEW_USER_DASHBOARD', 'CREATE_TICKETS',' TRACK_COURIERS_STATUS', 
  ]
};
