// utils/getDeviceInfo.ts
import type { UAParser as UAParserType } from 'ua-parser-js';
const UAParser = require('ua-parser-js') as typeof import('ua-parser-js').UAParser;

export interface DeviceInfo {
  user_agent: string;
  device_type: string;
  os_name: string;
  os_version: string;
  browser: string;
}

// Captures user's device information
export function getDeviceInfo(): DeviceInfo {
  const parser: UAParserType = new UAParser();

  return {
    user_agent: navigator.userAgent || 'Unknown',
    device_type: parser.getDevice().type || 'desktop',
    os_name: parser.getOS().name || 'Unknown',
    os_version: parser.getOS().version || '',
    browser: parser.getBrowser().name || 'Unknown',
  };
}