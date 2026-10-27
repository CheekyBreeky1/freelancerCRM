import { customAlphabet } from 'nanoid';

// URL-safe алфавит: A-Z, a-z, 0-9, _ и -
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

export const generateId = customAlphabet(alphabet, 10);