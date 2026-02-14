/**
 * Subdomain Health Check Service
 * Provides comprehensive health checks for subdomains including DNS resolution,
 * HTTP reachability, SSL verification, and issue detection.
 */

import * as porkbun from './porkbunService';

const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN || 'naca.community';
const SERVER_IP = process.env.SERVER_IP || '34.111.179.208';

export interface SubdomainHealthResult {
  subdomain: string;
  fullDomain: string;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  checkedAt: string;
  checks: {
    dns: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
      ip: string | null;
      recordId: string | null;
    };
    dnsResolution: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
      resolvedIp: string | null;
    };
    ipMatch: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
    };
    http: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
      statusCode: number | null;
    };
    ssl: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
    };
    routing: {
      status: 'pass' | 'fail' | 'warn';
      details: string;
    };
  };
  issues: KnownIssue[];
  recommendations: string[];
}

export interface KnownIssue {
  id: string;
  category: 'dns' | 'http' | 'ssl' | 'auth' | 'routing' | 'config';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  solution: string;
  autoFixable: boolean;
}

export interface SubdomainProvisionResult {
  success: boolean;
  recordId: string | null;
  error: string | null;
}

export const KNOWN_ISSUES: KnownIssue[] = [
  {
    id: 'DNS_NOT_CONFIGURED',
    category: 'dns',
    severity: 'critical',
    title: 'DNS Record Missing',
    description: 'No A record found for this subdomain in Porkbun.',
    solution: 'Use the "Provision DNS" button to create the A record automatically.',
    autoFixable: true,
  },
  {
    id: 'DNS_NOT_RESOLVED',
    category: 'dns',
    severity: 'critical',
    title: 'DNS Not Resolving',
    description: 'DNS record exists but domain is not resolving.',
    solution: 'Wait 5-30 minutes for DNS propagation to complete.',
    autoFixable: false,
  },
  {
    id: 'DNS_PROPAGATION',
    category: 'dns',
    severity: 'warning',
    title: 'DNS Propagation in Progress',
    description: 'DNS record was recently created or updated.',
    solution: 'Wait 5-30 minutes for DNS propagation to complete globally.',
    autoFixable: false,
  },
  {
    id: 'IP_MISMATCH',
    category: 'dns',
    severity: 'critical',
    title: 'IP Address Mismatch',
    description: 'DNS record points to wrong IP address.',
    solution: 'Update DNS record to point to the correct server IP.',
    autoFixable: false,
  },
  {
    id: 'HTTP_TIMEOUT',
    category: 'http',
    severity: 'warning',
    title: 'HTTP Timeout',
    description: 'Server did not respond within 10 seconds.',
    solution: 'Check server health and network connectivity.',
    autoFixable: false,
  },
  {
    id: 'HTTP_ERROR',
    category: 'http',
    severity: 'critical',
    title: 'HTTP Error Response',
    description: 'Server returned an error status code.',
    solution: 'Check application logs for errors.',
    autoFixable: false,
  },
  {
    id: 'SSL_CERTIFICATE_ERROR',
    category: 'ssl',
    severity: 'critical',
    title: 'SSL Certificate Error',
    description: 'SSL/TLS certificate validation failed.',
    solution: 'Add domain to deployment and wait for certificate provisioning.',
    autoFixable: false,
  },
  {
    id: 'REPLIT_DOMAIN_NOT_CONFIGURED',
    category: 'config',
    severity: 'critical',
    title: 'Domain Not Added to Deployment',
    description: 'DNS exists but domain not added to Replit deployment.',
    solution: 'Go to Deployments > Settings > Link a domain.',
    autoFixable: false,
  },
  {
    id: 'SERVER_IP_NOT_SET',
    category: 'config',
    severity: 'warning',
    title: 'Server IP Not Configured',
    description: 'SERVER_IP environment variable is not set.',
    solution: 'Set the SERVER_IP environment variable to enable IP mismatch detection.',
    autoFixable: false,
  },
  {
    id: 'PORKBUN_NOT_CONFIGURED',
    category: 'config',
    severity: 'warning',
    title: 'Porkbun API Not Configured',
    description: 'Porkbun API credentials are not set.',
    solution: 'Set PORKBUN_API_KEY and PORKBUN_SECRET_KEY environment variables.',
    autoFixable: false,
  },
];

/**
 * Get configuration status
 */
export function getConfiguration(): {
  primaryDomain: string;
  serverIp: string;
  serverIpConfigured: boolean;
  porkbunConfigured: boolean;
} {
  return {
    primaryDomain: PRIMARY_DOMAIN,
    serverIp: SERVER_IP,
    serverIpConfigured: !!SERVER_IP,
    porkbunConfigured: porkbun.isConfigured(),
  };
}

/**
 * Check DNS resolution for a subdomain using Node.js dns module
 */
async function checkDnsResolution(subdomain: string): Promise<{ 
  resolved: boolean; 
  ip: string | null; 
  error: string | null 
}> {
  const fullDomain = `${subdomain}.${PRIMARY_DOMAIN}`;
  
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.resolve4(fullDomain);
    
    if (addresses.length > 0) {
      return { resolved: true, ip: addresses[0], error: null };
    }
    return { resolved: false, ip: null, error: 'No A record found' };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return { 
      resolved: false, 
      ip: null, 
      error: err.code === 'ENOTFOUND' ? 'Domain not found' : (err.message || 'DNS lookup failed')
    };
  }
}

/**
 * Check HTTP reachability for a subdomain
 */
async function checkHttpReachability(subdomain: string): Promise<{ 
  reachable: boolean; 
  statusCode: number | null; 
  error: string | null;
  sslError: boolean;
}> {
  const url = `https://${subdomain}.${PRIMARY_DOMAIN}`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeout);
    
    const reachable = response.status >= 200 && response.status < 400;
    return { reachable, statusCode: response.status, error: null, sslError: false };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string; cause?: { code?: string } };
    const isAbort = err.name === 'AbortError';
    const isSslError = err.message?.includes('certificate') || 
                       err.message?.includes('SSL') || 
                       err.message?.includes('TLS') ||
                       err.cause?.code === 'CERT_HAS_EXPIRED' ||
                       err.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
    
    return { 
      reachable: false, 
      statusCode: null, 
      error: isAbort ? 'Timeout (10s)' : (err.message || 'Request failed'),
      sslError: isSslError
    };
  }
}

/**
 * Perform a complete health check for a subdomain
 */
export async function checkSubdomainHealth(subdomain: string): Promise<SubdomainHealthResult> {
  const fullDomain = `${subdomain}.${PRIMARY_DOMAIN}`;
  const checkedAt = new Date().toISOString();
  const issues: KnownIssue[] = [];
  const recommendations: string[] = [];
  
  // Check Porkbun DNS records
  let hasDnsRecord = false;
  let dnsIp: string | null = null;
  let dnsRecordId: string | null = null;
  
  if (porkbun.isConfigured()) {
    try {
      const records = await porkbun.getDNSRecords(PRIMARY_DOMAIN);
      const aRecord = records.find(r => 
        (r.name === subdomain || r.name === `${subdomain}.${PRIMARY_DOMAIN}`) && r.type === 'A'
      );
      if (aRecord) {
        hasDnsRecord = true;
        dnsIp = aRecord.content;
        dnsRecordId = aRecord.id;
      }
    } catch (e) {
      console.error(`[Health] Porkbun check failed for ${subdomain}:`, e);
    }
  } else {
    issues.push(KNOWN_ISSUES.find(i => i.id === 'PORKBUN_NOT_CONFIGURED')!);
  }
  
  // Check DNS resolution
  const dnsResult = await checkDnsResolution(subdomain);
  
  // Check IP match
  let ipMismatch = false;
  if (dnsResult.resolved && SERVER_IP && dnsResult.ip !== SERVER_IP) {
    ipMismatch = true;
    issues.push(KNOWN_ISSUES.find(i => i.id === 'IP_MISMATCH')!);
  } else if (!SERVER_IP) {
    issues.push(KNOWN_ISSUES.find(i => i.id === 'SERVER_IP_NOT_SET')!);
  }
  
  // Check HTTP reachability (only if DNS resolved and IP matches)
  let httpResult: Awaited<ReturnType<typeof checkHttpReachability>> = { 
    reachable: false, 
    statusCode: null, 
    error: 'DNS not resolved',
    sslError: false
  };
  
  if (dnsResult.resolved && !ipMismatch) {
    httpResult = await checkHttpReachability(subdomain);
    
    if (httpResult.sslError) {
      issues.push(KNOWN_ISSUES.find(i => i.id === 'SSL_CERTIFICATE_ERROR')!);
    } else if (httpResult.error?.includes('Timeout')) {
      issues.push(KNOWN_ISSUES.find(i => i.id === 'HTTP_TIMEOUT')!);
    } else if (!httpResult.reachable && httpResult.statusCode) {
      if (httpResult.statusCode === 404) {
        issues.push(KNOWN_ISSUES.find(i => i.id === 'REPLIT_DOMAIN_NOT_CONFIGURED')!);
      } else {
        issues.push(KNOWN_ISSUES.find(i => i.id === 'HTTP_ERROR')!);
      }
    }
  } else if (ipMismatch) {
    httpResult.error = `IP mismatch: expected ${SERVER_IP}, got ${dnsResult.ip}`;
  }
  
  // Detect DNS-specific issues
  if (!hasDnsRecord && porkbun.isConfigured()) {
    issues.push(KNOWN_ISSUES.find(i => i.id === 'DNS_NOT_CONFIGURED')!);
  } else if (hasDnsRecord && !dnsResult.resolved) {
    issues.push(KNOWN_ISSUES.find(i => i.id === 'DNS_PROPAGATION')!);
  }
  
  // Build checks object
  const checks: SubdomainHealthResult['checks'] = {
    dns: {
      status: hasDnsRecord ? 'pass' : 'fail',
      details: hasDnsRecord ? `A record: ${dnsIp}` : 'No A record in Porkbun',
      ip: dnsIp,
      recordId: dnsRecordId,
    },
    dnsResolution: {
      status: dnsResult.resolved ? 'pass' : 'fail',
      details: dnsResult.resolved ? `Resolves to ${dnsResult.ip}` : (dnsResult.error || 'Not resolving'),
      resolvedIp: dnsResult.ip,
    },
    ipMatch: {
      status: !SERVER_IP ? 'warn' : (dnsResult.ip === SERVER_IP ? 'pass' : 'fail'),
      details: !SERVER_IP 
        ? 'SERVER_IP not configured' 
        : (dnsResult.ip === SERVER_IP ? 'IP matches' : `Mismatch: expected ${SERVER_IP}, got ${dnsResult.ip}`),
    },
    http: {
      status: httpResult.reachable ? 'pass' : 'fail',
      details: httpResult.reachable 
        ? `Status ${httpResult.statusCode}` 
        : (httpResult.error || 'Not reachable'),
      statusCode: httpResult.statusCode,
    },
    ssl: {
      status: httpResult.sslError ? 'fail' : (httpResult.reachable ? 'pass' : 'warn'),
      details: httpResult.sslError ? 'Certificate error' : (httpResult.reachable ? 'Valid' : 'Unable to verify'),
    },
    routing: {
      status: httpResult.reachable ? 'pass' : (dnsResult.resolved ? 'fail' : 'warn'),
      details: httpResult.reachable ? 'Responding correctly' : 'Not responding',
    },
  };
  
  // Determine overall health
  let overallHealth: SubdomainHealthResult['overallHealth'] = 'unknown';
  const criticalIssues = issues.filter(i => i?.severity === 'critical').length;
  const warningIssues = issues.filter(i => i?.severity === 'warning').length;
  
  if (criticalIssues > 0) {
    overallHealth = 'unhealthy';
  } else if (warningIssues > 0) {
    overallHealth = 'degraded';
  } else if (httpResult.reachable) {
    overallHealth = 'healthy';
  }
  
  // Add recommendations
  if (!hasDnsRecord && porkbun.isConfigured()) {
    recommendations.push('Click "Provision DNS" to automatically create the A record.');
  }
  if (hasDnsRecord && !dnsResult.resolved) {
    recommendations.push('DNS was recently configured. Wait 5-30 minutes for global propagation.');
  }
  if (httpResult.statusCode === 404) {
    recommendations.push('Add this domain to your Replit deployment in Settings > Domains.');
  }
  
  return {
    subdomain,
    fullDomain,
    overallHealth,
    checkedAt,
    checks,
    issues: issues.filter(Boolean),
    recommendations,
  };
}

/**
 * Provision a subdomain in Porkbun DNS
 */
export async function provisionSubdomain(subdomain: string): Promise<SubdomainProvisionResult> {
  if (!porkbun.isConfigured()) {
    return { success: false, recordId: null, error: 'Porkbun API credentials not configured' };
  }
  
  if (!SERVER_IP) {
    return { success: false, recordId: null, error: 'SERVER_IP environment variable not set' };
  }
  
  try {
    const exists = await porkbun.subdomainExists(PRIMARY_DOMAIN, subdomain);
    if (exists) {
      const aRecord = await porkbun.getSubdomainARecord(PRIMARY_DOMAIN, subdomain);
      console.log(`[Subdomain] DNS record already exists for ${subdomain}.${PRIMARY_DOMAIN}`);
      return { success: true, recordId: aRecord?.id || null, error: null };
    }
    
    const recordId = await porkbun.createSubdomain(PRIMARY_DOMAIN, subdomain, SERVER_IP);
    console.log(`[Subdomain] Created DNS record for ${subdomain}.${PRIMARY_DOMAIN} -> ${SERVER_IP}`);
    
    return { success: true, recordId, error: null };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(`[Subdomain] Failed to provision ${subdomain}:`, err.message);
    return { success: false, recordId: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Remove a subdomain from Porkbun DNS
 */
export async function deprovisionSubdomain(
  subdomain: string, 
  recordId?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!porkbun.isConfigured()) {
    return { success: false, error: 'Porkbun API credentials not configured' };
  }
  
  try {
    if (recordId) {
      await porkbun.deleteDNSRecord(PRIMARY_DOMAIN, recordId);
    } else {
      await porkbun.deleteSubdomain(PRIMARY_DOMAIN, subdomain);
    }
    console.log(`[Subdomain] Deleted DNS record for ${subdomain}.${PRIMARY_DOMAIN}`);
    return { success: true, error: null };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(`[Subdomain] Failed to deprovision ${subdomain}:`, err.message);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Get list of all known issues for reference
 */
export function getKnownIssues(): KnownIssue[] {
  return KNOWN_ISSUES;
}

/**
 * Batch health check for multiple subdomains
 */
export async function checkMultipleSubdomains(subdomains: string[]): Promise<{
  checkedAt: string;
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  unknown: number;
  results: SubdomainHealthResult[];
}> {
  const results = await Promise.all(
    subdomains.map(subdomain => checkSubdomainHealth(subdomain))
  );
  
  return {
    checkedAt: new Date().toISOString(),
    total: results.length,
    healthy: results.filter(r => r.overallHealth === 'healthy').length,
    degraded: results.filter(r => r.overallHealth === 'degraded').length,
    unhealthy: results.filter(r => r.overallHealth === 'unhealthy').length,
    unknown: results.filter(r => r.overallHealth === 'unknown').length,
    results,
  };
}

/**
 * Get special/platform subdomains list
 */
export function getSpecialSubdomains(): string[] {
  return ['create', 'api', 'docs', 'admin', 'help', 'www'];
}
