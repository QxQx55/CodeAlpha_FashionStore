import { createClient } from '@blinkdotnew/sdk';

function getProjectId(): string {
  const envId = import.meta.env.VITE_BLINK_PROJECT_ID;
  if (envId) return envId;
  if (typeof window !== 'undefined') {
    const match = window.location.hostname.match(/^([^.]+)\.sites\.blink\.new$/);
    if (match) return match[1];
  }
  return 'fashion-d2c-starter-e250oayz';
}

export const blink = createClient({
  projectId: getProjectId(),
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_LzRq5V--SWtB6d_jubGL--MDPGodZRBn',
  auth: { mode: 'headless', authRequired: true },
});
