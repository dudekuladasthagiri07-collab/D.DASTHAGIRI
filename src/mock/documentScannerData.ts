import { ScannedDocumentItem, DocumentScanHistoryItem, DocumentAuditLogItem } from '../types';

export const INITIAL_SCANNED_DOCUMENTS: ScannedDocumentItem[] = [
  {
    id: 'sc-001',
    documentId: 'DOC-2026-0891',
    name: 'Aadhaar_Card_Verified_Scan.pdf',
    folder: 'Government ID Vault',
    category: 'Government',
    tags: ['Aadhaar', 'UIDAI', 'ID Proof', 'Verified'],
    description: 'High resolution color scan of official 12-digit UIDAI Aadhaar Card with QR verification.',
    pages: [
      {
        id: 'p-1',
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        rotation: 0,
        flippedHorizontal: false,
        flippedVertical: false,
        filter: 'Magic Color',
        brightness: 5,
        contrast: 10,
        sharpness: 20,
        shadowRemoval: true,
        noiseReduction: true,
        ocrText: 'GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY OF INDIA\nName: D. LAKSHMI NARAYANA\nDOB: 20/05/1995\nGender: MALE\nAadhaar No: XXXX-XXXX-8821\nAddress: H.No 4/129, Main Road, Dharmavaram, Anantapur, AP - 515671'
      },
      {
        id: 'p-2',
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        rotation: 0,
        flippedHorizontal: false,
        flippedVertical: false,
        filter: 'Magic Color',
        brightness: 5,
        contrast: 10,
        sharpness: 20,
        shadowRemoval: true,
        noiseReduction: true,
        ocrText: 'Address Back Side: Flat 302, Royal Enclave, Ameerpet, Hyderabad - 500016'
      }
    ],
    pageCount: 2,
    fileSize: '2.4 MB',
    resolution: '300 DPI',
    colorMode: 'Full Color',
    format: 'PDF',
    ocrStatus: 'Completed',
    ocrText: 'GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY OF INDIA\nName: D. LAKSHMI NARAYANA\nDOB: 20/05/1995\nGender: MALE\nAadhaar No: XXXX-XXXX-8821\nAddress: H.No 4/129, Main Road, Dharmavaram, Anantapur, AP - 515671',
    scanSource: 'Camera Device',
    cameraDevice: 'Android Sony IMX766 50MP Lens',
    createdBy: 'D. Lakshmi Narayana (Admin)',
    createdDate: '2026-08-01 10:14:22',
    modifiedDate: '2026-08-01 10:15:00',
    version: 'v1.2',
    remarks: 'Auto-cropped and enhanced via NPCI Safe document engine',
    permissions: { admin: true, manager: true, employee: true, viewer: true },
    encrypted: true
  },
  {
    id: 'sc-002',
    documentId: 'DOC-2026-0742',
    name: 'Medical_Insurance_Policy_2026.pdf',
    folder: 'Insurance & Claims',
    category: 'Medical',
    tags: ['Health', 'Policy', 'Star Health', 'Claims'],
    description: 'Star Health cashless hospitalization policy schedule with network hospital list.',
    pages: [
      {
        id: 'p-201',
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        rotation: 0,
        flippedHorizontal: false,
        flippedVertical: false,
        filter: 'Document',
        brightness: 0,
        contrast: 15,
        sharpness: 10,
        shadowRemoval: true,
        noiseReduction: true,
        ocrText: 'STAR HEALTH AND ALLIED INSURANCE CO LTD\nPolicy No: P/181211/01/2026/009182\nSum Insured: ₹10,00,000\nValid: 01-Jan-2026 to 31-Dec-2026'
      }
    ],
    pageCount: 1,
    fileSize: '1.8 MB',
    resolution: '300 DPI',
    colorMode: 'Full Color',
    format: 'PDF',
    ocrStatus: 'Completed',
    ocrText: 'STAR HEALTH AND ALLIED INSURANCE CO LTD\nPolicy No: P/181211/01/2026/009182\nSum Insured: ₹10,00,000',
    scanSource: 'Gallery Upload',
    uploadSource: 'Internal File System',
    createdBy: 'D. Lakshmi Narayana (Admin)',
    createdDate: '2026-08-03 14:22:10',
    modifiedDate: '2026-08-03 14:22:10',
    version: 'v1.0',
    remarks: 'Imported from gallery and OCR indexed.',
    permissions: { admin: true, manager: true, employee: false, viewer: true },
    encrypted: false
  },
  {
    id: 'sc-003',
    documentId: 'DOC-2026-0511',
    name: 'Property_Tax_Receipt_GHMC_2026.pdf',
    folder: 'Receipts & Tax',
    category: 'Receipts',
    tags: ['GHMC', 'Tax', 'Property', 'Paid'],
    description: 'GHMC municipal property tax payment receipt for FY 2026-27.',
    pages: [
      {
        id: 'p-301',
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        rotation: 0,
        flippedHorizontal: false,
        flippedVertical: false,
        filter: 'Grayscale',
        brightness: 10,
        contrast: 20,
        sharpness: 15,
        shadowRemoval: true,
        noiseReduction: false,
        ocrText: 'GREATER HYDERABAD MUNICIPAL CORPORATION\nPTIN: 1092837465\nAmount Paid: ₹4,250.00\nPayment Mode: UPI Instant Pay\nStatus: SUCCESS'
      }
    ],
    pageCount: 1,
    fileSize: '820 KB',
    resolution: '300 DPI',
    colorMode: 'Grayscale',
    format: 'PDF',
    ocrStatus: 'Completed',
    ocrText: 'GREATER HYDERABAD MUNICIPAL CORPORATION\nPTIN: 1092837465\nAmount Paid: ₹4,250.00',
    scanSource: 'Camera Device',
    cameraDevice: 'Android UltraWide 12MP Camera',
    createdBy: 'D. Lakshmi Narayana (Admin)',
    createdDate: '2026-08-05 18:05:40',
    modifiedDate: '2026-08-05 18:05:40',
    version: 'v1.0',
    remarks: 'Scanned via auto-flash document mode.',
    permissions: { admin: true, manager: true, employee: true, viewer: true },
    encrypted: true
  }
];

export const INITIAL_SCAN_HISTORY: DocumentScanHistoryItem[] = [
  {
    scanId: 'SCN-9901',
    documentId: 'DOC-2026-0891',
    documentName: 'Aadhaar_Card_Verified_Scan.pdf',
    scanDate: '2026-08-01',
    scanTime: '10:14 AM',
    user: 'D. Lakshmi Narayana',
    pages: 2,
    format: 'PDF',
    status: 'Completed',
    storageLocation: 'Documents/Government ID Vault',
    fileSize: '2.4 MB',
    createdOn: '2026-08-01 10:14:22',
    updatedOn: '2026-08-01 10:15:00'
  },
  {
    scanId: 'SCN-9902',
    documentId: 'DOC-2026-0742',
    documentName: 'Medical_Insurance_Policy_2026.pdf',
    scanDate: '2026-08-03',
    scanTime: '02:22 PM',
    user: 'D. Lakshmi Narayana',
    pages: 1,
    format: 'PDF',
    status: 'Completed',
    storageLocation: 'Documents/Insurance & Claims',
    fileSize: '1.8 MB',
    createdOn: '2026-08-03 14:22:10',
    updatedOn: '2026-08-03 14:22:10'
  },
  {
    scanId: 'SCN-9903',
    documentId: 'DOC-2026-0511',
    documentName: 'Property_Tax_Receipt_GHMC_2026.pdf',
    scanDate: '2026-08-05',
    scanTime: '06:05 PM',
    user: 'D. Lakshmi Narayana',
    pages: 1,
    format: 'PDF',
    status: 'Completed',
    storageLocation: 'Documents/Receipts & Tax',
    fileSize: '820 KB',
    createdOn: '2026-08-05 18:05:40',
    updatedOn: '2026-08-05 18:05:40'
  }
];

export const INITIAL_AUDIT_LOGS: DocumentAuditLogItem[] = [
  {
    logId: 'LOG-8801',
    user: 'D. Lakshmi Narayana (Admin)',
    action: 'Scan',
    document: 'Aadhaar_Card_Verified_Scan.pdf',
    scanTime: '2026-08-01 10:14:22',
    device: 'Android Phone / SecurePay App',
    ipAddress: '103.22.140.12',
    status: 'Success',
    remarks: 'Captured 2 pages using camera with auto perspective correction.'
  },
  {
    logId: 'LOG-8802',
    user: 'D. Lakshmi Narayana (Admin)',
    action: 'OCR',
    document: 'Aadhaar_Card_Verified_Scan.pdf',
    scanTime: '2026-08-01 10:15:00',
    device: 'Android Phone / SecurePay App',
    ipAddress: '103.22.140.12',
    status: 'Success',
    remarks: 'Text extracted with 99.4% precision.'
  },
  {
    logId: 'LOG-8803',
    user: 'D. Lakshmi Narayana (Admin)',
    action: 'Export',
    document: 'Medical_Insurance_Policy_2026.pdf',
    scanTime: '2026-08-03 14:25:00',
    device: 'Android Phone / SecurePay App',
    ipAddress: '103.22.140.12',
    status: 'Success',
    remarks: 'Exported as single encrypted PDF.'
  }
];
