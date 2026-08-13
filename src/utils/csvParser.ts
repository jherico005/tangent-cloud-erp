import { ServiceRequest, IMSLogItem, AreaType, SectorType } from '../types';

/**
 * Robust RFC 4180 compliant CSV line parser supporting quoted values, commas, and escaped quotes.
 */
export function parseCSVString(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        row.push(currentVal.trim());
        if (row.some(field => field.length > 0)) {
          lines.push(row);
        }
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(field => field.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export interface CSVImportResult {
  serviceRequests: ServiceRequest[];
  imsLogs: IMSLogItem[];
  invalidRowsCount: number;
}

export function parseDispatchCSV(csvText: string, uploaderName: string = 'IMS Custodian'): CSVImportResult {
  const rows = parseCSVString(csvText);
  if (rows.length < 2) {
    return { serviceRequests: [], imsLogs: [], invalidRowsCount: 0 };
  }

  const rawHeaders = rows[0].map(h => h.trim().toLowerCase());

  // Find column indexes based on header keywords or fallback to explicit indices
  const getColIndex = (possibleNames: string[], defaultIdx: number): number => {
    for (const name of possibleNames) {
      const idx = rawHeaders.findIndex(h => h.includes(name.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return defaultIdx;
  };

  const merchantIdx = getColIndex(['merchant name', 'merchant'], 0);
  const addressIdx = getColIndex(['merchant address', 'address'], 1);
  const cityIdx = getColIndex(['city municipality', 'city'], 2);
  const provinceIdx = getColIndex(['province'], 3);
  const areaIdx = getColIndex(['area'], 4);
  const sectorIdx = getColIndex(['sector'], 5);
  const srnIdx = getColIndex(['srn'], 6);
  const catIdx = getColIndex(['request category', 'category'], 7);
  const accountIdx = getColIndex(['account name', 'account'], 8);
  const clientCountIdx = getColIndex(['clientcount', 'client count'], 9);
  
  // Date and Time indexes
  let relDateIdx = getColIndex(['released date', 'cciarco/ims/rc released date'], 10);
  let relTimeIdx = 11;
  // If headers have duplicate names or time column
  if (rawHeaders.length > 11 && rawHeaders[11].includes('released date')) {
    relTimeIdx = 11;
  }

  const slaIdx = getColIndex(['sla remarks', 'sla'], 12);
  const contactPersonIdx = getColIndex(['contact person'], 13);
  const contactNumIdx = getColIndex(['contact number', 'contact'], 14);
  const instructionsIdx = getColIndex(['addtl instructions', 'instructions', 'remarks'], 15);
  const projectIdx = getColIndex(['project'], 16);
  const requesterIdx = getColIndex(['csrequester', 'requestor'], 17);
  const classificationIdx = getColIndex(['projectclassification', 'request classification', 'classification'], 18);

  const serviceRequests: ServiceRequest[] = [];
  const imsLogs: IMSLogItem[] = [];
  let invalidRowsCount = 0;

  const now = new Date();
  const defaultDateStr = now.toISOString().split('T')[0];
  const defaultTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) {
      invalidRowsCount++;
      continue;
    }

    const merchantName = (row[merchantIdx] || '').trim();
    const srnVal = (row[srnIdx] || '').trim();

    if (!merchantName && !srnVal) {
      invalidRowsCount++;
      continue;
    }

    const srn = srnVal || `2026CSV${Math.floor(100000 + Math.random() * 900000)}`;
    const address = (row[addressIdx] || 'ADDRESS NOT SPECIFIED').trim();
    const city = (row[cityIdx] || 'LIPA').trim();
    const province = (row[provinceIdx] || 'BATANGAS').trim();
    
    let area: AreaType = 'LUZON';
    const rawArea = (row[areaIdx] || '').toUpperCase();
    if (rawArea.includes('NCR')) area = 'NCR';
    else if (rawArea.includes('VISAYAS')) area = 'VISAYAS';
    else if (rawArea.includes('MINDANAO')) area = 'MINDANAO';

    let sector: SectorType = 'SOUTH LUZON';
    const rawSector = (row[sectorIdx] || '').toUpperCase();
    if (rawSector.includes('NORTH')) sector = 'NORTH LUZON';
    else if (rawSector.includes('CENTRAL')) sector = 'CENTRAL LUZON';
    else if (rawSector.includes('MANILA')) sector = 'MANILA';
    else if (rawSector.includes('CEBU')) sector = 'CEBU';
    else if (rawSector.includes('DAVAO')) sector = 'DAVAO';

    const category = (row[catIdx] || 'INS').trim().toUpperCase();
    const account = (row[accountIdx] || 'PML').trim();
    const clientCount = parseInt(row[clientCountIdx] || '1', 10) || 1;
    
    const releasedDate = (row[relDateIdx] || defaultDateStr).trim();
    const releasedTime = (row[relTimeIdx] || defaultTimeStr).trim();
    
    const slaRemarks = (row[slaIdx] || `${defaultDateStr}`).trim();
    const contactPerson = (row[contactPersonIdx] || '').trim();
    const contactNumber = (row[contactNumIdx] || '').trim();
    const remarks = (row[instructionsIdx] || '').trim();
    const projectName = (row[projectIdx] || '').trim();
    const requestor = (row[requesterIdx] || '').trim();
    const requestClassification = (row[classificationIdx] || 'REGULAR').trim();

    // Extract Serial Number from instructions if present
    let serialNumber: string | undefined = undefined;
    const snMatch = remarks.match(/(?:SN|S\/N|SERIAL)\s*[:=]\s*([A-Za-z0-9\-]+)/i);
    if (snMatch) {
      serialNumber = snMatch[1];
    }

    const srReq: ServiceRequest = {
      id: `srn-csv-${Date.now()}-${i}`,
      merchantName: merchantName.toUpperCase(),
      merchantAddress: address.toUpperCase(),
      cityMunicipality: city.toUpperCase(),
      province: province.toUpperCase(),
      area,
      sector,
      srn,
      requestCategory: category,
      accountName: account,
      clientCount,
      releasedDate,
      releasedTime,
      slaRemarks,
      status: 'Release To Dispatcher',
      contactPerson,
      contactNumber,
      remarks,
      projectName,
      requestor,
      requestClassification,
      serialNumber,
      terminalModel: 'Pax A920 Pro',
      selected: false
    };

    serviceRequests.push(srReq);

    // Corresponding IMS Movement log for CSV Inbound Release
    const imsLog: IMSLogItem = {
      id: `ims-csv-${Date.now()}-${i}`,
      timestamp: `${releasedDate} ${releasedTime}`,
      serialNumber: serialNumber || `PX-${srn.slice(-6)}`,
      model: 'Pax A920 Pro',
      account,
      movementType: 'Outbound to Dispatch',
      releasedTo: `Central Dispatcher (${srn})`,
      verifiedBy: uploaderName
    };

    imsLogs.push(imsLog);
  }

  return {
    serviceRequests,
    imsLogs,
    invalidRowsCount
  };
}
