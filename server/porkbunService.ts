/**
 * Porkbun DNS API Service
 * Handles all interactions with the Porkbun API for DNS record management.
 * API Documentation: https://porkbun.com/api/json/v3/documentation
 */

const PORKBUN_API_BASE = 'https://api.porkbun.com/api/json/v3';

export interface PorkbunCredentials {
  apikey: string;
  secretapikey: string;
}

export interface DNSRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: string;
  prio?: string;
  notes?: string;
}

export interface CreateDNSRecordParams {
  domain: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'TLSA' | 'CAA' | 'ALIAS' | 'HTTPS' | 'SVCB' | 'SSHFP';
  content: string;
  ttl?: string;
  prio?: string;
  notes?: string;
}

export interface PorkbunResponse<T = unknown> {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  records?: T[];
  id?: string;
  domains?: T[];
  yourIp?: string;
}

function getCredentials(): PorkbunCredentials {
  const apikey = process.env.PORKBUN_API_KEY;
  const secretapikey = process.env.PORKBUN_SECRET_KEY;

  if (!apikey || !secretapikey) {
    throw new Error('Porkbun API credentials not configured. Set PORKBUN_API_KEY and PORKBUN_SECRET_KEY.');
  }

  return { apikey, secretapikey };
}

function hasCredentials(): boolean {
  return !!(process.env.PORKBUN_API_KEY && process.env.PORKBUN_SECRET_KEY);
}

async function porkbunRequest<T>(
  endpoint: string, 
  additionalBody: Record<string, unknown> = {}
): Promise<PorkbunResponse<T>> {
  const credentials = getCredentials();
  
  const response = await fetch(`${PORKBUN_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...credentials, ...additionalBody }),
  });

  if (!response.ok) {
    throw new Error(`Porkbun API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as PorkbunResponse<T>;
  
  if (data.status === 'ERROR') {
    throw new Error(`Porkbun API error: ${data.message || 'Unknown error'}`);
  }

  return data;
}

/**
 * Test API credentials by pinging the Porkbun API
 */
export async function testCredentials(): Promise<{ success: boolean; yourIp?: string; error?: string }> {
  if (!hasCredentials()) {
    return { success: false, error: 'Porkbun API credentials not configured' };
  }
  
  try {
    const credentials = getCredentials();
    const response = await fetch(`${PORKBUN_API_BASE}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json() as PorkbunResponse<never>;
    if (data.status === 'SUCCESS') {
      return { success: true, yourIp: data.yourIp };
    }
    return { success: false, error: data.message };
  } catch (error) {
    console.error('[Porkbun] Credential test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if Porkbun credentials are available
 */
export function isConfigured(): boolean {
  return hasCredentials();
}

/**
 * Get all DNS records for a domain
 */
export async function getDNSRecords(domain: string): Promise<DNSRecord[]> {
  console.log(`[Porkbun] Fetching DNS records for ${domain}`);
  const response = await porkbunRequest<DNSRecord>(`/dns/retrieve/${domain}`);
  return response.records || [];
}

/**
 * Get DNS records by subdomain name
 */
export async function getDNSRecordsBySubdomain(domain: string, subdomain: string): Promise<DNSRecord[]> {
  const records = await getDNSRecords(domain);
  return records.filter(r => r.name === subdomain || r.name === `${subdomain}.${domain}`);
}

/**
 * Create a new DNS record
 */
export async function createDNSRecord(params: CreateDNSRecordParams): Promise<string> {
  console.log(`[Porkbun] Creating ${params.type} record for ${params.name}.${params.domain}`);
  
  const body: Record<string, unknown> = {
    name: params.name,
    type: params.type,
    content: params.content,
  };

  if (params.ttl) body.ttl = params.ttl;
  if (params.prio) body.prio = params.prio;

  const response = await porkbunRequest(`/dns/create/${params.domain}`, body);
  
  if (!response.id) {
    throw new Error('Failed to create DNS record: No ID returned');
  }

  console.log(`[Porkbun] Created DNS record with ID: ${response.id}`);
  return response.id;
}

/**
 * Update an existing DNS record
 */
export async function updateDNSRecord(
  domain: string,
  recordId: string,
  params: Partial<Omit<CreateDNSRecordParams, 'domain'>>
): Promise<void> {
  console.log(`[Porkbun] Updating DNS record ${recordId} for ${domain}`);
  
  const body: Record<string, unknown> = {};
  if (params.name) body.name = params.name;
  if (params.type) body.type = params.type;
  if (params.content) body.content = params.content;
  if (params.ttl) body.ttl = params.ttl;
  if (params.prio) body.prio = params.prio;

  await porkbunRequest(`/dns/edit/${domain}/${recordId}`, body);
  console.log(`[Porkbun] Updated DNS record ${recordId}`);
}

/**
 * Delete a DNS record
 */
export async function deleteDNSRecord(domain: string, recordId: string): Promise<void> {
  console.log(`[Porkbun] Deleting DNS record ${recordId} from ${domain}`);
  await porkbunRequest(`/dns/delete/${domain}/${recordId}`);
  console.log(`[Porkbun] Deleted DNS record ${recordId}`);
}

/**
 * Create a subdomain A record pointing to a specific IP
 */
export async function createSubdomain(domain: string, subdomain: string, ipAddress: string): Promise<string> {
  return createDNSRecord({
    domain,
    name: subdomain,
    type: 'A',
    content: ipAddress,
    ttl: '600',
  });
}

/**
 * Create a TXT record for Replit verification
 */
export async function createVerificationRecord(
  domain: string, 
  subdomain: string, 
  verificationCode: string
): Promise<string> {
  return createDNSRecord({
    domain,
    name: `_replit-verify.${subdomain}`,
    type: 'TXT',
    content: verificationCode,
    ttl: '600',
  });
}

/**
 * Delete a subdomain's A record
 */
export async function deleteSubdomain(domain: string, subdomain: string): Promise<void> {
  const records = await getDNSRecords(domain);
  const subdomainRecords = records.filter(
    r => r.name === subdomain || r.name === `${subdomain}.${domain}`
  );

  for (const record of subdomainRecords) {
    await deleteDNSRecord(domain, record.id);
  }
}

/**
 * Check if a subdomain exists
 */
export async function subdomainExists(domain: string, subdomain: string): Promise<boolean> {
  const records = await getDNSRecords(domain);
  return records.some(
    r => (r.name === subdomain || r.name === `${subdomain}.${domain}`) && r.type === 'A'
  );
}

/**
 * Get all subdomains for a domain (A and CNAME records)
 */
export async function getSubdomains(domain: string): Promise<DNSRecord[]> {
  const records = await getDNSRecords(domain);
  return records.filter(r => r.type === 'A' || r.type === 'CNAME' || r.type === 'ALIAS');
}

/**
 * Get the A record for a specific subdomain
 */
export async function getSubdomainARecord(domain: string, subdomain: string): Promise<DNSRecord | null> {
  const records = await getDNSRecords(domain);
  return records.find(
    r => (r.name === subdomain || r.name === `${subdomain}.${domain}`) && r.type === 'A'
  ) || null;
}

/**
 * Provision a complete subdomain setup (A record + optional TXT verification record)
 */
export async function provisionFullSubdomain(
  domain: string,
  subdomain: string,
  ipAddress: string,
  verificationCode?: string
): Promise<{ aRecordId: string; txtRecordId?: string }> {
  const aRecordId = await createSubdomain(domain, subdomain, ipAddress);
  
  let txtRecordId: string | undefined;
  if (verificationCode) {
    txtRecordId = await createVerificationRecord(domain, subdomain, verificationCode);
  }
  
  return { aRecordId, txtRecordId };
}

/**
 * Get comprehensive status of DNS configuration for a subdomain
 */
export async function getSubdomainDnsStatus(domain: string, subdomain: string): Promise<{
  exists: boolean;
  aRecord: DNSRecord | null;
  txtRecords: DNSRecord[];
  allRecords: DNSRecord[];
}> {
  const records = await getDNSRecordsBySubdomain(domain, subdomain);
  const aRecord = records.find(r => r.type === 'A') || null;
  const txtRecords = records.filter(r => r.type === 'TXT');
  
  return {
    exists: aRecord !== null,
    aRecord,
    txtRecords,
    allRecords: records,
  };
}
