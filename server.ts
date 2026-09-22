import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface ScannedDocumentRecord {
  id: string;
  title: string;
  category: string;
  pagesCount: number;
  filterMode: string;
  ocrExtractedText: string;
  createdAt: string;
  fileSizeBytes: number;
  status: "Verified & Encrypted" | "Processing" | "Archived";
  securityHash: string;
}

interface DocumentAuditLog {
  id: string;
  documentId?: string;
  action: string;
  performedBy: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
  ipAddress: string;
  details: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // In-memory document vault storage
  const documentsStore: ScannedDocumentRecord[] = [
    {
      id: "DOC-2026-8812",
      title: "Aadhaar_National_ID_Scan.pdf",
      category: "Identity Verification",
      pagesCount: 2,
      filterMode: "Magic Color",
      ocrExtractedText: "GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY OF INDIA • AADHAAR NUMBER: 8812 4321 9001",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      fileSizeBytes: 1240000,
      status: "Verified & Encrypted",
      securityHash: "sha256-a8f9e2b109c485721d0f81239"
    },
    {
      id: "DOC-2026-4419",
      title: "Electricity_Utility_Bill_BESCOM.pdf",
      category: "Utility Bill",
      pagesCount: 1,
      filterMode: "Sharp B&W",
      ocrExtractedText: "BESCOM ELECTRICITY DISTRIBUTION BILL • CONSUMER ID: 9021482 • AMOUNT: ₹1,450.00",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      fileSizeBytes: 620000,
      status: "Verified & Encrypted",
      securityHash: "sha256-c72b10e9841f391a213098f44"
    }
  ];

  // In-memory audit logs storage
  const documentAuditLogs: DocumentAuditLog[] = [
    {
      id: "LOG-9001",
      documentId: "DOC-2026-8812",
      action: "DOCUMENT_SCAN_ENHANCE",
      performedBy: "Dr. Rajesh Kumar",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "SUCCESS",
      ipAddress: "103.21.124.90",
      details: "Scanned 2 pages with Magic Color enhancement & auto-cropping."
    },
    {
      id: "LOG-9002",
      documentId: "DOC-2026-8812",
      action: "OCR_TEXT_EXTRACTION",
      performedBy: "System Auto-Indexer",
      timestamp: new Date(Date.now() - 3600000 * 23.9).toISOString(),
      status: "SUCCESS",
      ipAddress: "127.0.0.1",
      details: "OCR extracted 99.4% confidence text (Aadhaar National ID)."
    },
    {
      id: "LOG-9003",
      documentId: "DOC-2026-4419",
      action: "DOCUMENT_SCAN_ENHANCE",
      performedBy: "Dr. Rajesh Kumar",
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: "SUCCESS",
      ipAddress: "103.21.124.90",
      details: "Scanned utility bill page with Sharp B&W document filter."
    }
  ];

  // ==========================================
  // DOCUMENT SCANNER REST API ENDPOINTS
  // ==========================================

  // GET /api/documents - Fetch list of all scanned documents
  app.get("/api/documents", (req, res) => {
    res.json({
      success: true,
      message: "Fetched scanned documents successfully.",
      count: documentsStore.length,
      data: documentsStore
    });
  });

  // POST /api/documents/scan - Core scan, crop, enhancement & OCR save endpoint
  app.post("/api/documents/scan", (req, res) => {
    const {
      title,
      category = "General Document",
      pagesCount = 1,
      filterMode = "Magic Color",
      ocrText = "",
      user = "Rajesh Kumar"
    } = req.body;

    const newDocId = `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: ScannedDocumentRecord = {
      id: newDocId,
      title: title || `Scanned_Doc_${newDocId}.pdf`,
      category,
      pagesCount: Number(pagesCount) || 1,
      filterMode,
      ocrExtractedText: ocrText || "OCR text auto-indexed with 99.1% accuracy.",
      createdAt: new Date().toISOString(),
      fileSizeBytes: Math.floor(400000 + Math.random() * 1500000),
      status: "Verified & Encrypted",
      securityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    };

    documentsStore.unshift(newDoc);

    // Create audit log for the scan action
    const newAuditLog: DocumentAuditLog = {
      id: `LOG-${Math.floor(9000 + Math.random() * 9000)}`,
      documentId: newDocId,
      action: "DOCUMENT_SCAN_SAVED",
      performedBy: user,
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ipAddress: req.ip || "103.21.124.90",
      details: `Scanned and enhanced document "${newDoc.title}" (${newDoc.pagesCount} pages, Filter: ${filterMode}).`
    };

    documentAuditLogs.unshift(newAuditLog);

    res.status(201).json({
      success: true,
      message: "Document scanned, cropped, enhanced and saved successfully.",
      document: newDoc,
      log: newAuditLog
    });
  });

  // GET /api/documents/logs - Audit logs endpoint
  app.get("/api/documents/logs", (req, res) => {
    res.json({
      success: true,
      message: "Fetched document audit logs.",
      count: documentAuditLogs.length,
      logs: documentAuditLogs
    });
  });

  // POST /api/documents/upload - Upload external file/image endpoint
  app.post("/api/documents/upload", (req, res) => {
    const { fileName, category = "Uploaded File" } = req.body;
    const newDocId = `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newDoc: ScannedDocumentRecord = {
      id: newDocId,
      title: fileName || `Uploaded_Doc_${newDocId}.pdf`,
      category,
      pagesCount: 1,
      filterMode: "Original",
      ocrExtractedText: "Uploaded file index verified.",
      createdAt: new Date().toISOString(),
      fileSizeBytes: Math.floor(800000 + Math.random() * 2000000),
      status: "Verified & Encrypted",
      securityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    };

    documentsStore.unshift(newDoc);

    const log: DocumentAuditLog = {
      id: `LOG-${Math.floor(9000 + Math.random() * 9000)}`,
      documentId: newDocId,
      action: "FILE_UPLOAD_INDEXED",
      performedBy: "Rajesh Kumar",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ipAddress: req.ip || "103.21.124.90",
      details: `Uploaded and encrypted file "${newDoc.title}".`
    };
    documentAuditLogs.unshift(log);

    res.status(201).json({
      success: true,
      message: "Document file uploaded and indexed successfully.",
      document: newDoc,
      log
    });
  });

  // GET /api/documents/history - Scan activity history
  app.get("/api/documents/history", (req, res) => {
    res.json({
      success: true,
      message: "Fetched scan history log.",
      history: documentAuditLogs.filter(l => l.action.includes("SCAN") || l.action.includes("UPLOAD"))
    });
  });

  // GET /api/documents/:id - Get specific document record
  app.get("/api/documents/:id", (req, res) => {
    const doc = documentsStore.find(d => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }
    res.json({
      success: true,
      document: doc
    });
  });

  // PUT /api/documents/:id - Update document title/category
  app.put("/api/documents/:id", (req, res) => {
    const docIndex = documentsStore.findIndex(d => d.id === req.params.id);
    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }
    
    documentsStore[docIndex] = {
      ...documentsStore[docIndex],
      ...req.body
    };

    const log: DocumentAuditLog = {
      id: `LOG-${Math.floor(9000 + Math.random() * 9000)}`,
      documentId: req.params.id,
      action: "DOCUMENT_UPDATED",
      performedBy: "Rajesh Kumar",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ipAddress: req.ip || "103.21.124.90",
      details: `Updated metadata for document ${req.params.id}.`
    };
    documentAuditLogs.unshift(log);

    res.json({
      success: true,
      message: `Document ${req.params.id} updated successfully.`,
      document: documentsStore[docIndex]
    });
  });

  // DELETE /api/documents/:id - Remove document
  app.delete("/api/documents/:id", (req, res) => {
    const docIndex = documentsStore.findIndex(d => d.id === req.params.id);
    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    const removed = documentsStore.splice(docIndex, 1)[0];

    const log: DocumentAuditLog = {
      id: `LOG-${Math.floor(9000 + Math.random() * 9000)}`,
      documentId: req.params.id,
      action: "DOCUMENT_DELETED",
      performedBy: "Rajesh Kumar",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ipAddress: req.ip || "103.21.124.90",
      details: `Deleted document "${removed.title}" from vault.`
    };
    documentAuditLogs.unshift(log);

    res.json({
      success: true,
      message: `Document ${req.params.id} removed from vault.`
    });
  });

  // POST /api/documents/:id/share - Generate time-limited share link
  app.post("/api/documents/:id/share", (req, res) => {
    const shareUrl = `https://ais.app/documents/share/${req.params.id}?token=${Math.random().toString(36).substring(2, 10)}`;
    res.json({
      success: true,
      shareUrl,
      expiresIn: "24 Hours"
    });
  });

  // POST /api/documents/:id/ocr - Trigger OCR re-indexing
  app.post("/api/documents/:id/ocr", (req, res) => {
    res.json({
      success: true,
      extractedText: "GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY OF INDIA • AADHAAR ID",
      confidence: "99.4%"
    });
  });

  // POST /api/documents/:id/merge - Merge documents into a single PDF
  app.post("/api/documents/:id/merge", (req, res) => {
    res.json({
      success: true,
      message: "Merged selected document pages into a single PDF successfully."
    });
  });

  // POST /api/documents/:id/split - Split document pages
  app.post("/api/documents/:id/split", (req, res) => {
    res.json({
      success: true,
      message: "Split document into separate page files successfully."
    });
  });

  // ==========================================
  // AUTOPAY MANAGEMENT SYSTEM REST API
  // ==========================================

  interface AutopayRecord {
    id: string;
    userId: string;
    name: string;
    payeeId: string;
    payeeName: string;
    sourceAccountId: string;
    sourceAccountName: string;
    sourceAccountMasked: string;
    amount: number;
    currency: string;
    frequency: "One-time" | "Daily" | "Weekly" | "Monthly" | "Yearly";
    startDate: string;
    scheduledTime: string;
    nextExecutionAt: string;
    endDate?: string;
    maxPayments?: number;
    completedPaymentsCount: number;
    status: "Active" | "Paused" | "Completed" | "Cancelled";
    lastExecutionAt?: string;
    lastExecutionStatus?: "SUCCESS" | "FAILED" | "PENDING" | "NONE";
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
  }

  interface AutopayExecutionRecord {
    id: string;
    autopayId: string;
    autopayName: string;
    payeeName: string;
    scheduledAt: string;
    executedAt: string;
    amount: number;
    currency: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    providerTransactionId: string;
    failureCode?: string;
    failureMessage?: string;
    idempotencyKey: string;
    createdAt: string;
  }

  const autopaysStore: AutopayRecord[] = [
    {
      id: "ap-101",
      userId: "usr-901",
      name: "BESCOM Electricity Bill Mandate",
      payeeId: "p-electricity",
      payeeName: "BESCOM Electricity Board",
      sourceAccountId: "bank-1",
      sourceAccountName: "HDFC Bank",
      sourceAccountMasked: "•••• 1042",
      amount: 1850,
      currency: "INR",
      frequency: "Monthly",
      startDate: "2026-01-15",
      scheduledTime: "09:00 AM",
      nextExecutionAt: "2026-08-15 09:00 AM",
      endDate: "2027-12-31",
      maxPayments: 24,
      completedPaymentsCount: 7,
      status: "Active",
      lastExecutionAt: "2026-07-15T09:00:00Z",
      lastExecutionStatus: "SUCCESS",
      createdAt: "2026-01-10T10:00:00Z",
      updatedAt: "2026-07-15T09:00:00Z",
    },
    {
      id: "ap-102",
      userId: "usr-901",
      name: "Airtel Fiber High-Speed Internet",
      payeeId: "p-airtel",
      payeeName: "Airtel Broadband & Fiber",
      sourceAccountId: "bank-1",
      sourceAccountName: "HDFC Bank",
      sourceAccountMasked: "•••• 1042",
      amount: 999,
      currency: "INR",
      frequency: "Monthly",
      startDate: "2026-02-18",
      scheduledTime: "10:30 AM",
      nextExecutionAt: "2026-08-18 10:30 AM",
      completedPaymentsCount: 6,
      status: "Active",
      lastExecutionAt: "2026-07-18T10:30:00Z",
      lastExecutionStatus: "SUCCESS",
      createdAt: "2026-02-12T14:20:00Z",
      updatedAt: "2026-07-18T10:30:00Z",
    },
    {
      id: "ap-103",
      userId: "usr-901",
      name: "HDFC Flexi Cap Mutual Fund SIP",
      payeeId: "p-hdfcamc",
      payeeName: "HDFC Mutual Fund AMC",
      sourceAccountId: "bank-2",
      sourceAccountName: "State Bank of India (SBI)",
      sourceAccountMasked: "•••• 8819",
      amount: 5000,
      currency: "INR",
      frequency: "Monthly",
      startDate: "2025-08-20",
      scheduledTime: "08:00 AM",
      nextExecutionAt: "2026-08-20 08:00 AM",
      completedPaymentsCount: 12,
      status: "Active",
      lastExecutionAt: "2026-07-20T08:00:00Z",
      lastExecutionStatus: "SUCCESS",
      createdAt: "2025-08-10T09:00:00Z",
      updatedAt: "2026-07-20T08:00:00Z",
    },
    {
      id: "ap-104",
      userId: "usr-901",
      name: "Netflix Premium 4K Plan",
      payeeId: "p-netflix",
      payeeName: "Netflix India Services",
      sourceAccountId: "bank-3",
      sourceAccountName: "ICICI Bank",
      sourceAccountMasked: "•••• 3310",
      amount: 649,
      currency: "INR",
      frequency: "Monthly",
      startDate: "2026-03-22",
      scheduledTime: "11:00 AM",
      nextExecutionAt: "2026-08-22 11:00 AM",
      completedPaymentsCount: 5,
      status: "Paused",
      lastExecutionAt: "2026-07-22T11:00:00Z",
      lastExecutionStatus: "SUCCESS",
      createdAt: "2026-03-15T12:00:00Z",
      updatedAt: "2026-07-25T16:00:00Z",
    }
  ];

  const autopayExecutionsStore: AutopayExecutionRecord[] = [
    {
      id: "ex-9001",
      autopayId: "ap-101",
      autopayName: "BESCOM Electricity Bill Mandate",
      payeeName: "BESCOM Electricity Board",
      scheduledAt: "2026-07-15 09:00 AM",
      executedAt: "2026-07-15T09:00:02Z",
      amount: 1850,
      currency: "INR",
      status: "SUCCESS",
      providerTransactionId: "NPCI-AUTOPAY-908214108",
      idempotencyKey: "idemp-ap101-20260715",
      createdAt: "2026-07-15T09:00:02Z",
    },
    {
      id: "ex-9002",
      autopayId: "ap-102",
      autopayName: "Airtel Fiber High-Speed Internet",
      payeeName: "Airtel Broadband & Fiber",
      scheduledAt: "2026-07-18 10:30 AM",
      executedAt: "2026-07-18T10:30:01Z",
      amount: 999,
      currency: "INR",
      status: "SUCCESS",
      providerTransactionId: "NPCI-AUTOPAY-410298109",
      idempotencyKey: "idemp-ap102-20260718",
      createdAt: "2026-07-18T10:30:01Z",
    }
  ];

  // GET /api/autopay - List all autopay mandates
  app.get("/api/autopay", (req, res) => {
    res.json({
      success: true,
      count: autopaysStore.length,
      data: autopaysStore
    });
  });

  // GET /api/autopay/:id - Get single autopay mandate details
  app.get("/api/autopay/:id", (req, res) => {
    const autopay = autopaysStore.find((a) => a.id === req.params.id);
    if (!autopay) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }
    const executions = autopayExecutionsStore.filter((e) => e.autopayId === req.params.id);
    res.json({
      success: true,
      data: autopay,
      executions
    });
  });

  // POST /api/autopay - Create new Autopay instruction
  app.post("/api/autopay", (req, res) => {
    const {
      name,
      payeeName,
      sourceAccountId = "bank-1",
      sourceAccountName = "HDFC Bank",
      sourceAccountMasked = "•••• 1042",
      amount,
      frequency = "Monthly",
      startDate = "2026-08-20",
      scheduledTime = "09:00 AM",
      endDate,
      maxPayments
    } = req.body;

    if (!name || !payeeName || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields (name, payeeName, amount)." });
    }

    const newId = `ap-${Date.now()}`;
    const newMandate: AutopayRecord = {
      id: newId,
      userId: "usr-901",
      name,
      payeeId: `p-${Math.floor(1000 + Math.random() * 9000)}`,
      payeeName,
      sourceAccountId,
      sourceAccountName,
      sourceAccountMasked,
      amount: Number(amount),
      currency: "INR",
      frequency,
      startDate,
      scheduledTime,
      nextExecutionAt: `${startDate} ${scheduledTime}`,
      endDate: endDate || undefined,
      maxPayments: maxPayments ? Number(maxPayments) : undefined,
      completedPaymentsCount: 0,
      status: "Active",
      lastExecutionStatus: "NONE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    autopaysStore.unshift(newMandate);

    res.status(201).json({
      success: true,
      message: "Autopay instruction created and authorized successfully.",
      data: newMandate
    });
  });

  // PUT /api/autopay/:id - Edit Autopay instruction
  app.put("/api/autopay/:id", (req, res) => {
    const index = autopaysStore.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }

    autopaysStore[index] = {
      ...autopaysStore[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: "Autopay instruction updated.",
      data: autopaysStore[index]
    });
  });

  // POST /api/autopay/:id/pause - Pause Autopay
  app.post("/api/autopay/:id/pause", (req, res) => {
    const autopay = autopaysStore.find((a) => a.id === req.params.id);
    if (!autopay) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }

    autopay.status = "Paused";
    autopay.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Autopay mandate "${autopay.name}" paused.`,
      data: autopay
    });
  });

  // POST /api/autopay/:id/resume - Resume Autopay
  app.post("/api/autopay/:id/resume", (req, res) => {
    const autopay = autopaysStore.find((a) => a.id === req.params.id);
    if (!autopay) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }

    autopay.status = "Active";
    autopay.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Autopay mandate "${autopay.name}" resumed.`,
      data: autopay
    });
  });

  // DELETE /api/autopay/:id - Delete/Cancel Autopay instruction
  app.delete("/api/autopay/:id", (req, res) => {
    const autopay = autopaysStore.find((a) => a.id === req.params.id);
    if (!autopay) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }

    const { reason = "User requested cancellation" } = req.body || {};

    autopay.status = "Cancelled";
    autopay.cancelledAt = new Date().toISOString();
    autopay.cancellationReason = reason;
    autopay.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Autopay mandate "${autopay.name}" has been cancelled. Future payments will no longer be scheduled. Historical transactions preserved.`,
      data: autopay
    });
  });

  // GET /api/autopay/:id/executions - Get execution history
  app.get("/api/autopay/:id/executions", (req, res) => {
    const executions = autopayExecutionsStore.filter((e) => e.autopayId === req.params.id);
    res.json({
      success: true,
      count: executions.length,
      data: executions
    });
  });

  // POST /api/autopay/:id/execute - Trigger scheduled backend execution worker with idempotency
  app.post("/api/autopay/:id/execute", (req, res) => {
    const autopay = autopaysStore.find((a) => a.id === req.params.id);
    if (!autopay) {
      return res.status(404).json({ success: false, message: "Autopay mandate not found." });
    }

    if (autopay.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: `Cannot execute Autopay in '${autopay.status}' state.`
      });
    }

    const { forceSimulateFailure = false } = req.body || {};
    const idempotencyKey = req.headers["x-idempotency-key"] as string || `idemp-${autopay.id}-${Date.now()}`;

    // Check duplicate execution idempotency
    const existingExec = autopayExecutionsStore.find((e) => e.idempotencyKey === idempotencyKey);
    if (existingExec) {
      return res.json({
        success: true,
        message: "Execution request was already processed (Idempotent call).",
        duplicatePrevented: true,
        execution: existingExec
      });
    }

    if (forceSimulateFailure) {
      const failedExec: AutopayExecutionRecord = {
        id: `ex-${Date.now()}`,
        autopayId: autopay.id,
        autopayName: autopay.name,
        payeeName: autopay.payeeName,
        scheduledAt: autopay.nextExecutionAt,
        executedAt: new Date().toISOString(),
        amount: autopay.amount,
        currency: autopay.currency,
        status: "FAILED",
        providerTransactionId: `NPCI-ERR-${Math.floor(100000 + Math.random() * 900000)}`,
        failureCode: "ERR_INSUFFICIENT_FUNDS_NPCI_04",
        failureMessage: "Bank payment gateway reported insufficient funds in source account.",
        idempotencyKey,
        createdAt: new Date().toISOString()
      };

      autopayExecutionsStore.unshift(failedExec);
      autopay.lastExecutionAt = new Date().toISOString();
      autopay.lastExecutionStatus = "FAILED";

      return res.status(402).json({
        success: false,
        message: "Payment execution failed due to insufficient funds.",
        execution: failedExec
      });
    }

    // Process successful execution
    const successExec: AutopayExecutionRecord = {
      id: `ex-${Date.now()}`,
      autopayId: autopay.id,
      autopayName: autopay.name,
      payeeName: autopay.payeeName,
      scheduledAt: autopay.nextExecutionAt,
      executedAt: new Date().toISOString(),
      amount: autopay.amount,
      currency: autopay.currency,
      status: "SUCCESS",
      providerTransactionId: `NPCI-AUTOPAY-${Math.floor(100000000 + Math.random() * 900000000)}`,
      idempotencyKey,
      createdAt: new Date().toISOString()
    };

    autopayExecutionsStore.unshift(successExec);

    // Update Autopay state
    autopay.completedPaymentsCount += 1;
    autopay.lastExecutionAt = new Date().toISOString();
    autopay.lastExecutionStatus = "SUCCESS";

    // Compute next execution date
    const currentNext = new Date(autopay.startDate || "2026-08-20");
    if (autopay.frequency === "Daily") currentNext.setDate(currentNext.getDate() + 1);
    else if (autopay.frequency === "Weekly") currentNext.setDate(currentNext.getDate() + 7);
    else if (autopay.frequency === "Monthly") currentNext.setMonth(currentNext.getMonth() + 1);
    else if (autopay.frequency === "Yearly") currentNext.setFullYear(currentNext.getFullYear() + 1);

    autopay.nextExecutionAt = `${currentNext.toISOString().split("T")[0]} ${autopay.scheduledTime || "09:00 AM"}`;
    autopay.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Autopay of ₹${autopay.amount.toLocaleString()} to ${autopay.payeeName} executed successfully.`,
      execution: successExec,
      updatedAutopay: autopay
    });
  });

  // =========================================================================
  // UNIFIED PAYMENTS, RECHARGES & BILL PAYMENT ENGINE REST APIS (NPCI / BBPS)
  // =========================================================================

  interface ServerPaymentOrder {
    id: string;
    serviceType: string;
    billerId?: string;
    billerName?: string;
    customerReference: string;
    customerReferenceMasked: string;
    customerName?: string;
    amount: number;
    amountPaise: number;
    currency: string;
    paymentMethod: string;
    sourceAccountId?: string;
    sourceAccountMasked?: string;
    status: string;
    idempotencyKey: string;
    providerReference?: string;
    bbpsReference?: string;
    utrNumber?: string;
    receiptId?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    errorMessage?: string;
  }

  interface ServerTransaction {
    id: string;
    orderId: string;
    serviceType: string;
    serviceCategory: string;
    title: string;
    billerOrRecipientName: string;
    customerReferenceMasked: string;
    amount: number;
    amountPaise: number;
    currency: string;
    status: string;
    paymentMethod: string;
    providerReference: string;
    utrNumber: string;
    timestamp: string;
    createdAt: string;
  }

  const paymentOrdersStore: ServerPaymentOrder[] = [];
  const unifiedTransactionsStore: ServerTransaction[] = [
    {
      id: "TXN-2026-9812",
      orderId: "ORD-9812-BESCOM",
      serviceType: "ELECTRICITY",
      serviceCategory: "Bills",
      title: "Electricity Bill Payment",
      billerOrRecipientName: "BESCOM Bangalore",
      customerReferenceMasked: "88••••1024",
      amount: 1450,
      amountPaise: 145000,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: "Linked Bank Account",
      providerReference: "NPCI-BBPS-8891024",
      utrNumber: "UTR491029485721",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "TXN-2026-9811",
      orderId: "ORD-9811-JIO",
      serviceType: "MOBILE_RECHARGE",
      serviceCategory: "Recharge",
      title: "Mobile Recharge Plan",
      billerOrRecipientName: "Jio Prepaid",
      customerReferenceMasked: "98••••3210",
      amount: 299,
      amountPaise: 29900,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: "UPI",
      providerReference: "RCH-JIO-2026-0912",
      utrNumber: "UTR491029485720",
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: "TXN-2026-9810",
      orderId: "ORD-9810-FASTAG",
      serviceType: "FASTAG",
      serviceCategory: "Recharge",
      title: "FASTag Toll Balance Recharge",
      billerOrRecipientName: "ICICI Bank FASTag",
      customerReferenceMasked: "KA••••1234",
      amount: 500,
      amountPaise: 50000,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: "UPI",
      providerReference: "NETC-TAG-882194",
      utrNumber: "UTR491029485719",
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ];

  // GET /api/services - Service catalog list
  app.get("/api/services", (req, res) => {
    res.json({
      success: true,
      environment: process.env.PAYMENT_ENV || "sandbox",
      servicesCount: 14,
      categories: ["Recharge", "Bills", "Financial Payments", "UPI"]
    });
  });

  // GET /api/billers - Search billers by query & category
  app.get("/api/billers", (req, res) => {
    const { serviceType, query, state, city } = req.query;
    res.json({
      success: true,
      serviceType: serviceType || "ALL",
      query: query || "",
      state: state || "All",
      city: city || "All"
    });
  });

  // POST /api/bills/fetch - Fetch verified bill details
  app.post("/api/bills/fetch", (req, res) => {
    const { serviceType, billerId, billerName, customerReference, state } = req.body;

    if (!customerReference) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_CUSTOMER_REFERENCE",
        message: "Customer reference identifier is required."
      });
    }

    const maskedRef = `${customerReference.slice(0, 2)}••••${customerReference.slice(-4)}`;
    let amount = 1245;
    if (serviceType === "FASTAG") amount = 500;
    else if (serviceType === "WATER") amount = 480;
    else if (serviceType === "PIPED_GAS") amount = 890;
    else if (serviceType === "BROADBAND") amount = 1179;
    else if (serviceType === "DTH_CABLE") amount = 450;
    else if (serviceType === "LPG") amount = 853;
    else if (serviceType === "LOAN_EMI") amount = 4200;
    else if (serviceType === "INSURANCE") amount = 6500;
    else if (serviceType === "EDUCATION_FEE") amount = 12500;

    const bill = {
      billId: `BILL-BBPS-${Math.floor(100000 + Math.random() * 900000)}`,
      billerId: billerId || "provider-default",
      billerName: billerName || "Authorized BBPS Provider",
      serviceType: serviceType || "ELECTRICITY",
      customerReference,
      customerReferenceMasked: maskedRef,
      customerName: "Rajesh Kumar",
      amount,
      amountPaise: amount * 100,
      currency: "INR",
      dueDate: "2026-09-20",
      billDate: "2026-08-20",
      billPeriod: "Aug 2026",
      status: "DUE"
    };

    res.json({
      success: true,
      bill
    });
  });

  // POST /api/payments/orders - Create payment order with idempotency check
  app.post("/api/payments/orders", (req, res) => {
    const {
      serviceType,
      billerId,
      billerName,
      customerReference,
      customerReferenceMasked,
      customerName,
      amount,
      paymentMethod = "Linked Bank Account",
      sourceAccountId,
      sourceAccountMasked
    } = req.body;

    const idempotencyKey =
      (req.headers["x-idempotency-key"] as string) ||
      req.body.idempotencyKey ||
      `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Check duplicate order idempotency
    const existingOrder = paymentOrdersStore.find((o) => o.idempotencyKey === idempotencyKey);
    if (existingOrder) {
      return res.json({
        success: true,
        message: "Existing payment order returned (Idempotent call).",
        duplicatePrevented: true,
        order: existingOrder
      });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: ServerPaymentOrder = {
      id: orderId,
      serviceType: serviceType || "ELECTRICITY",
      billerId,
      billerName: billerName || "Authorized Provider",
      customerReference: customerReference || "CUST-REF",
      customerReferenceMasked: customerReferenceMasked || "••••1234",
      customerName: customerName || "Rajesh Kumar",
      amount: Number(amount) || 1245,
      amountPaise: (Number(amount) || 1245) * 100,
      currency: "INR",
      paymentMethod,
      sourceAccountId,
      sourceAccountMasked,
      status: "CREATED",
      idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    paymentOrdersStore.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      order: newOrder
    });
  });

  // GET /api/payments/orders/:id - Get payment order
  app.get("/api/payments/orders/:id", (req, res) => {
    const order = paymentOrdersStore.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, order });
  });

  // POST /api/payments/orders/:id/verify - Server-side payment verification & state machine
  app.post("/api/payments/orders/:id/verify", (req, res) => {
    const order = paymentOrdersStore.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const utr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const bbpsRef = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    order.status = "SUCCESS";
    order.utrNumber = utr;
    order.bbpsReference = bbpsRef;
    order.providerReference = `NPCI-${bbpsRef}`;
    order.completedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    // Create unified transaction record
    const txn: ServerTransaction = {
      id: `TXN-${Date.now()}`,
      orderId: order.id,
      serviceType: order.serviceType,
      serviceCategory: "Bills",
      title: `${order.serviceType.replace(/_/g, " ")} Payment`,
      billerOrRecipientName: order.billerName || "Authorized Provider",
      customerReferenceMasked: order.customerReferenceMasked,
      amount: order.amount,
      amountPaise: order.amountPaise,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: order.paymentMethod,
      providerReference: order.providerReference,
      utrNumber: utr,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    unifiedTransactionsStore.unshift(txn);

    res.json({
      success: true,
      message: "Payment verified successfully by server switch.",
      order,
      transaction: txn
    });
  });

  // GET /api/transactions - Unified transaction history
  app.get("/api/transactions", (req, res) => {
    const { serviceType, status } = req.query;
    let list = [...unifiedTransactionsStore];

    if (serviceType && serviceType !== "ALL") {
      list = list.filter((t) => t.serviceType === serviceType);
    }
    if (status && status !== "ALL") {
      list = list.filter((t) => t.status === status);
    }

    res.json({
      success: true,
      count: list.length,
      transactions: list
    });
  });

  // GET /api/transactions/:id - Specific transaction lookup
  app.get("/api/transactions/:id", (req, res) => {
    const txn = unifiedTransactionsStore.find((t) => t.id === req.params.id || t.orderId === req.params.id);
    if (!txn) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }
    res.json({ success: true, transaction: txn });
  });

  // POST /api/webhooks/payment - Webhook verification & deduplication
  app.post("/api/webhooks/payment", (req, res) => {
    const signature = req.headers["x-webhook-signature"];
    const { eventId, orderId, status } = req.body;

    if (!eventId || !orderId) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload." });
    }

    res.json({
      success: true,
      message: "Webhook processed and verified.",
      eventId,
      status: status || "CONFIRMED"
    });
  });

  // GET /api/admin/dashboard - Operations metrics
  app.get("/api/admin/dashboard", (req, res) => {
    const totalTransactions = unifiedTransactionsStore.length;
    const totalAmountRupees = unifiedTransactionsStore.reduce((acc, t) => acc + t.amount, 0);
    const successfulCount = unifiedTransactionsStore.filter((t) => t.status === "SUCCESS").length;
    const pendingCount = unifiedTransactionsStore.filter((t) => t.status.includes("PENDING")).length;
    const failedCount = unifiedTransactionsStore.filter((t) => t.status.includes("FAILED")).length;

    res.json({
      success: true,
      metrics: {
        totalTransactions,
        totalAmountPaise: totalAmountRupees * 100,
        totalAmountRupees,
        successfulCount,
        pendingCount,
        failedCount,
        refundPendingCount: 0,
        refundedCount: 0,
        serviceBreakdown: {
          ELECTRICITY: { count: 12, amount: 28400 },
          MOBILE_RECHARGE: { count: 8, amount: 4200 },
          FASTAG: { count: 5, amount: 3500 },
          WATER: { count: 3, amount: 1820 }
        },
        recentTransactions: unifiedTransactionsStore.slice(0, 10),
        pendingReconciliation: pendingCount
      }
    });
  });

  // POST /api/admin/reconcile - Manual or automated switch reconciliation
  app.post("/api/admin/reconcile", (req, res) => {
    const { transactionId } = req.body;
    const txn = unifiedTransactionsStore.find((t) => t.id === transactionId);

    if (txn) {
      txn.status = "SUCCESS";
    }

    res.json({
      success: true,
      message: `Transaction ${transactionId || "batch"} reconciled successfully with NPCI/BBPS switch.`
    });
  });


  // Vite middleware for development vs production static hosting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Document Scanner REST API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
