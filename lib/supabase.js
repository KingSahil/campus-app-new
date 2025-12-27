import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://2r925b9b.us-west.insforge.app';
const insforgeAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFubmciLCJpYXQiOjE3NjY3OTkzODd9.FgQB-VM4DHFQa6OgXTd_qx-wwI01l0lQiG-2IV5Dtoo';

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});