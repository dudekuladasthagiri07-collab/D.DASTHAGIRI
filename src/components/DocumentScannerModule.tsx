import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  FileText,
  Upload,
  FolderPlus,
  History,
  Sparkles,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Scissors,
  Copy,
  Search,
  Globe,
  Download,
  Share2,
  Trash2,
  Plus,
  Check,
  X,
  Eye,
  Lock,
  ShieldCheck,
  Zap,
  Grid,
  Sun,
  Contrast as ContrastIcon,
  Layers,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  User,
  Shield,
  Clock,
  HardDrive,
  FileCheck,
  Tag,
  Folder,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileArchive,
  Maximize2,
  Minimize2,
  Wand2,
  HelpCircle,
  Maximize
} from 'lucide-react';
import {
  ScannedDocumentItem,
  DocumentScanHistoryItem,
  DocumentAuditLogItem,
  DocumentCategoryType,
  ImageFilterType,
  ScanPage,
  UserProfile
} from '../types';
import {
  INITIAL_SCANNED_DOCUMENTS,
  INITIAL_SCAN_HISTORY,
  INITIAL_AUDIT_LOGS
} from '../mock/documentScannerData';
import { documentScannerApi } from '../services/documentScannerApi';

interface Props {
  user: UserProfile;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  onClose?: () => void;
}

export const DocumentScannerModule: React.FC<Props> = ({
  user,
  onLogActivity,
  onClose
}) => {
  // Navigation Tabs inside Document Scanner Sub-module
  const [activeNav, setActiveNav] = useState<
    'upload_doc' | 'new_folder' | 'import_file' | 'doc_scanner' | 'doc_history' | 'audit_logs'
  >('doc_scanner');

  // Documents & Scan State
  const [documents, setDocuments] = useState<ScannedDocumentItem[]>(INITIAL_SCANNED_DOCUMENTS);
  const [scanHistory, setScanHistory] = useState<DocumentScanHistoryItem[]>(INITIAL_SCAN_HISTORY);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Active Scanner Mode
  const [scannerMode, setScannerMode] = useState<'camera' | 'workspace' | 'history' | 'audit'>('camera');

  // Camera State & Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [gridOverlayEnabled, setGridOverlayEnabled] = useState<boolean>(true);
  const [autoEdgeDetect, setAutoEdgeDetect] = useState<boolean>(true);
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);

  // Current Multi-Page Capture Pages in Workspace
  const [pages, setPages] = useState<ScanPage[]>([
    {
      id: 'p-initial-1',
      pageNumber: 1,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      rotation: 0,
      flippedHorizontal: false,
      flippedVertical: false,
      filter: 'Magic Color',
      brightness: 0,
      contrast: 10,
      sharpness: 20,
      shadowRemoval: true,
      noiseReduction: true,
      ocrText: 'GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY OF INDIA\nName: D. LAKSHMI NARAYANA\nDOB: 20/05/1995\nGender: MALE\nAadhaar No: XXXX-XXXX-8821\nAddress: H.No 4/129, Main Road, Dharmavaram, Anantapur, AP - 515671'
    }
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Editing & Filter State for active page
  const [selectedFilter, setSelectedFilter] = useState<ImageFilterType>('Magic Color');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(10);
  const [sharpness, setSharpness] = useState<number>(20);
  const [shadowRemoval, setShadowRemoval] = useState<boolean>(true);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);

  // Crop Corners State (4 corners: Top-Left, Top-Right, Bottom-Right, Bottom-Left)
  const [cropCorners, setCropCorners] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 90, y: 10 },
    { x: 90, y: 90 },
    { x: 10, y: 90 }
  ]);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  // Undo / Redo Stack for Page Adjustments
  const [historyStack, setHistoryStack] = useState<ScanPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // OCR Processing State
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState<string>('');
  const [ocrTargetLanguage, setOcrTargetLanguage] = useState<string>('English');
  const [translatedOcrText, setTranslatedOcrText] = useState<string | null>(null);

  // Save Modal & Details Form State
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>('Scanned_Document_2026.pdf');
  const [docFolder, setDocFolder] = useState<string>('Government ID Vault');
  const [docCategory, setDocCategory] = useState<DocumentCategoryType>('Government');
  const [docTagsInput, setDocTagsInput] = useState<string>('Scanned, Official, Verified');
  const [docDescription, setDocDescription] = useState<string>('High quality multi-page scan saved via SecurePay Document Engine.');
  const [docFormat, setDocFormat] = useState<'PDF' | 'JPG' | 'PNG' | 'ZIP' | 'Multiple PDFs'>('PDF');
  const [docResolution, setDocResolution] = useState<'150 DPI' | '300 DPI' | '600 DPI'>('300 DPI');
  const [docColorMode, setDocColorMode] = useState<'Full Color' | 'Grayscale' | 'Black & White'>('Full Color');
  const [docEncrypted, setDocEncrypted] = useState<boolean>(true);

  // Role Permissions
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Employee' | 'Viewer'>('Admin');
  const [rolePermissions, setRolePermissions] = useState({
    admin: true,
    manager: true,
    employee: true,
    viewer: true
  });

  // Search & Filter Controls for Saved Scans
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'smallest' | 'name_asc' | 'name_desc'>('newest');

  // Preview / Detail Modal State for existing saved document
  const [viewingDoc, setViewingDoc] = useState<ScannedDocumentItem | null>(null);
  const [viewingPageIdx, setViewingPageIdx] = useState<number>(0);

  // Merge & Split Modals
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);
  const [selectedDocIdsForMerge, setSelectedDocIdsForMerge] = useState<string[]>([]);

  // Folder creation modal
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Auto Start Camera stream when in camera mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (scannerMode === 'camera') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: cameraFacing, width: { ideal: 1920 }, height: { ideal: 1080 } }
          })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.play();
            }
            setIsCameraActive(true);
          })
          .catch((err) => {
            console.warn('Camera stream blocked or unavailable in frame. Using high-def fallback video simulator:', err);
            setIsCameraActive(false);
          });
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scannerMode, cameraFacing]);

  // Capture Page Snapshot
  const handleCaptureSnapshot = () => {
    const newPageNum = pages.length + 1;
    const sampleImages = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80'
    ];
    const newCapturedPage: ScanPage = {
      id: `p-${Date.now()}-${newPageNum}`,
      pageNumber: newPageNum,
      imageUrl: sampleImages[(newPageNum - 1) % sampleImages.length],
      rotation: 0,
      flippedHorizontal: false,
      flippedVertical: false,
      filter: selectedFilter,
      brightness,
      contrast,
      sharpness,
      shadowRemoval,
      noiseReduction,
      ocrText: `SCANNED PAGE ${newPageNum}\nDocument Title: Official Verification Record\nTimestamp: ${new Date().toLocaleString()}\nStatus: Verified 300 DPI Clean Scan`
    };

    setPages((prev) => [...prev, newCapturedPage]);
    setActivePageIndex(pages.length);
    setScannerMode('workspace');

    // Add Audit Log
    addAuditLog('Scan', `Captured Page ${newPageNum} via Camera Scanner`);
    onLogActivity('Document Scanned', `Scanned page ${newPageNum} with auto-crop`, 'document');
  };

  // Gallery File Import
  const handleImportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      const newImportedPages: ScanPage[] = fileList.map((file: File, idx: number) => {
        const pageNum = pages.length + idx + 1;
        return {
          id: `p-file-${Date.now()}-${idx}`,
          pageNumber: pageNum,
          imageUrl: URL.createObjectURL(file),
          rotation: 0,
          flippedHorizontal: false,
          flippedVertical: false,
          filter: 'Auto',
          brightness: 0,
          contrast: 10,
          sharpness: 10,
          shadowRemoval: true,
          noiseReduction: true,
          ocrText: `IMPORTED PAGE ${pageNum} (${file.name})\nFile Size: ${(file.size / 1024).toFixed(1)} KB`
        };
      });

      setPages((prev) => [...prev, ...newImportedPages]);
      setActivePageIndex(pages.length);
      setScannerMode('workspace');
      addAuditLog('Scan', `Imported ${fileList.length} files from local gallery`);
      onLogActivity('Imported Document Files', `Imported ${fileList.length} files to Document Scanner`, 'document');
    }
  };

  // Page Operations
  const handleAddPage = () => {
    setScannerMode('camera');
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('Document must contain at least one page.');
      return;
    }
    const updated = pages.filter((_, idx) => idx !== index).map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(updated);
    if (activePageIndex >= updated.length) {
      setActivePageIndex(updated.length - 1);
    }
    addAuditLog('Edit', `Deleted Page ${index + 1}`);
  };

  const handleDuplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const dupPage: ScanPage = {
      ...pageToDup,
      id: `p-dup-${Date.now()}`,
      pageNumber: pages.length + 1
    };
    const updated = [...pages, dupPage].map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(updated);
    setActivePageIndex(updated.length - 1);
    addAuditLog('Edit', `Duplicated Page ${index + 1}`);
  };

  const handleRotatePage = (direction: 'cw' | 'ccw') => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx === activePageIndex) {
          const change = direction === 'cw' ? 90 : -90;
          let newRot = (p.rotation + change) % 360;
          if (newRot < 0) newRot += 360;
          return { ...p, rotation: newRot };
        }
        return p;
      })
    );
    addAuditLog('Edit', `Rotated Page ${activePageIndex + 1}`);
  };

  const handleFlipPage = (type: 'h' | 'v') => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx === activePageIndex) {
          return {
            ...p,
            flippedHorizontal: type === 'h' ? !p.flippedHorizontal : p.flippedHorizontal,
            flippedVertical: type === 'v' ? !p.flippedVertical : p.flippedVertical
          };
        }
        return p;
      })
    );
    addAuditLog('Edit', `Flipped Page ${activePageIndex + 1} (${type === 'h' ? 'Horizontal' : 'Vertical'})`);
  };

  const handleMovePage = (direction: 'up' | 'down') => {
    if (
      (direction === 'up' && activePageIndex === 0) ||
      (direction === 'down' && activePageIndex === pages.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? activePageIndex - 1 : activePageIndex + 1;
    const newPages = [...pages];
    const temp = newPages[activePageIndex];
    newPages[activePageIndex] = newPages[targetIdx];
    newPages[targetIdx] = temp;

    const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(renumbered);
    setActivePageIndex(targetIdx);
    addAuditLog('Edit', `Reordered Page ${activePageIndex + 1} to ${targetIdx + 1}`);
  };

  // OCR Processing Simulation
  const handleRunOcr = () => {
    setIsProcessingOcr(true);
    setTimeout(() => {
      setIsProcessingOcr(false);
      const activeP = pages[activePageIndex];
      addAuditLog('OCR', `Extracted OCR text for Page ${activeP.pageNumber}`);
      alert(`OCR Text Extraction Complete for Page ${activeP.pageNumber}!`);
    }, 1200);
  };

  // Translate OCR text
  const handleTranslateOcr = () => {
    const textToTranslate = pages[activePageIndex]?.ocrText || 'Sample extracted document text';
    const mockTranslations: Record<string, string> = {
      Hindi: 'भारत सरकार • भारतीय विशिष्ट पहचान प्राधिकरण\nनाम: डी. लक्ष्मी नारायण\nजन्म तिथि: 20/05/1995\nलिंग: पुरुष',
      Telugu: 'భారత ప్రభుత్వం • విశిష్ట గురింపు ప్రాధికార సంస్థ\nపేరు: డి. లక్ష్మీ నారాయణ\nపుట్టిన తేదీ: 20/05/1995',
      Tamil: 'இந்திய அரசு • தனித்துவ அடையாள ஆணையம்\nபெயர்: டி. லட்சுமி நாராயணா',
      French: 'GOUVERNEMENT DE L\'INDE • AUTORITÉ D\'IDENTIFICATION UNIQUE DE L\'INDE\nNom: D. LAKSHMI NARAYANA',
      Spanish: 'GOBIERNO DE LA INDIA • AUTORIDAD DE IDENTIFICACIÓN ÚNICA DE LA INDIA\nNombre: D. LAKSHMI NARAYANA'
    };
    setTranslatedOcrText(mockTranslations[ocrTargetLanguage] || `[${ocrTargetLanguage} Translation]: ${textToTranslate}`);
  };

  // Audit Logger Helper
  const addAuditLog = (action: DocumentAuditLogItem['action'], remarks: string) => {
    const newLog: DocumentAuditLogItem = {
      logId: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      user: `${user.name} (${userRole})`,
      action,
      document: docName || 'Active Scan Workspace',
      scanTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      device: 'Android Phone / SecurePay App',
      ipAddress: '103.22.140.12',
      status: 'Success',
      remarks
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Save Scanned Document Function
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDocId = `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newScanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`;

    const ocrMergedText = pages.map((p) => p.ocrText).join('\n---\n');

    // Call REST API Endpoint POST /api/documents/scan
    try {
      await documentScannerApi.scanDocument({
        title: docName,
        category: docCategory,
        pagesCount: pages.length,
        filterMode: selectedFilter,
        ocrText: ocrMergedText,
        user: user.name
      });
    } catch (apiErr) {
      console.warn('REST API scan save notice:', apiErr);
    }

    const newDoc: ScannedDocumentItem = {
      id: `sc-${Date.now()}`,
      documentId: newDocId,
      name: docName,
      folder: docFolder,
      category: docCategory,
      tags: docTagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      description: docDescription,
      pages,
      pageCount: pages.length,
      fileSize: `${(pages.length * 1.2).toFixed(1)} MB`,
      resolution: docResolution,
      colorMode: docColorMode,
      format: docFormat,
      ocrStatus: 'Completed',
      ocrText: ocrMergedText,
      scanSource: 'Camera Device',
      cameraDevice: 'Android Sony IMX766 50MP Lens',
      createdBy: `${user.name} (${userRole})`,
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      modifiedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      version: 'v1.0',
      remarks: 'Saved directly to Documents vault with metadata & encryption.',
      permissions: rolePermissions,
      encrypted: docEncrypted,
      thumbnailUrl: pages[0]?.imageUrl
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Add to Scan History
    const newHistory: DocumentScanHistoryItem = {
      scanId: newScanId,
      documentId: newDocId,
      documentName: docName,
      scanDate: new Date().toISOString().substring(0, 10),
      scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: user.name,
      pages: pages.length,
      format: docFormat,
      status: 'Completed',
      storageLocation: `Documents/${docFolder}`,
      fileSize: newDoc.fileSize,
      createdOn: newDoc.createdDate,
      updatedOn: newDoc.modifiedDate
    };
    setScanHistory((prev) => [newHistory, ...prev]);

    addAuditLog('Scan', `Saved document "${docName}" into folder "${docFolder}" with ${pages.length} page(s).`);
    onLogActivity('Saved Scanned Document', `Saved "${docName}" to Documents Vault via REST API`, 'document');

    setShowSaveModal(false);
    setScannerMode('history');
    alert(`Document "${docName}" saved successfully via REST API under Documents -> ${docFolder}!`);
  };

  // Filtered Documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.ocrText && doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesFormat = filterFormat === 'all' || doc.format === filterFormat;

    return matchesSearch && matchesCategory && matchesFormat;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.createdDate.localeCompare(a.createdDate);
    if (sortBy === 'oldest') return a.createdDate.localeCompare(b.createdDate);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    return 0;
  });

  // Calculate Dashboard Metrics
  const totalDocsCount = documents.length;
  const scannedTodayCount = scanHistory.filter(
    (h) => h.scanDate === new Date().toISOString().substring(0, 10)
  ).length;
  const pdfCount = documents.filter((d) => d.format === 'PDF').length;
  const imgCount = documents.filter((d) => d.format === 'JPG' || d.format === 'PNG').length;

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      
      {/* 1. DOCUMENTS SECTION TOP NAVIGATION BAR */}
      <div className="bg-white border border-slate-200 rounded-[24px] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 📤 Upload Document */}
            <button
              onClick={() => {
                setActiveNav('upload_doc');
                setShowSaveModal(true);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeNav === 'upload_doc'
                  ? 'bg-purple-100 text-[#6A1BFF] border border-purple-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 text-[#6A1BFF]" />
              <span className="whitespace-nowrap">Upload Document</span>
            </button>

            {/* 📁 New Folder */}
            <button
              onClick={() => {
                setActiveNav('new_folder');
                setShowFolderModal(true);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeNav === 'new_folder'
                  ? 'bg-purple-100 text-[#6A1BFF] border border-purple-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              <span className="whitespace-nowrap">New Folder</span>
            </button>

            {/* 📥 Import File */}
            <label
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeNav === 'import_file'
                  ? 'bg-purple-100 text-[#6A1BFF] border border-purple-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="whitespace-nowrap">Import File</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                className="hidden"
                onChange={handleImportFiles}
              />
            </label>

            {/* 📄 Document Scanner (NEW) */}
            <button
              onClick={() => {
                setActiveNav('doc_scanner');
                setScannerMode('camera');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer relative shadow-sm ${
                activeNav === 'doc_scanner'
                  ? 'bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white shadow-purple-900/30 ring-2 ring-purple-300/50'
                  : 'bg-purple-50 text-[#6A1BFF] hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span className="text-base">📄</span>
              <span className="whitespace-nowrap">Document Scanner</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse">
                NEW
              </span>
            </button>

            {/* 📜 Document History */}
            <button
              onClick={() => {
                setActiveNav('doc_history');
                setScannerMode('history');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeNav === 'doc_history' || scannerMode === 'history'
                  ? 'bg-purple-100 text-[#6A1BFF] border border-purple-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span className="whitespace-nowrap">Document History</span>
            </button>

          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>

      {/* 2. HERO BANNER & DESCRIPTION */}
      <div className="bg-gradient-to-r from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] rounded-[24px] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-md">
              📄
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-xs">
              STANDALONE MODULE
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Document Scanner
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
            Scan paper documents and save them as PDF or images with auto edge detection, perspective correction, multi-page layout, OCR text extraction, and NPCI vault encryption.
          </p>
        </div>

        {/* Quick Mode Switch Buttons */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => setScannerMode('camera')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              scannerMode === 'camera'
                ? 'bg-white text-[#6A1BFF] shadow-md'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <Camera className="w-4 h-4" /> Camera Scan
          </button>
          <button
            onClick={() => setScannerMode('workspace')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              scannerMode === 'workspace'
                ? 'bg-white text-[#6A1BFF] shadow-md'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <Sliders className="w-4 h-4" /> Workspace ({pages.length} Pg)
          </button>
          <button
            onClick={() => setScannerMode('history')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              scannerMode === 'history'
                ? 'bg-white text-[#6A1BFF] shadow-md'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <FileText className="w-4 h-4" /> Saved Vault ({documents.length})
          </button>
        </div>
      </div>

      {/* 3. ANALYTICS CARDS DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Documents</p>
          <p className="text-xl font-black text-slate-900">{totalDocsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanned Today</p>
          <p className="text-xl font-black text-emerald-600">{scannedTodayCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanned Month</p>
          <p className="text-xl font-black text-[#6A1BFF]">{totalDocsCount + 12}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending OCR</p>
          <p className="text-xl font-black text-amber-600">0</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PDF Files</p>
          <p className="text-xl font-black text-blue-600">{pdfCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image Files</p>
          <p className="text-xl font-black text-purple-600">{imgCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Used</p>
          <p className="text-xl font-black text-slate-900">142 MB</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Left</p>
          <p className="text-xl font-black text-emerald-600">1.85 GB</p>
        </div>
      </div>

      {/* 4. CAMERA SCANNER MODE */}
      {scannerMode === 'camera' && (
        <div className="bg-slate-950 rounded-[28px] p-4 sm:p-6 text-white shadow-2xl border border-slate-800 space-y-5 relative overflow-hidden">
          
          {/* Camera Controls Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Live Document Edge Finder
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950 uppercase">
                Ready
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Flashlight Toggle */}
              <button
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  flashEnabled
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle Flashlight"
              >
                <Zap className="w-4 h-4" />
              </button>

              {/* Grid Toggle */}
              <button
                onClick={() => setGridOverlayEnabled(!gridOverlayEnabled)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  gridOverlayEnabled
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle Grid Overlay"
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Camera Facing Switch */}
              <button
                onClick={() => setCameraFacing(cameraFacing === 'user' ? 'environment' : 'user')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Switch Camera Device"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera Viewfinder Box with Grid & Edge Boundary Simulation */}
          <div className="relative w-full h-[360px] sm:h-[460px] rounded-2xl bg-black border-2 border-dashed border-purple-500/40 overflow-hidden flex items-center justify-center">
            
            {/* Real Video element or High-Def Fallback Image */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {!isCameraActive && (
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80"
                alt="Document Target"
                className="w-full h-full object-cover opacity-85"
              />
            )}

            {/* Rule of Thirds Grid Overlay */}
            {gridOverlayEnabled && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
              </div>
            )}

            {/* Auto Paper Edge Detection Box Overlay */}
            <div className="absolute inset-10 sm:inset-16 border-2 border-emerald-400 bg-emerald-500/10 rounded-xl pointer-events-none flex items-center justify-center shadow-2xl animate-pulse">
              <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full shadow-md">
                ✓ PAPER EDGES DETECTED (AUTO CROP ON)
              </span>
              
              {/* 4 Corner Anchors */}
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-md" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-md" />
              <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-md" />
              <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-md" />
            </div>

            {/* Flash Overlay */}
            {flashEnabled && <div className="absolute inset-0 bg-white/20 pointer-events-none" />}
          </div>

          {/* Camera Bottom Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEdgeDetect}
                  onChange={(e) => setAutoEdgeDetect(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                Auto Perspective Correction
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEnhance}
                  onChange={(e) => setAutoEnhance(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                Auto Magic Color
              </label>
            </div>

            {/* Capture Shutter Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCaptureSnapshot}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white font-black text-sm shadow-xl hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 cursor-pointer ring-4 ring-purple-500/30"
              >
                <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                Capture Page ({pages.length + 1})
              </button>

              <button
                onClick={() => setScannerMode('workspace')}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Done ({pages.length} Pages)
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. MULTI-PAGE WORKSPACE & IMAGE ENHANCEMENT EDITING TOOLS */}
      {scannerMode === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Multi-Page Thumbnails Tray */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[24px] p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6A1BFF]" /> Pages ({pages.length})
              </h4>
              <button
                onClick={handleAddPage}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6A1BFF] font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Page
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                    idx === activePageIndex
                      ? 'bg-purple-50 border-[#6A1BFF] ring-2 ring-purple-300/50 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="w-14 h-18 rounded-xl bg-slate-900 overflow-hidden border border-slate-300 shrink-0 relative">
                    <img
                      src={p.imageUrl}
                      alt={`Page ${p.pageNumber}`}
                      style={{
                        transform: `rotate(${p.rotation}deg) scaleX(${p.flippedHorizontal ? -1 : 1}) scaleY(${p.flippedVertical ? -1 : 1})`
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-black bg-slate-900/80 text-white">
                      Pg {p.pageNumber}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900 truncate">Page {p.pageNumber}</h5>
                    <p className="text-[10px] text-slate-500 font-semibold">{p.filter}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePage(idx);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(idx);
                        }}
                        className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleMovePage('up')}
                disabled={activePageIndex === 0}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Move Up
              </button>
              <button
                onClick={() => handleMovePage('down')}
                disabled={activePageIndex === pages.length - 1}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" /> Move Down
              </button>
            </div>
          </div>

          {/* Center Column: Active Page Inspector & Filter Controls */}
          <div className="lg:col-span-9 space-y-5">
            
            <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs space-y-4">
              
              {/* Workspace Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Editing Page {activePageIndex + 1} of {pages.length}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-[#6A1BFF]">
                    {pages[activePageIndex]?.filter || 'Magic Color'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleRotatePage('cw')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Rotate 90 Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate
                  </button>
                  <button
                    onClick={() => handleFlipPage('h')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                  </button>
                  <button
                    onClick={() => handleFlipPage('v')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-3.5 h-3.5" /> Flip V
                  </button>
                  <button
                    onClick={() => setIsCropping(!isCropping)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
                      isCropping ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" /> {isCropping ? 'Apply Crop' : 'Adjust Crop'}
                  </button>
                  <button
                    onClick={handleRunOcr}
                    disabled={isProcessingOcr}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> {isProcessingOcr ? 'Extracting...' : 'Extract OCR'}
                  </button>
                </div>
              </div>

              {/* Page Inspector View */}
              <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <img
                  src={pages[activePageIndex]?.imageUrl}
                  alt="Inspected Scan"
                  style={{
                    transform: `rotate(${pages[activePageIndex]?.rotation || 0}deg) scaleX(${
                      pages[activePageIndex]?.flippedHorizontal ? -1 : 1
                    }) scaleY(${pages[activePageIndex]?.flippedVertical ? -1 : 1})`,
                    filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`
                  }}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />

                {/* Perspective Corner Drag Handles Overlay when cropping */}
                {isCropping && (
                  <div className="absolute inset-8 border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-md">
                      Drag Corner Handles to Adjust Perspective
                    </span>
                    <div className="absolute top-0 left-0 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full shadow-lg" />
                  </div>
                )}
              </div>

              {/* Filter Buttons Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enhancement Filters
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    'Original',
                    'Auto',
                    'Color',
                    'Black & White',
                    'Grayscale',
                    'High Contrast',
                    'Magic Color',
                    'Document',
                    'Photo'
                  ].map((filterName) => (
                    <button
                      key={filterName}
                      onClick={() => {
                        setSelectedFilter(filterName as ImageFilterType);
                        setPages((prev) =>
                          prev.map((p, idx) =>
                            idx === activePageIndex ? { ...p, filter: filterName as ImageFilterType } : p
                          )
                        );
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        selectedFilter === filterName
                          ? 'bg-[#6A1BFF] text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {filterName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-tuning Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Brightness</span>
                    <span>{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#6A1BFF]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Contrast</span>
                    <span>{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[#6A1BFF]"
                  />
                </div>
              </div>

            </div>

            {/* Extracted OCR Text Box */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-500" /> Extracted OCR Text (Page {activePageIndex + 1})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pages[activePageIndex]?.ocrText || '');
                      alert('OCR Text copied to clipboard!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>

              <textarea
                value={pages[activePageIndex]?.ocrText || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setPages((prev) =>
                    prev.map((p, idx) => (idx === activePageIndex ? { ...p, ocrText: val } : p))
                  );
                }}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              {/* Translation Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-600">Translate To:</span>
                  <select
                    value={ocrTargetLanguage}
                    onChange={(e) => setOcrTargetLanguage(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="French">French (Français)</option>
                    <option value="Spanish">Spanish (Español)</option>
                  </select>
                  <button
                    onClick={handleTranslateOcr}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    Translate
                  </button>
                </div>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white font-black text-xs shadow-md hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Save Document to Vault
                </button>
              </div>

              {translatedOcrText && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-sans text-indigo-950 space-y-1">
                  <p className="font-bold text-[10px] text-indigo-600 uppercase">Translated Text ({ocrTargetLanguage}):</p>
                  <p className="whitespace-pre-line">{translatedOcrText}</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 6. SAVED DOCUMENTS VAULT & HISTORY TABLE */}
      {scannerMode === 'history' && (
        <div className="space-y-5">
          
          {/* Search, Filter & Sorting Bar */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scans by name, folder, category, tag, or OCR text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Government">Government</option>
                <option value="Personal">Personal</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical</option>
                <option value="Financial">Financial</option>
                <option value="Legal">Legal</option>
                <option value="Bills">Bills & Receipts</option>
              </select>

              {/* Format Filter */}
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6A1BFF]" /> Saved Document Scans ({filteredDocuments.length})
              </h4>
              <button
                onClick={() => setScannerMode('camera')}
                className="px-3 py-1.5 rounded-xl bg-[#6A1BFF] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Scan
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Document Name</th>
                    <th className="p-3.5">Folder</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Pages</th>
                    <th className="p-3.5">Size</th>
                    <th className="p-3.5">Created Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-10 rounded bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                          {doc.format}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.documentId}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          📁 {doc.folder}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6A1BFF] font-black text-[10px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold">{doc.pageCount} Pg</td>
                      <td className="p-3.5 font-mono">{doc.fileSize}</td>
                      <td className="p-3.5 text-slate-500">{doc.createdDate}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Encrypted
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => {
                            setViewingDoc(doc);
                            setViewingPageIdx(0);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            alert(`Downloading ${doc.name}...`);
                            addAuditLog('Download', `Downloaded document ${doc.name}`);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-[#6A1BFF] font-bold text-[11px]"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Scan History Table */}
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" /> Document Scan History Table
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Scan ID</th>
                    <th className="p-3.5">Document ID</th>
                    <th className="p-3.5">Document Name</th>
                    <th className="p-3.5">Scan Date & Time</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Pages</th>
                    <th className="p-3.5">Format</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                  {scanHistory.map((h) => (
                    <tr key={h.scanId} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-[#6A1BFF]">{h.scanId}</td>
                      <td className="p-3.5">{h.documentId}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">{h.documentName}</td>
                      <td className="p-3.5 text-slate-500">{h.scanDate} {h.scanTime}</td>
                      <td className="p-3.5 font-sans">{h.user}</td>
                      <td className="p-3.5">{h.pages}</td>
                      <td className="p-3.5">{h.format}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-[10px]">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Document Audit Logs Table
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Document</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Device & IP</th>
                    <th className="p-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-indigo-600">{log.logId}</td>
                      <td className="p-3.5 font-sans">{log.user}</td>
                      <td className="p-3.5 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-extrabold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">{log.document}</td>
                      <td className="p-3.5 text-slate-500">{log.scanTime}</td>
                      <td className="p-3.5 text-slate-500">{log.device} ({log.ipAddress})</td>
                      <td className="p-3.5 font-sans text-slate-600">{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 7. SAVE DOCUMENT MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#6A1BFF]" /> Save Scanned Document to Vault
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">Document Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Folder</label>
                  <select
                    value={docFolder}
                    onChange={(e) => setDocFolder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="Government ID Vault">Government ID Vault</option>
                    <option value="Insurance & Claims">Insurance & Claims</option>
                    <option value="Receipts & Tax">Receipts & Tax</option>
                    <option value="Education Credentials">Education Credentials</option>
                    <option value="Legal Agreements">Legal Agreements</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentCategoryType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="Government">Government</option>
                    <option value="Personal">Personal</option>
                    <option value="Education">Education</option>
                    <option value="Medical">Medical</option>
                    <option value="Financial">Financial</option>
                    <option value="Legal">Legal</option>
                    <option value="Office">Office</option>
                    <option value="Business">Business</option>
                    <option value="Bills">Bills</option>
                    <option value="Receipts">Receipts</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Export Format</label>
                  <select
                    value={docFormat}
                    onChange={(e) => setDocFormat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="PDF">Single PDF</option>
                    <option value="Multiple PDFs">Multiple PDFs</option>
                    <option value="JPG">JPG Image</option>
                    <option value="PNG">PNG Image</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Resolution & Quality</label>
                  <select
                    value={docResolution}
                    onChange={(e) => setDocResolution(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="150 DPI">150 DPI (Compact)</option>
                    <option value="300 DPI">300 DPI (Standard)</option>
                    <option value="600 DPI">600 DPI (Ultra HD Print)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={docTagsInput}
                  onChange={(e) => setDocTagsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">Description / Remarks</label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#6A1BFF]" />
                  <span className="text-xs font-bold text-slate-800">AES-256 Client-Side Encryption</span>
                </div>
                <input
                  type="checkbox"
                  checked={docEncrypted}
                  onChange={(e) => setDocEncrypted(e.target.checked)}
                  className="w-4 h-4 text-[#6A1BFF] rounded focus:ring-purple-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6A1BFF] to-[#8E24AA] text-white font-black text-xs shadow-md hover:brightness-110 cursor-pointer"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. NEW FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" /> Create New Vault Folder
            </h3>
            <input
              type="text"
              placeholder="e.g. Income Tax Returns 2026"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName) {
                    alert(`Folder "${newFolderName}" created successfully!`);
                    setShowFolderModal(false);
                    setNewFolderName('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#6A1BFF] text-white font-bold text-xs shadow-md"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DOCUMENT PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{viewingDoc.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{viewingDoc.documentId} • {viewingDoc.folder}</p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 rounded-2xl h-[340px] flex items-center justify-center p-3">
                <img
                  src={viewingDoc.pages[viewingPageIdx]?.imageUrl || viewingDoc.thumbnailUrl}
                  alt={viewingDoc.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900">Document Metadata</p>
                  <p><strong>Category:</strong> {viewingDoc.category}</p>
                  <p><strong>Pages:</strong> {viewingDoc.pageCount}</p>
                  <p><strong>File Size:</strong> {viewingDoc.fileSize}</p>
                  <p><strong>Resolution:</strong> {viewingDoc.resolution}</p>
                  <p><strong>Created By:</strong> {viewingDoc.createdBy}</p>
                  <p><strong>Created Date:</strong> {viewingDoc.createdDate}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                  <p className="font-bold text-[#6A1BFF]">Extracted OCR Content</p>
                  <p className="text-[11px] font-mono text-slate-700 whitespace-pre-line max-h-[140px] overflow-y-auto">
                    {viewingDoc.ocrText || 'No OCR text extracted.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${viewingDoc.name}`);
                  setViewingDoc(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#6A1BFF] text-white font-bold text-xs shadow-md"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
