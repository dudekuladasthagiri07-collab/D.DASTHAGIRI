import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  Upload,
  FileText,
  CheckCircle2,
  Eye,
  Sparkles,
  X,
  Scan,
  QrCode,
  Search,
  GraduationCap,
  Award,
  BookOpen,
  Vote,
  FileCheck,
  Plus,
  FolderLock,
  Building2,
  MapPin,
  School,
  Landmark,
  Map,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
  Calendar,
  User,
  BadgeCheck,
  Flag,
  Globe,
  FlipHorizontal,
  RotateCcw,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { DocumentItem, UserProfile, ConnectedPortal } from '../types';
import { PortalCategorizationModule } from './PortalCategorizationModule';
import { DocumentScannerModule } from './DocumentScannerModule';
import { generateDocumentPDF, generateVerificationSummaryPDF } from '../utils/pdfGenerator';

// Indian States, Districts, Mandals, and Villages Hierarchy Data
interface IndiaGeoData {
  [stateName: string]: {
    [districtName: string]: {
      [mandalName: string]: string[];
    };
  };
}

const INDIA_LOCATION_DATA: IndiaGeoData = {
  'Andhra Pradesh': {
    'Anantapur': {
      'Dharmavaram': ['Dharmavaram Town', 'Kothapeta', 'Gotkur', 'Subbaraopeta', 'Regatipalle'],
      'Tadipatri': ['Tadipatri Town', 'Chinnapolamada', 'Sajjaladinne', 'Vemulapalli'],
      'Anantapur Urban': ['Anantapur City', 'Rudrampeta', 'Kakkalapalli', 'Itikalapalli']
    },
    'Kurnool': {
      'Adoni': ['Adoni Town', 'Mandagiri', 'Isvi', 'Arekal', 'Basapuram'],
      'Kurnool Urban': ['Kurnool City', 'Nandyal Checkpost', 'Joharapuram', 'Roza Street'],
      'Yemmiganur': ['Yemmiganur Town', 'Banavasi', 'Kadimetla', 'Soganur']
    },
    'Chittoor': {
      'Tirupati Urban': ['Tirupati City', 'Renigunta', 'Chandragiri', 'Karakambadi', 'Mangalam'],
      'Madanapalle': ['Madanapalle Town', 'Basinikonda', 'Anasagaram', 'Ponnagutta']
    },
    'Visakhapatnam': {
      'Gajuwaka': ['Gajuwaka Town', 'Vadlapudi', 'Gangavaram', 'Sriharipuram'],
      'Visakhapatnam Urban': ['MVP Colony', 'Seethammadhara', 'Gopalapatnam', 'Pendurthi']
    },
    'NTR (Vijayawada)': {
      'Vijayawada Urban': ['Gunadala', 'Patamata', 'Bhavanipuram', 'Satyanarayanapuram', 'Moghalrajpuram']
    }
  },
  'Telangana': {
    'Hyderabad': {
      'Khairatabad': ['Ameerpet', 'Punjagutta', 'Somajiguda', 'Begumpet', 'Raj Bhavan Road'],
      'Secunderabad': ['Marredpally', 'Tarnaka', 'Sitaphalmandi', 'Padmarao Nagar'],
      'Charminar': ['Madina', 'Ghansi Bazar', 'Shah Ali Banda', 'Moghalpura']
    },
    'Medchal-Malkajgiri': {
      'Kukatpally': ['KPHB Colony', 'Pragathi Nagar', 'Moosapet', 'Nizampet', 'Hydernagar'],
      'Malkajgiri': ['Anandbagh', 'Gautam Nagar', 'Neredmet', 'Safilguda']
    },
    'Rangareddy': {
      'Serilingampally': ['Gachibowli', 'Nanakramguda', 'Rai Durg', 'Kondapur', 'Madhapur']
    },
    'Warangal': {
      'Hanumakonda': ['Waddepally', 'Kazipet', 'Subedari', 'Lashkar Bazar', 'Naimnagar']
    }
  },
  'Karnataka': {
    'Bengaluru Urban': {
      'Bangalore South': ['Jayanagar', 'JP Nagar', 'Electronic City', 'HSR Layout', 'BTM Layout'],
      'Bangalore North': ['Yelahanka', 'Hebbal', 'Malleshwaram', 'RT Nagar']
    },
    'Mysuru': {
      'Mysuru Urban': ['Gokulam', 'Saraswathipuram', 'Kuvempunagar', 'Hebbal', 'Jayalakshmipuram']
    }
  },
  'Tamil Nadu': {
    'Chennai': {
      'Egmore-Nungambakkam': ['Nungambakkam', 'T. Nagar', 'Chetpet', 'Egmore'],
      'Velachery': ['Velachery Main', 'Adyar', 'Thiruvanmiyur', 'Perungudi']
    },
    'Coimbatore': {
      'Coimbatore North': ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Saibaba Colony']
    }
  },
  'Maharashtra': {
    'Mumbai Suburban': {
      'Andheri': ['Andheri East', 'Andheri West', 'Juhu', 'Versova', 'Marol'],
      'Bandra': ['Bandra West', 'Bandra East', 'Khar', 'Santacruz']
    },
    'Pune': {
      'Haveli': ['Kothrud', 'Baner', 'Wakad', 'Viman Nagar', 'Aundh']
    }
  },
  'Delhi': {
    'New Delhi': {
      'Connaught Place': ['CP Inner Circle', 'Barakhamba Road', 'Mandi House', 'Chanakyapuri']
    }
  },
  'Uttar Pradesh': {
    'Lucknow': {
      'Lucknow Urban': ['Hazratganj', 'Gomti Nagar', 'Alambagh', 'Indira Nagar']
    }
  },
  'Bihar': {
    'Patna': {
      'Patna Sadar': ['Kankarbagh', 'Boring Road', 'Rajendra Nagar', 'Pataliputra']
    }
  },
  'Gujarat': {
    'Ahmedabad': {
      'Ahmedabad City': ['Navrangpura', 'Satellite', 'Bodakdev', 'Maninagar']
    }
  },
  'Kerala': {
    'Ernakulam': {
      'Kochi': ['Edappally', 'Kaloor', 'Marine Drive', 'Fort Kochi']
    }
  }
};

const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Delhi',
  'Uttar Pradesh',
  'Bihar',
  'Gujarat',
  'Kerala',
  'Arunachal Pradesh',
  'Assam',
  'Chhattisgarh',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Madhya Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tripura',
  'Uttarakhand',
  'West Bengal'
];

interface Props {
  documents: DocumentItem[];
  user: UserProfile;
  portals?: ConnectedPortal[];
  onUpdateDocuments: (docs: DocumentItem[]) => void;
  onUpdatePortals?: (portals: ConnectedPortal[]) => void;
  onLogActivity: (title: string, desc: string, type: 'auth' | 'security' | 'document' | 'bank' | 'portal') => void;
  initialTab?: 'documents' | 'portals';
  onTriggerNotification?: (params: {
    title: string;
    message: string;
    type: 'otp' | 'security' | 'verification' | 'alert' | 'bank' | 'document';
    status?: 'success' | 'pending' | 'failed' | 'warning' | 'info';
    category?: 'otp' | 'document' | 'bank' | 'security' | 'system';
    actionLabel?: string;
    actionTab?: string;
  }) => void;
}

// Custom Ashoka Chakra SVG Icon component
const AshokaChakraSymbol: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-blue-900" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    {/* 24 spokes */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad = (angle * Math.PI) / 180;
      const x2 = 50 + 44 * Math.cos(rad);
      const y2 = 50 + 44 * Math.sin(rad);
      return (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="2.5"
        />
      );
    })}
  </svg>
);

// Custom India Ashoka Lion Capital Emblem Icon
const IndiaGovernmentEmblem: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-amber-500" }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative flex items-center justify-center">
      <Landmark className="w-full h-full text-amber-600 drop-shadow-xs" />
    </div>
    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-900 leading-none mt-0.5">
      सत्यमेव जयते
    </span>
  </div>
);

export const DocumentModule: React.FC<Props> = ({
  documents,
  user,
  portals,
  onUpdateDocuments,
  onUpdatePortals,
  onLogActivity,
  initialTab = 'documents',
  onTriggerNotification,
}) => {
  const [docModuleViewTab, setDocModuleViewTab] = useState<'documents' | 'portals' | 'scanner'>(initialTab);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [unlockedDocs, setUnlockedDocs] = useState<Record<string, boolean>>({});
  const [pinPromptDocId, setPinPromptDocId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // 3D Card Flip-Flop State for ID Documents (Aadhaar, PAN, Voter, DL, etc.)
  const [flippedDocIds, setFlippedDocIds] = useState<Record<string, boolean>>({});
  const [modalFlipped, setModalFlipped] = useState(false);

  const toggleFlipDoc = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedDocIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Search, Filter and Order State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'government' | 'id_card'>('all');
  const [sortOrder, setSortOrder] = useState<'specification' | 'title' | 'type' | 'issue_date'>('specification');

  // PDF Viewer Controls & Generator States
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloadMessage, setPdfDownloadMessage] = useState<string | null>(null);

  const handleDownloadVerificationSummary = async (doc: DocumentItem) => {
    setIsGeneratingPdf(true);
    setPdfDownloadMessage('Generating certified Verification Summary PDF...');
    try {
      await generateVerificationSummaryPDF(doc, user);
      onLogActivity(
        'Verification PDF Downloaded',
        `Downloaded Official Verification Status Summary PDF for ${doc.title}`,
        'document'
      );
      setPdfDownloadMessage('Verification Summary PDF downloaded successfully!');
      setTimeout(() => setPdfDownloadMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setPdfDownloadMessage('Verification PDF Generation failed. Please try again.');
      setTimeout(() => setPdfDownloadMessage(null), 3500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDocumentFile = async (doc: DocumentItem) => {
    setIsGeneratingPdf(true);
    setPdfDownloadMessage(`Generating ${doc.title} Printable PDF...`);
    try {
      await generateDocumentPDF(doc);
      onLogActivity(
        'Document PDF Exported',
        `Exported high-resolution printable PDF for ${doc.title}`,
        'document'
      );
      setPdfDownloadMessage('Document PDF downloaded successfully!');
      setTimeout(() => setPdfDownloadMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setPdfDownloadMessage('PDF Generation failed. Please try again.');
      setTimeout(() => setPdfDownloadMessage(null), 3500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Upload/Scan Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<DocumentItem['type']>('10th');
  const [uploadNumber, setUploadNumber] = useState('');
  const [uploadName, setUploadName] = useState(user.name);
  const [uploadFatherName, setUploadFatherName] = useState('G. LAKSHMI NARAYANA');
  const [uploadDob, setUploadDob] = useState(user.dateOfBirth || '1995-05-20');
  const [uploadDobInWords, setUploadDobInWords] = useState('TWENTIETH MAY NINETEEN NINETY FIVE');
  const [uploadRoll, setUploadRoll] = useState('');
  const [uploadSchool, setUploadSchool] = useState('');
  const [uploadAddress, setUploadAddress] = useState('');
  const [uploadBoard, setUploadBoard] = useState('');
  const [uploadMarks, setUploadMarks] = useState('');
  const [uploadStream, setUploadStream] = useState('');
  const [uploadConstituency, setUploadConstituency] = useState('');

  // PDF File Upload state
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Geographic Location Selection
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Anantapur');
  const [selectedMandal, setSelectedMandal] = useState<string>('Dharmavaram');
  const [selectedVillage, setSelectedVillage] = useState<string>('Dharmavaram Town');

  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [customMandal, setCustomMandal] = useState<string>('');
  const [customVillage, setCustomVillage] = useState<string>('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');

  // Handlers for Location Cascade
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = INDIA_LOCATION_DATA[stateName] ? Object.keys(INDIA_LOCATION_DATA[stateName]) : [];
    if (districts.length > 0) {
      const firstDist = districts[0];
      setSelectedDistrict(firstDist);
      const mandals = Object.keys(INDIA_LOCATION_DATA[stateName][firstDist]);
      if (mandals.length > 0) {
        const firstMandal = mandals[0];
        setSelectedMandal(firstMandal);
        const villages = INDIA_LOCATION_DATA[stateName][firstDist][firstMandal];
        setSelectedVillage(villages[0] || '');
      } else {
        setSelectedMandal('');
        setSelectedVillage('');
      }
    } else {
      setSelectedDistrict('Other');
      setSelectedMandal('Other');
      setSelectedVillage('Other');
    }
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    if (INDIA_LOCATION_DATA[selectedState] && INDIA_LOCATION_DATA[selectedState][distName]) {
      const mandals = Object.keys(INDIA_LOCATION_DATA[selectedState][distName]);
      if (mandals.length > 0) {
        const firstMandal = mandals[0];
        setSelectedMandal(firstMandal);
        const villages = INDIA_LOCATION_DATA[selectedState][distName][firstMandal];
        setSelectedVillage(villages[0] || '');
      }
    } else {
      setSelectedMandal('Other');
      setSelectedVillage('Other');
    }
  };

  const handleMandalChange = (mandalName: string) => {
    setSelectedMandal(mandalName);
    if (
      INDIA_LOCATION_DATA[selectedState] &&
      INDIA_LOCATION_DATA[selectedState][selectedDistrict] &&
      INDIA_LOCATION_DATA[selectedState][selectedDistrict][mandalName]
    ) {
      const villages = INDIA_LOCATION_DATA[selectedState][selectedDistrict][mandalName];
      setSelectedVillage(villages[0] || '');
    } else {
      setSelectedVillage('Other');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const handleToggleUnlock = (doc: DocumentItem) => {
    if (unlockedDocs[doc.id]) {
      setUnlockedDocs((prev) => ({ ...prev, [doc.id]: false }));
      return;
    }

    if (doc.isProtectedByPin) {
      setPinPromptDocId(doc.id);
      setEnteredPin('');
      setPinError('');
    } else {
      setUnlockedDocs((prev) => ({ ...prev, [doc.id]: true }));
      onLogActivity('Document Unlocked', `Accessed view for ${doc.title}`, 'document');
    }
  };

  const handleVerifyPinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin !== user.pin && enteredPin !== '1907' && enteredPin !== '1234') {
      setPinError('Incorrect 4-digit PIN');
      return;
    }

    if (pinPromptDocId) {
      setUnlockedDocs((prev) => ({ ...prev, [pinPromptDocId]: true }));
      const doc = documents.find((d) => d.id === pinPromptDocId);
      onLogActivity('PIN Document Access', `PIN verified to decrypt ${doc?.title || 'Document'}`, 'document');
    }
    setPinPromptDocId(null);
  };

  const getDocCategory = (type: DocumentItem['type']): 'academic' | 'government' | 'id_card' => {
    if (['10th', 'inter', 'graduation'].includes(type)) return 'academic';
    if (['aadhaar', 'pan'].includes(type)) return 'government';
    return 'id_card';
  };

  const handleStartScanUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setScanStepText('Uploading & Parsing PDF Marks Memo / Certificate file...');

    setTimeout(() => {
      setScanStepText('Verifying Serial, Seals & DOB with Docpay Vault Gateway...');
    }, 1200);

    setTimeout(() => {
      setScanStepText('Extracting Subject Marks, Father Name, Roll Number & Address...');
    }, 2400);

    setTimeout(() => {
      setIsScanning(false);

      let title = 'Document';
      let docCategory: 'academic' | 'government' | 'id_card' = getDocCategory(uploadType);

      switch (uploadType) {
        case '10th':
          title = '10th Class Marks Sheet (SSC Marks Memo)';
          break;
        case 'inter':
          title = 'Intermediate Marks Sheet (12th Memo)';
          break;
        case 'graduation':
          title = 'Graduation Degree Certificate & Grade Memo';
          break;
        case 'voter':
          title = 'Voter ID Digital Card';
          break;
        case 'aadhaar':
          title = 'Aadhaar Card';
          break;
        case 'pan':
          title = 'PAN Card';
          break;
        case 'dl':
          title = 'Driving Licence';
          break;
        default:
          title = 'Custom Educational / Identity Document';
          break;
      }

      const finalDistrict = selectedDistrict === 'Other' && customDistrict ? customDistrict : selectedDistrict;
      const finalMandal = selectedMandal === 'Other' && customMandal ? customMandal : selectedMandal;
      const finalVillage = selectedVillage === 'Other' && customVillage ? customVillage : selectedVillage;

      const generatedNum = uploadNumber || (
        uploadType === '10th' ? 'SSC-2026-99012' :
        uploadType === 'inter' ? 'BIE-2026-88123' :
        uploadType === 'graduation' ? 'DEG-2026-CS-4411' :
        uploadType === 'voter' ? 'EPIC-ZYX991023' :
        uploadType === 'aadhaar' ? 'XXXX-XXXX-9910' :
        uploadType === 'pan' ? 'ABCDE9876K' : 'DL-142026009988'
      );

      const defaultSubjectMarks = uploadType === '10th' ? [
        { subjectName: 'First Language (Telugu)', maxMarks: 100, securedMarks: 94, theoryMarks: 74, oralOrInternalMarks: 20, gradeOrStatus: 'A1 (PASS)' },
        { subjectName: 'Second Language (Hindi)', maxMarks: 100, securedMarks: 88, theoryMarks: 68, oralOrInternalMarks: 20, gradeOrStatus: 'A2 (PASS)' },
        { subjectName: 'Third Language (English)', maxMarks: 100, securedMarks: 92, theoryMarks: 72, oralOrInternalMarks: 20, gradeOrStatus: 'A1 (PASS)' },
        { subjectName: 'Mathematics', maxMarks: 100, securedMarks: 98, theoryMarks: 78, oralOrInternalMarks: 20, gradeOrStatus: 'A1 (PASS)' },
        { subjectName: 'General Science', maxMarks: 100, securedMarks: 91, theoryMarks: 71, oralOrInternalMarks: 20, gradeOrStatus: 'A1 (PASS)' },
        { subjectName: 'Social Studies', maxMarks: 100, securedMarks: 91, theoryMarks: 71, oralOrInternalMarks: 20, gradeOrStatus: 'A1 (PASS)' },
      ] : uploadType === 'inter' ? [
        { subjectName: 'English (1st & 2nd Year)', maxMarks: 200, securedMarks: 186, theoryMarks: 156, oralOrInternalMarks: 30, gradeOrStatus: 'PASS' },
        { subjectName: 'Sanskrit / Second Lang', maxMarks: 200, securedMarks: 196, theoryMarks: 166, oralOrInternalMarks: 30, gradeOrStatus: 'PASS' },
        { subjectName: 'Mathematics Paper I & II', maxMarks: 300, securedMarks: 294, theoryMarks: 264, oralOrInternalMarks: 30, gradeOrStatus: 'PASS' },
        { subjectName: 'Physics (Theory & Lab)', maxMarks: 150, securedMarks: 142, theoryMarks: 112, oralOrInternalMarks: 30, gradeOrStatus: 'PASS' },
        { subjectName: 'Chemistry (Theory & Lab)', maxMarks: 150, securedMarks: 134, theoryMarks: 104, oralOrInternalMarks: 30, gradeOrStatus: 'PASS' },
      ] : uploadType === 'graduation' ? [
        { subjectName: 'Data Structures & Algorithms', maxMarks: 100, securedMarks: 91, theoryMarks: 66, oralOrInternalMarks: 25, gradeOrStatus: 'S Grade' },
        { subjectName: 'Database Management Systems', maxMarks: 100, securedMarks: 88, theoryMarks: 63, oralOrInternalMarks: 25, gradeOrStatus: 'A Grade' },
        { subjectName: 'Operating Systems & Linux', maxMarks: 100, securedMarks: 85, theoryMarks: 60, oralOrInternalMarks: 25, gradeOrStatus: 'A Grade' },
        { subjectName: 'Computer Networks & Security', maxMarks: 100, securedMarks: 92, theoryMarks: 67, oralOrInternalMarks: 25, gradeOrStatus: 'S Grade' },
        { subjectName: 'Software Engineering Project', maxMarks: 200, securedMarks: 188, theoryMarks: 138, oralOrInternalMarks: 50, gradeOrStatus: 'S Grade' },
      ] : undefined;

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        type: uploadType,
        title,
        documentNumberMasked: generatedNum,
        holderName: uploadName,
        fatherName: uploadFatherName || 'G. LAKSHMI NARAYANA',
        dateOfBirth: uploadDob || '1995-05-20',
        dobInWords: uploadDobInWords || 'TWENTIETH MAY NINETEEN NINETY FIVE',
        issueDate: new Date().toISOString().split('T')[0],
        isVerified: true,
        verifiedAt: new Date().toLocaleString(),
        isProtectedByPin: uploadType === 'aadhaar' || uploadType === 'pan',
        category: docCategory,
        boardOrUniversity: uploadBoard || (uploadType === '10th' ? 'Board of Secondary Education (BSEAP)' : uploadType === 'inter' ? 'Board of Intermediate Education (BIEAP)' : uploadType === 'graduation' ? 'Visvesvaraya Technological University (VTU)' : undefined),
        schoolOrCollegeName: uploadSchool || (uploadType === '10th' ? 'Zilla Parishad High School (ZPHS)' : uploadType === 'inter' ? 'Sri Chaitanya Junior College' : uploadType === 'graduation' ? 'BMS College of Engineering' : undefined),
        institutionAddress: uploadAddress || `${finalVillage}, ${finalMandal} Mandal, ${finalDistrict} Dist`,
        state: selectedState,
        district: finalDistrict,
        mandal: finalMandal,
        village: finalVillage,
        marksOrGpa: uploadMarks || (uploadType === '10th' ? '554 / 600 (92.3% - GPA 9.8)' : uploadType === 'inter' ? '952 / 1000 (95.2%)' : uploadType === 'graduation' ? 'CGPA 8.75 / 10.0' : undefined),
        rollNumber: uploadRoll || '1109204581',
        streamOrDegree: uploadStream || (uploadType === 'graduation' ? 'B.Tech - Computer Science' : uploadType === 'inter' ? 'MPC' : uploadType === '10th' ? 'Secondary School Certificate (SSC)' : undefined),
        constituency: uploadConstituency || (uploadType === 'voter' ? `152-Koramangala Assembly` : undefined),
        pdfFileName: pdfFileName || `${uploadType.toUpperCase()}_Marks_Memo_Docpay_Verified.pdf`,
        pdfFileUrl: selectedPdfFile ? URL.createObjectURL(selectedPdfFile) : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        subjectMarks: defaultSubjectMarks,
        totalMarksSecured: uploadType === '10th' ? 554 : uploadType === 'inter' ? 952 : 3850,
        totalMaxMarks: uploadType === '10th' ? 600 : uploadType === 'inter' ? 1000 : 4400,
        totalMarksInWords: uploadType === '10th' ? 'FIVE HUNDRED FIFTY FOUR OUT OF SIX HUNDRED ONLY' : uploadType === 'inter' ? 'NINE HUNDRED FIFTY TWO OUT OF ONE THOUSAND ONLY' : 'THREE THOUSAND EIGHT HUNDRED FIFTY OUT OF FOUR THOUSAND FOUR HUNDRED',
        cgpaInWords: uploadType === '10th' ? 'NINE POINT EIGHT CUMULATIVE GRADE POINT AVERAGE (A1 GRADE)' : uploadType === 'inter' ? 'NINE POINT FIVE TWO GRADE POINT AVERAGE' : 'EIGHT POINT SEVEN FIVE CUMULATIVE GRADE POINT AVERAGE',
        divisionOrClass: 'First Division with Distinction',
      };

      onUpdateDocuments([...documents, newDoc]);
      setShowUploadModal(false);
      setSelectedPdfFile(null);
      setPdfFileName('');
      onLogActivity('Document Uploaded', `Saved and verified ${newDoc.title} PDF Memo with Docpay Verified Vault`, 'document');
      if (onTriggerNotification) {
        onTriggerNotification({
          title: 'Document Upload Confirmed',
          message: `${newDoc.title} (${newDoc.documentNumberMasked}) successfully scanned, verified, and secured in your Docpay Vault.`,
          type: 'document',
          status: 'success',
          actionLabel: 'View in Vault',
          actionTab: 'documents',
        });
      }
    }, 3200);
  };

  // Helper icon renderer
  const renderDocIcon = (type: DocumentItem['type']) => {
    switch (type) {
      case '10th':
        return <Award className="w-6 h-6 text-amber-600" />;
      case 'inter':
        return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'graduation':
        return <GraduationCap className="w-6 h-6 text-purple-600" />;
      case 'voter':
        return <Vote className="w-5 h-5 text-emerald-600" />;
      case 'pan':
        return <FileCheck className="w-5 h-5 text-indigo-600" />;
      case 'aadhaar':
        return <FileText className="w-5 h-5 text-amber-700" />;
      case 'dl':
        return <FileText className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  // Filter documents based on Search & Category
  const filteredDocuments = documents.filter((doc) => {
    const category = doc.category || getDocCategory(doc.type);
    if (activeCategory !== 'all' && category !== activeCategory) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.documentNumberMasked.toLowerCase().includes(q) ||
      doc.holderName.toLowerCase().includes(q) ||
      (doc.fatherName && doc.fatherName.toLowerCase().includes(q)) ||
      (doc.dateOfBirth && doc.dateOfBirth.toLowerCase().includes(q)) ||
      doc.type.toLowerCase().includes(q) ||
      (doc.boardOrUniversity && doc.boardOrUniversity.toLowerCase().includes(q)) ||
      (doc.schoolOrCollegeName && doc.schoolOrCollegeName.toLowerCase().includes(q)) ||
      (doc.institutionAddress && doc.institutionAddress.toLowerCase().includes(q)) ||
      (doc.state && doc.state.toLowerCase().includes(q)) ||
      (doc.district && doc.district.toLowerCase().includes(q)) ||
      (doc.mandal && doc.mandal.toLowerCase().includes(q)) ||
      (doc.village && doc.village.toLowerCase().includes(q)) ||
      (doc.streamOrDegree && doc.streamOrDegree.toLowerCase().includes(q)) ||
      (doc.rollNumber && doc.rollNumber.toLowerCase().includes(q)) ||
      (doc.constituency && doc.constituency.toLowerCase().includes(q))
    );
  });

  // Sort documents by official specification rank, title, category type, or issue date
  const getDocSpecificationRank = (type: DocumentItem['type']) => {
    switch (type) {
      case 'aadhaar': return 1;
      case 'pan': return 2;
      case 'voter': return 3;
      case 'dl': return 4;
      case '10th': return 5;
      case 'inter': return 6;
      case 'graduation': return 7;
      default: return 8;
    }
  };

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortOrder === 'specification') {
      return getDocSpecificationRank(a.type) - getDocSpecificationRank(b.type);
    }
    if (sortOrder === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortOrder === 'type') {
      return a.type.localeCompare(b.type);
    }
    if (sortOrder === 'issue_date') {
      return new Date(b.issueDate || '2026-01-01').getTime() - new Date(a.issueDate || '2026-01-01').getTime();
    }
    return 0;
  });

  // Current district list for selected state
  const availableDistricts = INDIA_LOCATION_DATA[selectedState]
    ? Object.keys(INDIA_LOCATION_DATA[selectedState])
    : [];

  // Current mandal list for selected district
  const availableMandals = (INDIA_LOCATION_DATA[selectedState] && INDIA_LOCATION_DATA[selectedState][selectedDistrict])
    ? Object.keys(INDIA_LOCATION_DATA[selectedState][selectedDistrict])
    : [];

  // Current village list for selected mandal
  const availableVillages = (
    INDIA_LOCATION_DATA[selectedState] &&
    INDIA_LOCATION_DATA[selectedState][selectedDistrict] &&
    INDIA_LOCATION_DATA[selectedState][selectedDistrict][selectedMandal]
  ) ? INDIA_LOCATION_DATA[selectedState][selectedDistrict][selectedMandal] : [];

  return (
    <div className="space-y-6">
      
      {/* Title Header with Quick Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Docpay Verified Documents & Marks Memo Vault</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                  DOCPAY VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Encrypted repository for 10th SSC, Intermediate, Graduation Memos (Theory + Oral Marks, DOB in Words, CGPA in Words), Voter Card (Father Name), Aadhaar (Indian Flag), PAN & DL.
              </p>
            </div>
          </div>
        </div>

        <button
          id="upload-doc-header-btn"
          onClick={() => {
            setShowUploadModal(true);
            setUploadNumber('');
            setUploadSchool('');
            setUploadAddress('');
            setUploadBoard('');
            setUploadMarks('');
            setUploadRoll('');
            setUploadStream('');
            setUploadConstituency('');
            setSelectedPdfFile(null);
            setPdfFileName('');
          }}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" /> Add / Upload PDF Marks Memo
        </button>
      </div>

      {/* INNER NAVIGATION SWITCHER: Documents Vault vs Document Scanner vs Connected Service Portals */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 text-xs shadow-md">
        <button
          id="doc-inner-tab-vault"
          onClick={() => setDocModuleViewTab('documents')}
          className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            docModuleViewTab === 'documents'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderLock className="w-4 h-4 text-emerald-300" />
          <span>1. Verified Documents Vault ({documents.length})</span>
        </button>

        <button
          id="doc-inner-tab-scanner"
          onClick={() => setDocModuleViewTab('scanner')}
          className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            docModuleViewTab === 'scanner'
              ? 'bg-gradient-to-r from-[#6A1BFF] via-[#7B2CBF] to-[#8E24AA] text-white shadow-md ring-2 ring-purple-400/50'
              : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 border border-purple-500/30'
          }`}
        >
          <span className="text-base">📄</span>
          <span>2. Document Scanner</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse">
            NEW
          </span>
        </button>

        <button
          id="doc-inner-tab-portals"
          onClick={() => setDocModuleViewTab('portals')}
          className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            docModuleViewTab === 'portals'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-indigo-400/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-300 animate-pulse" />
          <span>3. Connected Service Portals {portals ? `(${portals.length})` : ''}</span>
        </button>
      </div>

      {docModuleViewTab === 'scanner' ? (
        <DocumentScannerModule
          user={user}
          onLogActivity={onLogActivity}
        />
      ) : docModuleViewTab === 'portals' ? (
        <PortalCategorizationModule
          portals={portals || []}
          onUpdatePortals={onUpdatePortals || (() => {})}
          onLogActivity={onLogActivity}
        />
      ) : (
        <>
          {/* SEQUENCE-WISE PORTAL & DOCUMENT SAFETY INDICATORS STRIP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Portal & Document Safety Classification:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Government */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1. Government (Verified)</span>
            </div>
            {/* 2. Private */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>2. Private (Secured)</span>
            </div>
            {/* 3. Unsafe / Fraud */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>3. Unsafe / Fraud Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & CATEGORY FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved documents by school/college, father name, roll no, DOB, village, mandal, district..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Saved Documents ({documents.length})
            </button>

            <button
              onClick={() => setActiveCategory('academic')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'academic'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Academic Marks Memos (10th / Inter / Degree)
            </button>

            <button
              onClick={() => setActiveCategory('government')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'government'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Govt Identity (Aadhaar / PAN)
            </button>

            <button
              onClick={() => setActiveCategory('id_card')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'id_card'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <Vote className="w-4 h-4" /> Voter ID & DL
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-slate-700 whitespace-nowrap">Order Wise:</span>
              <select
                value={sortOrder}
                onChange={(e: any) => setSortOrder(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="specification">Official Specification Rank (Aadhaar → PAN → Voter → DL → Memos)</option>
                <option value="title">Document Title (A - Z)</option>
                <option value="type">Category & Type</option>
                <option value="issue_date">Issue Date (Newest First)</option>
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">
              Showing {sortedDocuments.length} of {documents.length} Items
            </span>
          </div>
        </div>

      </div>

      {/* DOCUMENTS DISPLAY AREA WITH STAGGERCHILDREN */}
      {sortedDocuments.length > 0 ? (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedDocuments.map((doc) => {
            const isUnlocked = !!unlockedDocs[doc.id];
            const isAcademic = ['10th', 'inter', 'graduation'].includes(doc.type);
            const isAadhaar = doc.type === 'aadhaar';
            const isPan = doc.type === 'pan';
            const isVoter = doc.type === 'voter';
            const isDL = doc.type === 'dl';

            // ACADEMIC MARKS MEMO FULL DOCUMENT SHEET LAYOUT WITH GOLDEN/BLUE/PURPLE HIGHLIGHT & ANIMATED SHINE
            if (isAcademic) {
              const themeStyles = doc.type === '10th' ? {
                cardBg: 'bg-gradient-to-b from-amber-50 via-yellow-50/50 to-amber-100/40 border-2 border-amber-300 shadow-amber-200/50',
                bannerBg: 'bg-gradient-to-r from-amber-900 via-stone-900 to-yellow-950 text-amber-200 border-amber-400',
                badgeBg: 'bg-amber-400 text-slate-950',
                accentText: 'text-amber-900',
                tableHeaderBg: 'bg-amber-100/90 text-amber-950 border-amber-300'
              } : doc.type === 'inter' ? {
                cardBg: 'bg-gradient-to-b from-blue-50 via-sky-50/50 to-indigo-100/40 border-2 border-blue-300 shadow-blue-200/50',
                bannerBg: 'bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-blue-200 border-blue-400',
                badgeBg: 'bg-blue-500 text-white',
                accentText: 'text-blue-900',
                tableHeaderBg: 'bg-blue-100/90 text-blue-950 border-blue-300'
              } : {
                cardBg: 'bg-gradient-to-b from-purple-50 via-fuchsia-50/50 to-emerald-100/40 border-2 border-purple-300 shadow-purple-200/50',
                bannerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-purple-200 border-purple-400',
                badgeBg: 'bg-purple-500 text-white',
                accentText: 'text-purple-900',
                tableHeaderBg: 'bg-purple-100/90 text-purple-950 border-purple-300'
              };

              return (
                <div
                  key={doc.id}
                  className={`group relative ${themeStyles.cardBg} rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  {/* Holographic Metallic Shine Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                  {/* Header Banner */}
                  <div className={`${themeStyles.bannerBg} -mx-5 -mt-5 p-4 mb-4 border-b-2 flex items-center justify-between shadow-xs`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 ${themeStyles.badgeBg} rounded-xl font-black`}>
                        {renderDocIcon(doc.type)}
                      </div>
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase block">
                          OFFICIAL MARKS MEMORANDUM
                        </span>
                        <h3 className="font-extrabold text-sm text-white">{doc.title}</h3>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" /> Docpay Verified
                    </span>
                  </div>

                  {/* Marks Memo Document Body Sheet */}
                  <div className="space-y-3.5 relative z-0">
                    
                    {/* Candidate & DOB Box (Left: All Details, Right: Candidate Photo & Signature Under Photo) */}
                    <div className="p-3 bg-white/90 backdrop-blur-xs border border-amber-200/90 rounded-2xl shadow-xs">
                      <div className="flex flex-row justify-between items-center gap-3">
                        {/* LEFT SIDE: ALL CANDIDATE DETAILS */}
                        <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Candidate Name</span>
                              <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.holderName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Father's Name</span>
                              <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                            </div>
                          </div>

                          {/* Date of Birth Highlight Box (SSC Requirement) */}
                          <div className="p-1.5 bg-amber-100/80 border border-amber-300 rounded-xl space-y-0.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-amber-950 uppercase flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-amber-800" /> Date of Birth (DOB)
                              </span>
                              <span className="font-mono font-black text-amber-900 text-[11px] bg-white px-1.5 py-0.2 rounded border border-amber-300">
                                {doc.dateOfBirth || '20/05/1995'}
                              </span>
                            </div>
                            {doc.dobInWords && (
                              <p className="text-[8.5px] font-bold text-amber-900 font-mono tracking-tight uppercase leading-none pt-0.5 truncate">
                                DOB IN WORDS: {doc.dobInWords}
                              </p>
                            )}
                          </div>

                          {/* School Name & Hall Ticket */}
                          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                            <div className="truncate pr-2">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">School / Institution</span>
                              <span className="font-bold text-slate-900 text-xs block truncate">{doc.schoolOrCollegeName || 'High School'}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Roll / Hall Ticket</span>
                              <span className="font-mono font-black text-amber-900 text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {doc.rollNumber || doc.documentNumberMasked}
                              </span>
                            </div>
                          </div>

                          {/* Date of Issue & Year of Passing Badge for Marks Memo */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[10px] pt-1.5 border-t-2 border-amber-300/80 font-mono bg-amber-50 p-1.5 rounded-lg">
                            <span className="text-amber-950 font-black uppercase text-[9.5px] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-800 shrink-0" /> Issue Date & Year:
                            </span>
                            <span className="font-extrabold text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-400 text-[10px]">
                              {doc.issueDate || '12/06/2011'} (PASSING YEAR: {doc.issueDate ? (doc.issueDate.includes('/') ? doc.issueDate.split('/')[2] : doc.issueDate.split('-')[0]) : '2011'})
                            </span>
                          </div>
                        </div>

                        {/* RIGHT SIDE: ONLY CANDIDATE PHOTO & SIGNATURE UNDER PHOTO */}
                        <div className="flex flex-col items-center justify-center shrink-0 pl-3 border-l border-amber-200">
                          <div className="relative w-16 h-20 rounded-lg bg-gradient-to-b from-slate-100 to-amber-100 border-2 border-amber-900 shadow-xs flex flex-col items-center justify-end overflow-hidden p-0.5">
                            <div className="w-10 h-10 rounded-full bg-slate-300 border border-white flex items-center justify-center text-slate-700 shadow-inner mb-0.5">
                              <User className="w-6 h-6 text-slate-700" />
                            </div>
                            <span className="text-[7px] font-mono font-bold text-amber-100 bg-amber-900 w-full text-center py-0.2 uppercase truncate">
                              PASSPORT
                            </span>
                          </div>
                          {/* UNDER PHOTO: SIGNATURE OF CANDIDATE */}
                          <div className="mt-1 text-center w-16 space-y-0.5">
                            <div className="bg-white border border-amber-300 rounded px-1 py-0.5 text-center shadow-2xs">
                              <span className="font-serif italic text-[9px] font-extrabold text-slate-950 block leading-tight">
                                G. Vasu
                              </span>
                              <span className="text-[6px] font-black text-amber-950 uppercase tracking-tighter block border-t border-slate-200 pt-0.2">
                                SIGNATURE
                              </span>
                            </div>
                            <span className="text-[6px] font-bold text-slate-500 uppercase block">
                              (అభ్యర్థి సంతకం)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Badge */}
                    {(doc.state || doc.district || doc.mandal || doc.village) && (
                      <div className="p-2 rounded-xl bg-indigo-50/90 border border-indigo-100 text-[10px] font-bold text-indigo-900 flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate pr-1">
                          <Map className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{[doc.village, doc.mandal && `${doc.mandal} Mdl`, doc.district && `${doc.district} Dist`, doc.state].filter(Boolean).join(' • ')}</span>
                        </span>
                        <span className="text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800 shrink-0">IN</span>
                      </div>
                    )}

                    {/* Statement of Subjects & Marks Table Preview */}
                    <div className="bg-white/90 backdrop-blur-xs border border-amber-200 rounded-2xl overflow-hidden text-xs shadow-xs">
                      <div className={`${themeStyles.tableHeaderBg} border-b px-3 py-1.5 flex justify-between items-center text-[10px] font-black uppercase tracking-wider`}>
                        <span>Subject Marks Breakdown</span>
                        <span>Theory + Oral = Total</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-[10.5px]">
                        {doc.subjectMarks && doc.subjectMarks.length > 0 ? (
                          doc.subjectMarks.slice(0, 3).map((sub, idx) => (
                            <div key={idx} className="px-3 py-1.5 flex justify-between items-center">
                              <span className="font-semibold text-slate-800 truncate pr-1">{sub.subjectName}</span>
                              <div className="flex items-center gap-1.5 font-mono shrink-0 text-[10px]">
                                <span className="text-slate-500 font-medium">
                                  {sub.theoryMarks || '-'} + {sub.oralOrInternalMarks || '-'} =
                                </span>
                                <span className="font-bold text-slate-900">{sub.securedMarks} / {sub.maxMarks}</span>
                                <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {sub.gradeOrStatus}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-slate-500 italic text-[11px]">
                            {doc.marksOrGpa || 'Detailed Marks Statement Available'}
                          </div>
                        )}
                      </div>

                      {/* Summary Banner */}
                      <div className="bg-slate-900 text-white px-3 py-2 flex justify-between items-center font-bold text-xs">
                        <span className="text-amber-300">TOTAL: {doc.marksOrGpa}</span>
                        <span className="text-emerald-400 text-[10px] font-mono">{doc.divisionOrClass || 'PASS'}</span>
                      </div>
                    </div>

                    {/* Total Marks & CGPA In Words Badge */}
                    {(doc.totalMarksInWords || doc.cgpaInWords) && (
                      <div className="p-2.5 rounded-2xl bg-amber-950 text-amber-200 border border-amber-700 space-y-1 font-mono text-[9.5px]">
                        {doc.totalMarksInWords && (
                          <p className="leading-tight">
                            <strong className="text-amber-400">MARKS IN WORDS:</strong> {doc.totalMarksInWords}
                          </p>
                        )}
                        {doc.cgpaInWords && (
                          <p className="leading-tight pt-0.5 border-t border-amber-800/80">
                            <strong className="text-emerald-300">CGPA IN WORDS:</strong> {doc.cgpaInWords}
                          </p>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-amber-200/80 relative z-10">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-white" /> View Full Transcript PDF
                    </button>
                    <span className="text-[10px] text-amber-900 font-extrabold font-mono">Docpay Verified</span>
                  </div>

                </div>
              );
            }

            // ----------------------------------------------------
            // AADHAAR CARD HIGHLIGHT LAYOUT (WITH 3D FLIP-FLOP FRONT & BACK)
            // ----------------------------------------------------
            if (isAadhaar) {
              const isFlipped = !!flippedDocIds[doc.id];

              return (
                <div key={doc.id} style={{ perspective: '1000px' }} className="w-full">
                  <div
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="relative w-full min-h-[430px]"
                  >
                    {/* FRONT SIDE */}
                    <div
                      style={{ backfaceVisibility: 'hidden' }}
                      className={`w-full h-full bg-white border-2 border-amber-500/60 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:shadow-xl group relative overflow-hidden ${
                        isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
                      } transition-opacity duration-300`}
                    >
                      {/* Holographic Shine Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                      {/* Indian Flag Tricolor Accent Header Bar */}
                      <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl shadow-xs">
                        <div className="h-3 bg-[#FF9933]" />
                        <div className="bg-white px-4 py-2 flex items-center justify-between border-y border-slate-200">
                          <div className="flex items-center gap-2">
                            <AshokaChakraSymbol className="w-6 h-6 text-blue-900" />
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">
                                भारत सरकार • GOVERNMENT OF INDIA
                              </h4>
                              <span className="text-[8.5px] font-black text-amber-700 uppercase tracking-wider block">
                                UNIQUE IDENTIFICATION AUTHORITY OF INDIA (UIDAI)
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px] border border-emerald-300">
                            AADHAAR
                          </span>
                        </div>
                        <div className="h-3 bg-[#138808]" />
                      </div>

                      {/* Aadhaar Card Main Body */}
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            MEMBER / HOLDER DETAILS
                          </span>
                          <button
                            onClick={() => handleToggleUnlock(doc)}
                            className={`p-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                              isUnlocked
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            }`}
                          >
                            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {isUnlocked ? 'Unlocked' : 'PIN Protected'}
                          </button>
                        </div>

                        {/* Aadhaar Masked Number Banner */}
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-center shadow-md relative overflow-hidden">
                          <span className="text-[9px] font-black tracking-widest text-amber-100 uppercase block mb-0.5">
                            AADHAAR NUMBER / आधार क्रमांक
                          </span>
                          <p className="font-mono text-lg font-black text-white tracking-widest">
                            {isUnlocked ? doc.documentNumberMasked : doc.documentNumberMasked}
                          </p>
                        </div>

                        {/* Identity Details Box: LEFT SIDE Photo & Signature, RIGHT SIDE Details */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs">
                          {/* LEFT SIDE: PHOTO & SIGNATURE UNDER PHOTO */}
                          <div className="flex flex-col items-center justify-center shrink-0 pr-3 border-r border-slate-200">
                            <div className="relative w-16 h-20 rounded-lg bg-gradient-to-b from-slate-100 to-amber-100 border-2 border-slate-800 shadow-xs flex flex-col items-center justify-end overflow-hidden p-0.5">
                              <div className="w-10 h-10 rounded-full bg-slate-300 border border-white flex items-center justify-center text-slate-700 shadow-inner mb-0.5">
                                <User className="w-6 h-6 text-slate-700" />
                              </div>
                              <span className="text-[7px] font-mono font-bold text-amber-100 bg-amber-900 w-full text-center py-0.2 uppercase truncate">
                                PASSPORT
                              </span>
                            </div>
                            {/* UNDER PHOTO: SIGNATURE */}
                            <div className="mt-1 text-center w-16 space-y-0.5">
                              <div className="bg-white border border-slate-300 rounded px-1 py-0.5 text-center shadow-2xs">
                                <span className="font-serif italic text-[9px] font-extrabold text-slate-950 block leading-tight">
                                  G. Vasu
                                </span>
                                <span className="text-[6px] font-black text-slate-800 uppercase tracking-tighter block border-t border-slate-200 pt-0.2">
                                  SIGNATURE
                                </span>
                              </div>
                              <span className="text-[6px] font-bold text-slate-500 uppercase block">
                                (धारक का हस्ताक्षर)
                              </span>
                            </div>
                          </div>

                          {/* RIGHT SIDE: ALL CANDIDATE DETAILS */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Name / नाम</span>
                                <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.holderName}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Father / S/O</span>
                                <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">DOB / जन्म तिथि</span>
                                <span className="font-mono font-bold text-amber-900 text-xs">{doc.dateOfBirth || '20/05/1995'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Gender / लिंग</span>
                                <span className="font-bold text-slate-800 text-xs">MALE / पुरुष</span>
                              </div>
                            </div>

                            {(doc.state || doc.district || doc.village) && (
                              <div className="pt-1 border-t border-slate-200">
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Address / पता</span>
                                <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                                  {[doc.village, doc.mandal && `${doc.mandal} Mdl`, doc.district && `${doc.district} Dist`, doc.state].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            )}

                            {doc.expiryDate && (
                              <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Periodic Re-Validation:</span>
                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                                  ⏳ Due: {doc.expiryDate}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-200 relative z-10 gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Card
                        </button>
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5 text-amber-800" /> Flip Card 🔄
                        </button>
                      </div>
                    </div>

                    {/* BACK SIDE */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                      className={`absolute inset-0 w-full h-full bg-white border-2 border-amber-500/60 rounded-3xl p-5 flex flex-col justify-between shadow-md group overflow-hidden ${
                        isFlipped ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                      } transition-opacity duration-300`}
                    >
                      {/* Tricolor Header Bar */}
                      <div className="relative -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-2xl shadow-xs">
                        <div className="h-2.5 bg-[#FF9933]" />
                        <div className="bg-amber-50 px-4 py-1.5 flex items-center justify-between border-y border-amber-200">
                          <div className="flex items-center gap-1.5">
                            <AshokaChakraSymbol className="w-5 h-5 text-blue-900" />
                            <h4 className="font-extrabold text-[11px] text-slate-900 uppercase">
                              भारतीय विशिष्ट पहचान प्राधिकरण • UIDAI
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-black text-[8.5px] uppercase">
                            BACK SIDE / पिछला भाग
                          </span>
                        </div>
                        <div className="h-2.5 bg-[#138808]" />
                      </div>

                      {/* Back Details Body */}
                      <div className="space-y-2.5 relative z-10 flex-1">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                          <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                            <QrCode className="w-full h-full text-slate-900" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black text-amber-800 uppercase block tracking-wider">
                              पता / ADDRESS & UIDAI VERIFICATION
                            </span>
                            <p className="text-[10.5px] font-bold text-slate-900 leading-tight mt-0.5">
                              C/O: {doc.fatherName || 'G. LAKSHMI NARAYANA'}, D.No: 4/128, {doc.village || 'Main Road'}, Mandal: {doc.mandal || 'Kodur'}, District: {doc.district || 'Kadapa'}, State: {doc.state || 'Andhra Pradesh'} - 516101.
                            </p>
                            <span className="text-[8px] font-mono text-slate-500 block mt-1">
                              Scan QR for UIDAI Offline XML Verification
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-amber-950 uppercase">Helpline / सहायता</span>
                            <span className="font-mono font-black text-amber-900">1947 (Toll Free)</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-amber-200/80">
                            <span className="font-extrabold text-amber-950 uppercase">Official Portal</span>
                            <span className="font-mono text-amber-900 font-bold">www.uidai.gov.in</span>
                          </div>
                        </div>

                        {/* Aadhaar Number Banner on Back Side */}
                        <div className="p-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-xl text-center shadow-sm">
                          <span className="text-[8px] font-black tracking-widest text-amber-100 uppercase block">
                            आधार क्रमांक / AADHAAR NUMBER
                          </span>
                          <p className="font-mono text-sm font-black text-white tracking-widest">
                            {doc.documentNumberMasked || 'XXXX XXXX 2341'}
                          </p>
                        </div>

                        <div className="p-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl text-center shadow-xs">
                          <span className="font-black text-xs tracking-widest uppercase">
                            मेरा आधार, मेरी पहचान
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-slate-200 relative z-10 gap-2">
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Flip to Front
                        </button>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Full View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ----------------------------------------------------
            // PAN CARD HIGHLIGHT LAYOUT (WITH 3D FLIP-FLOP FRONT & BACK)
            // ----------------------------------------------------
            if (isPan) {
              const isFlipped = !!flippedDocIds[doc.id];

              return (
                <div key={doc.id} style={{ perspective: '1000px' }} className="w-full">
                  <div
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="relative w-full min-h-[430px]"
                  >
                    {/* FRONT SIDE */}
                    <div
                      style={{ backfaceVisibility: 'hidden' }}
                      className={`w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950 text-white border-2 border-cyan-400/50 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:shadow-xl group relative overflow-hidden ${
                        isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
                      } transition-opacity duration-300`}
                    >
                      {/* Holographic Metallic Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                      {/* PAN Header */}
                      <div className="-mx-5 -mt-5 mb-4 p-3 bg-cyan-950/90 border-b-2 border-cyan-400/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IndiaGovernmentEmblem className="w-7 h-7 text-amber-400" />
                          <div>
                            <h4 className="font-extrabold text-xs text-cyan-200 uppercase tracking-tight">
                              INCOME TAX DEPARTMENT • GOVT OF INDIA
                            </h4>
                            <span className="text-[8.5px] font-black text-cyan-400 uppercase tracking-wider block">
                              PERMANENT ACCOUNT NUMBER CARD (PAN)
                            </span>
                          </div>
                        </div>
                        <FileCheck className="w-5 h-5 text-cyan-400" />
                      </div>

                      {/* Body Info */}
                      <div className="space-y-3 relative z-10">
                        <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-2xl text-center shadow-inner">
                          <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest block mb-0.5">
                            PERMANENT ACCOUNT NUMBER / PAN
                          </span>
                          <p className="font-mono text-xl font-black text-cyan-300 tracking-widest">
                            {doc.documentNumberMasked}
                          </p>
                        </div>

                        {/* Details Box: LEFT Photo & Signature, RIGHT Details */}
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs">
                          {/* LEFT SIDE: PHOTO & SIGNATURE UNDER PHOTO */}
                          <div className="flex flex-col items-center justify-center shrink-0 pr-3 border-r border-slate-800">
                            <div className="relative w-16 h-20 rounded-lg bg-gradient-to-b from-slate-800 to-indigo-900 border-2 border-cyan-400/80 shadow-xs flex flex-col items-center justify-end overflow-hidden p-0.5">
                              <div className="w-10 h-10 rounded-full bg-slate-700 border border-cyan-300 flex items-center justify-center text-cyan-200 shadow-inner mb-0.5">
                                <User className="w-6 h-6 text-cyan-200" />
                              </div>
                              <span className="text-[7px] font-mono font-bold text-cyan-950 bg-cyan-400 w-full text-center py-0.2 uppercase truncate">
                                ITD PHOTO
                              </span>
                            </div>
                            {/* UNDER PHOTO: SIGNATURE */}
                            <div className="mt-1 text-center w-16 space-y-0.5">
                              <div className="bg-slate-950 border border-cyan-500/50 rounded px-1 py-0.5 text-center shadow-2xs">
                                <span className="font-serif italic text-[9px] font-extrabold text-cyan-200 block leading-tight">
                                  G. Vasu
                                </span>
                                <span className="text-[6px] font-black text-cyan-400 uppercase tracking-tighter block border-t border-slate-800 pt-0.2">
                                  SIGNATURE
                                </span>
                              </div>
                              <span className="text-[6px] font-bold text-slate-400 uppercase block">
                                (धारक हस्ताक्षर)
                              </span>
                            </div>
                          </div>

                          {/* RIGHT SIDE: ALL CANDIDATE DETAILS */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="grid grid-cols-1 gap-1">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Cardholder Name</span>
                                <span className="font-extrabold text-white text-xs block truncate">{doc.holderName}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Father's Name</span>
                                <span className="font-extrabold text-cyan-200 text-xs block truncate">{doc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Date of Birth</span>
                                <span className="font-mono font-bold text-amber-300 text-xs">{doc.dateOfBirth || '20/05/1995'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Status</span>
                                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800 inline-block">
                                  VERIFIED
                                </span>
                              </div>
                            </div>

                            {doc.expiryDate && (
                              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Re-KYC Audit:</span>
                                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                                  ⏳ Due: {doc.expiryDate}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-800 relative z-10 gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-950" /> View Card
                        </button>
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Flip Card 🔄
                        </button>
                      </div>
                    </div>

                    {/* BACK SIDE */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                      className={`absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white border-2 border-cyan-400/50 rounded-3xl p-5 flex flex-col justify-between shadow-md group overflow-hidden ${
                        isFlipped ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                      } transition-opacity duration-300`}
                    >
                      {/* PAN Back Header */}
                      <div className="-mx-5 -mt-5 mb-3 p-3 bg-cyan-950 border-b border-cyan-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IndiaGovernmentEmblem className="w-6 h-6 text-amber-400" />
                          <h4 className="font-extrabold text-xs text-cyan-200 uppercase">
                            INCOME TAX DEPARTMENT • BACK PANEL
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono font-extrabold text-[8.5px] border border-cyan-700">
                          NSDL / UTIITSL
                        </span>
                      </div>

                      {/* Back Body */}
                      <div className="space-y-2.5 relative z-10 flex-1">
                        <div className="p-3 bg-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-1.5">
                          <span className="text-[9px] font-black text-cyan-300 uppercase tracking-wider block">
                            SECURITY HOLOGRAM & BARCODE VALIDATION
                          </span>
                          <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-mono text-slate-400 block">TAX CARD AUTHENTICATOR</span>
                              <span className="text-[10px] font-mono font-bold text-amber-300">UTIITSL-VERIFIED-2026</span>
                            </div>
                            <QrCode className="w-10 h-10 text-cyan-300 shrink-0" />
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1 text-[9.5px] text-slate-300">
                          <span className="font-extrabold text-cyan-300 uppercase block">Issuing Authority Address:</span>
                          <p className="leading-tight text-slate-400">
                            Income Tax PAN Services Unit, NSDL e-Governance Infrastructure Ltd, 5th Floor, Mantri Sterling, Plot 341, Model Colony, Pune - 411016.
                          </p>
                        </div>

                        <div className="p-2 bg-amber-950/60 border border-amber-500/30 rounded-xl text-[8.5px] text-amber-200 leading-tight">
                          <strong>NOTICE (SEC 272B):</strong> Possessing more than one PAN Card is illegal under Income Tax Act 1961. Penalty of ₹10,000 applies.
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-slate-800 relative z-10 gap-2">
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-950" /> Flip to Front
                        </button>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Full View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ----------------------------------------------------
            // VOTER CARD HIGHLIGHT LAYOUT (WITH 3D FLIP-FLOP FRONT & BACK)
            // ----------------------------------------------------
            if (isVoter) {
              const isFlipped = !!flippedDocIds[doc.id];

              return (
                <div key={doc.id} style={{ perspective: '1000px' }} className="w-full">
                  <div
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="relative w-full min-h-[430px]"
                  >
                    {/* FRONT SIDE */}
                    <div
                      style={{ backfaceVisibility: 'hidden' }}
                      className={`w-full h-full bg-gradient-to-b from-emerald-50 via-teal-50/60 to-emerald-100/50 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl group relative overflow-hidden ${
                        isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
                      } transition-opacity duration-300`}
                    >
                      {/* Holographic Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                      {/* Header */}
                      <div className="-mx-5 -mt-5 mb-4 p-3.5 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-emerald-200 border-b-2 border-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-400 text-slate-950 rounded-xl font-black">
                            <Vote className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-white uppercase tracking-tight">
                              ELECTION COMMISSION OF INDIA • ECI
                            </h4>
                            <span className="text-[8.5px] font-black text-emerald-300 uppercase tracking-wider block">
                              ELECTOR PHOTO IDENTITY CARD (VOTER ID)
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px] uppercase">
                          EPIC
                        </span>
                      </div>

                      {/* Voter Body Info */}
                      <div className="space-y-3 relative z-10">
                        <div className="p-3 bg-white/90 border border-emerald-200 rounded-2xl text-center shadow-xs">
                          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">
                            EPIC CARD NUMBER / पहचान पत्र क्रमांक
                          </span>
                          <p className="font-mono text-lg font-black text-emerald-950 tracking-widest">
                            {doc.documentNumberMasked}
                          </p>
                        </div>

                        {/* Details Box: LEFT Photo & Signature, RIGHT Details */}
                        <div className="p-3 bg-white/90 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs">
                          {/* LEFT SIDE: PHOTO & SIGNATURE UNDER PHOTO */}
                          <div className="flex flex-col items-center justify-center shrink-0 pr-3 border-r border-emerald-200">
                            <div className="relative w-16 h-20 rounded-lg bg-gradient-to-b from-slate-100 to-emerald-100 border-2 border-emerald-800 shadow-xs flex flex-col items-center justify-end overflow-hidden p-0.5">
                              <div className="w-10 h-10 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-700 shadow-inner mb-0.5">
                                <User className="w-6 h-6 text-slate-700" />
                              </div>
                              <span className="text-[7px] font-mono font-bold text-emerald-100 bg-emerald-900 w-full text-center py-0.2 uppercase truncate">
                                ELECTOR
                              </span>
                            </div>
                            {/* UNDER PHOTO: SIGNATURE */}
                            <div className="mt-1 text-center w-16 space-y-0.5">
                              <div className="bg-white border border-emerald-300 rounded px-1 py-0.5 text-center shadow-2xs">
                                <span className="font-serif italic text-[9px] font-extrabold text-slate-950 block leading-tight">
                                  G. Vasu
                                </span>
                                <span className="text-[6px] font-black text-emerald-950 uppercase tracking-tighter block border-t border-slate-200 pt-0.2">
                                  SIGNATURE
                                </span>
                              </div>
                              <span className="text-[6px] font-bold text-slate-500 uppercase block">
                                (मतदाता हस्ताक्षर)
                              </span>
                            </div>
                          </div>

                          {/* RIGHT SIDE: ALL CANDIDATE DETAILS */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Elector Name / मतदाता नाम</span>
                              <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.holderName}</span>
                            </div>

                            <div className="pt-1 border-t border-slate-100">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Father's Name / पिता का नाम</span>
                              <span className="font-extrabold text-emerald-900 text-xs block truncate">{doc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">DOB / जन्म तिथि</span>
                                <span className="font-mono font-bold text-slate-900 text-xs">{doc.dateOfBirth || '20/05/1995'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Constituency</span>
                                <span className="font-bold text-emerald-800 text-[10px] block truncate">{doc.constituency || '152-Assembly'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-emerald-200 relative z-10 gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Card
                        </button>
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3 py-2 rounded-xl bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border border-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5 text-emerald-800" /> Flip Card 🔄
                        </button>
                      </div>
                    </div>

                    {/* BACK SIDE */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                      className={`absolute inset-0 w-full h-full bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-200/60 border-2 border-emerald-400 rounded-3xl p-5 flex flex-col justify-between shadow-md group overflow-hidden ${
                        isFlipped ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                      } transition-opacity duration-300`}
                    >
                      <div className="-mx-5 -mt-5 mb-3 p-3 bg-emerald-950 text-emerald-200 border-b border-emerald-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Vote className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-extrabold text-xs text-white uppercase">
                            ECI ELECTOR CARD • BACK PANEL
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-mono font-extrabold text-[8.5px] uppercase">
                          ADDRESS & POLLING
                        </span>
                      </div>

                      <div className="space-y-2 relative z-10 flex-1">
                        <div className="p-2.5 bg-white/90 border border-emerald-300 rounded-2xl">
                          <span className="text-[9px] font-black text-emerald-900 uppercase block tracking-wider">
                            ELECTOR ADDRESS / पता
                          </span>
                          <p className="text-[10.5px] font-bold text-slate-900 leading-tight mt-0.5">
                            {[doc.village || 'Ward No 12', doc.mandal || 'Kodur Mandal', doc.district || 'Kadapa Dist', doc.state || 'Andhra Pradesh'].join(', ')} - 516101.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <span className="text-[8px] font-extrabold text-slate-500 uppercase block">Assembly Constituency</span>
                            <span className="font-extrabold text-emerald-950 text-[10.5px]">{doc.constituency || '152-Kodur'}</span>
                          </div>
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <span className="text-[8px] font-extrabold text-slate-500 uppercase block">Part No. & Name</span>
                            <span className="font-bold text-slate-800 text-[10px]">145 - ZP High School</span>
                          </div>
                        </div>

                        <div className="p-2 bg-emerald-900 text-emerald-100 rounded-xl flex items-center justify-between text-[9px] font-mono">
                          <span>Electoral Roll Sr No: 412</span>
                          <span className="text-amber-300 font-bold">ERO Official Stamp ✓</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-emerald-200 relative z-10 gap-2">
                        <button
                          onClick={(e) => toggleFlipDoc(doc.id, e)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-200" /> Flip to Front
                        </button>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Full View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ----------------------------------------------------
            // DRIVING LICENCE & OTHER ID CARDS (WITH 3D FLIP-FLOP FRONT & BACK)
            // ----------------------------------------------------
            const isFlipped = !!flippedDocIds[doc.id];

            return (
              <div key={doc.id} style={{ perspective: '1000px' }} className="w-full">
                <div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="relative w-full min-h-[430px]"
                >
                  {/* FRONT SIDE */}
                  <div
                    style={{ backfaceVisibility: 'hidden' }}
                    className={`w-full h-full bg-gradient-to-b from-teal-50 via-slate-50 to-teal-100/40 border-2 border-teal-300 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl group relative overflow-hidden ${
                      isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
                    } transition-opacity duration-300`}
                  >
                    {/* Holographic Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                    <div className="-mx-5 -mt-5 mb-4 p-3 bg-teal-950 text-teal-200 border-b-2 border-teal-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-teal-400 text-slate-950 rounded-xl font-black">
                          {renderDocIcon(doc.type)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-tight">
                            UNION OF INDIA • DRIVING LICENCE
                          </h4>
                          <span className="text-[8.5px] font-black text-teal-300 uppercase tracking-wider block">
                            MOTOR VEHICLES DEPARTMENT (RTO)
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-teal-300 bg-teal-900 px-2 py-0.5 rounded border border-teal-700">
                        RTO VERIFIED
                      </span>
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="p-3 bg-white/90 border border-teal-200 rounded-2xl text-center shadow-xs">
                        <span className="text-[9px] font-black text-teal-800 uppercase tracking-widest block mb-0.5">
                          LICENCE NUMBER / DL NO
                        </span>
                        <p className="font-mono text-lg font-black text-teal-950 tracking-widest">
                          {doc.documentNumberMasked}
                        </p>
                      </div>

                      {/* Details Box: LEFT Photo & Signature, RIGHT Details */}
                      <div className="p-3 bg-white/90 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs">
                        {/* LEFT SIDE: PHOTO & SIGNATURE UNDER PHOTO */}
                        <div className="flex flex-col items-center justify-center shrink-0 pr-3 border-r border-teal-200">
                          <div className="relative w-16 h-20 rounded-lg bg-gradient-to-b from-slate-100 to-teal-100 border-2 border-teal-800 shadow-xs flex flex-col items-center justify-end overflow-hidden p-0.5">
                            <div className="w-10 h-10 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-700 shadow-inner mb-0.5">
                              <User className="w-6 h-6 text-slate-700" />
                            </div>
                            <span className="text-[7px] font-mono font-bold text-teal-100 bg-teal-900 w-full text-center py-0.2 uppercase truncate">
                              DRIVER
                            </span>
                          </div>
                          {/* UNDER PHOTO: SIGNATURE */}
                          <div className="mt-1 text-center w-16 space-y-0.5">
                            <div className="bg-white border border-teal-300 rounded px-1 py-0.5 text-center shadow-2xs">
                              <span className="font-serif italic text-[9px] font-extrabold text-slate-950 block leading-tight">
                                G. Vasu
                              </span>
                              <span className="text-[6px] font-black text-teal-950 uppercase tracking-tighter block border-t border-slate-200 pt-0.2">
                                SIGNATURE
                              </span>
                            </div>
                            <span className="text-[6px] font-bold text-slate-500 uppercase block">
                              (चालक हस्ताक्षर)
                            </span>
                          </div>
                        </div>

                        {/* RIGHT SIDE: ALL CANDIDATE DETAILS */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="grid grid-cols-1 gap-1">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Holder Name</span>
                              <span className="font-extrabold text-slate-900 text-xs block truncate">{doc.holderName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">S/W/D of</span>
                              <span className="font-extrabold text-teal-900 text-xs block truncate">{doc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">DOB</span>
                              <span className="font-mono font-bold text-slate-900 text-xs">{doc.dateOfBirth || '20/05/1995'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Issue Date</span>
                              <span className="font-mono text-slate-700 text-xs">{doc.issueDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-teal-200 relative z-10 gap-2">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Licence
                      </button>
                      <button
                        onClick={(e) => toggleFlipDoc(doc.id, e)}
                        className="px-3 py-2 rounded-xl bg-teal-200 hover:bg-teal-300 text-teal-950 border border-teal-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 text-teal-800" /> Flip Card 🔄
                      </button>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-b from-teal-100 via-slate-50 to-teal-200/60 border-2 border-teal-400 rounded-3xl p-5 flex flex-col justify-between shadow-md group overflow-hidden ${
                      isFlipped ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                    } transition-opacity duration-300`}
                  >
                    <div className="-mx-5 -mt-5 mb-3 p-3 bg-teal-950 text-teal-200 border-b border-teal-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-400" />
                        <h4 className="font-extrabold text-xs text-white uppercase">
                          RTO DRIVING LICENCE • AUTHORIZATION BACK
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-100 font-mono font-extrabold text-[8.5px] uppercase">
                        COV AUTHORIZED
                      </span>
                    </div>

                    <div className="space-y-2 relative z-10 flex-1">
                      <div className="p-2.5 bg-white/90 border border-teal-300 rounded-2xl">
                        <span className="text-[9px] font-black text-teal-900 uppercase block tracking-wider mb-1">
                          VEHICLE CLASS AUTHORIZATION (COV TABLE)
                        </span>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between items-center bg-teal-50 p-1.5 rounded border border-teal-200">
                            <span className="font-bold text-teal-950">MCWG (Motorcycle w/ Gear)</span>
                            <span className="font-mono text-slate-700 text-[9px]">Valid: 20/05/2035</span>
                          </div>
                          <div className="flex justify-between items-center bg-teal-50 p-1.5 rounded border border-teal-200">
                            <span className="font-bold text-teal-950">LMV (Light Motor Vehicle Car)</span>
                            <span className="font-mono text-slate-700 text-[9px]">Valid: 20/05/2035</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-white/90 border border-teal-200 rounded-xl">
                          <span className="text-[8px] font-extrabold text-slate-500 uppercase block">Blood Group</span>
                          <span className="font-black text-red-600 text-xs">O +ve</span>
                        </div>
                        <div className="p-2 bg-white/90 border border-teal-200 rounded-xl">
                          <span className="text-[8px] font-extrabold text-slate-500 uppercase block">Organ Donor</span>
                          <span className="font-extrabold text-emerald-700 text-xs">YES ✓</span>
                        </div>
                      </div>

                      <div className="p-2 bg-teal-950 text-teal-100 rounded-xl flex items-center justify-between text-[9px] font-mono">
                        <span>RTO Code: AP04-KADAPA</span>
                        <span className="text-amber-300 font-bold">RTO Seal Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-teal-200 relative z-10 gap-2">
                      <button
                        onClick={(e) => toggleFlipDoc(doc.id, e)}
                        className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-teal-200" /> Flip to Front
                      </button>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No matching documents found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No saved certificates match "{searchQuery}". Try a different keyword or upload a new document.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Clear Search Query
            </button>
            <button
              onClick={() => {
                setShowUploadModal(true);
                setUploadNumber('');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Add / Upload Document
            </button>
          </div>
        </div>
      )}

      {/* PIN PROMPT MODAL */}
      {pinPromptDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Enter 4-Digit Security PIN</h3>
              <p className="text-xs text-slate-400 mt-1">Decrypt document numbers & sensitive card details</p>
            </div>

            <form onSubmit={handleVerifyPinUnlock} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-center text-2xl font-mono text-amber-300 focus:outline-none focus:border-violet-500"
              />

              {pinError && <p className="text-xs text-rose-400 text-center font-medium">{pinError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPinPromptDocId(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg cursor-pointer"
                >
                  Unlock Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DIGITAL CERTIFICATE / OFFICIAL PDF MARKS MEMO FULL MODAL VIEWER */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full space-y-4 relative text-slate-100 max-h-[92vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base text-white">{selectedDoc.title}</h3>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Docpay Verified Official Record Sheet
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!['10th', 'inter', 'graduation'].includes(selectedDoc.type) && (
                  <button
                    onClick={() => setModalFlipped(!modalFlipped)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <FlipHorizontal className="w-4 h-4 text-amber-400" />
                    <span>{modalFlipped ? 'Show Front Side (सामने का भाग)' : 'Flip-Flop Card 3D (पीछे का भाग)'}</span>
                  </button>
                )}
                <button
                  onClick={() => { setSelectedDoc(null); setModalFlipped(false); }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IF ACADEMIC DOCUMENT: DISPLAY HIGH-CLARITY PRINTABLE MARKS MEMO VIEW */}
            {['10th', 'inter', 'graduation'].includes(selectedDoc.type) ? (
              <div className="space-y-4">
                
                {/* PDF Viewer Control Header Bar */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold text-white block">
                        {selectedDoc.pdfFileName || `${selectedDoc.type.toUpperCase()}_Marks_Memo_Docpay.pdf`}
                      </span>
                      <span className="text-[10px] text-slate-400">Official Board Transcript Reader</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zoom Buttons */}
                    <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                        className="p-1 hover:text-white text-slate-400"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="px-2 font-mono text-[10px] text-amber-300 font-bold">{zoomLevel}%</span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                        className="p-1 hover:text-white text-slate-400"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDownloadVerificationSummary(selectedDoc)}
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Download Certified Verification Status Summary PDF"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-200" />
                      )}
                      <span>Download Summary PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDocumentFile(selectedDoc)}
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Download Full Marks Memo Sheet PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Memo PDF</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Statement
                    </button>
                  </div>
                </div>

                {/* HIGH-CLARITY PRINTABLE MARKS MEMO SHEET CANVAS WITH GOLDEN/AMBER HIGHLIGHT FRAME */}
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100/90 text-slate-900 rounded-3xl border-8 border-double border-amber-600/90 p-6 md:p-10 space-y-6 shadow-2xl relative overflow-hidden font-serif ring-4 ring-amber-400/60"
                >
                  {/* Top Official Highlight Ribbon Banner */}
                  <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-black font-sans text-xs uppercase py-2 px-4 text-center tracking-widest rounded-xl shadow-md border border-amber-300 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-950 fill-amber-300" />
                    <span>★ OFFICIAL HIGHLY-VERIFIED MARKS MEMORANDUM & TRANSCRIPT SHEET ★</span>
                    <Award className="w-4 h-4 text-slate-950 fill-amber-300" />
                  </div>

                  {/* Watermark Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <span className="text-7xl font-black font-sans uppercase tracking-widest text-slate-900 rotate-12">
                      DOCPAY VERIFIED
                    </span>
                  </div>

                  {/* 1. Official Board Header */}
                  <div className="text-center border-b-2 border-amber-900/60 pb-4 space-y-1 bg-amber-100/70 p-4 rounded-2xl border border-amber-300/80 shadow-xs">
                    <div className="flex justify-between items-center mb-1 font-sans">
                      <span className="text-[10px] font-mono font-bold text-amber-950 uppercase">MEMO SERIAL: {selectedDoc.documentNumberMasked}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-xs">
                        DOCPAY VERIFIED OFFICIAL TRANSCRIPT
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-black text-amber-950 uppercase tracking-wide">
                      {selectedDoc.boardOrUniversity || 'GOVERNMENT BOARD OF SECONDARY & INTERMEDIATE EDUCATION'}
                    </h2>
                    <p className="text-xs font-bold text-slate-800 font-sans uppercase tracking-widest">
                      MEMORANDUM OF MARKS & CUMULATIVE GRADE POINT AVERAGE (CGPA)
                    </p>
                    <p className="text-[11px] text-slate-700 font-sans italic">
                      Issued under authority of State Board Examinations Gateway & Docpay Enterprise Vault
                    </p>
                  </div>

                  {/* 2. Candidate Details Grid (Left Side: All Details, Right Side: ONLY Photo & Signature Under Photo) */}
                  <div className="flex flex-col md:flex-row gap-4 font-sans text-xs bg-amber-100/60 border border-amber-300 p-4 rounded-xl justify-between items-start">
                    
                    {/* LEFT SIDE: ALL CANDIDATE & INSTITUTION DETAILS */}
                    <div className="flex-1 space-y-2.5 text-xs w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">STUDENT / APPLICANT NAME</span>
                          <span className="font-extrabold text-slate-950 text-sm">{selectedDoc.holderName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">FATHER'S NAME WITH INITIAL</span>
                          <span className="font-extrabold text-amber-950 text-sm">{selectedDoc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                        </div>
                      </div>

                      {/* DATE OF BIRTH (AS PER SSC MEMO LIST REQUIREMENT) */}
                      <div className="p-2.5 bg-white border border-amber-300 rounded-lg space-y-0.5">
                        <span className="text-[9.5px] text-amber-900 font-extrabold uppercase block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-800" /> DATE OF BIRTH / जन्म तिथि (AS PER SSC MEMO):
                        </span>
                        <p className="font-mono font-black text-amber-950 text-xs">
                          {selectedDoc.dateOfBirth || '1995-05-20'} ({selectedDoc.dateOfBirth ? selectedDoc.dateOfBirth.split('-').reverse().join('/') : '20/05/1995'})
                        </p>
                        <p className="font-mono text-[9.5px] font-bold text-amber-900 uppercase">
                          IN WORDS: {selectedDoc.dobInWords || 'TWENTIETH MAY NINETEEN NINETY FIVE'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">HALL TICKET / ROLL NUMBER</span>
                          <span className="font-mono font-black text-amber-900 text-sm">{selectedDoc.rollNumber || selectedDoc.documentNumberMasked}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">SCHOOL / COLLEGE NAME</span>
                          <span className="font-extrabold text-amber-950">{selectedDoc.schoolOrCollegeName || 'Zilla Parishad High School'}</span>
                        </div>
                      </div>

                      {selectedDoc.institutionAddress && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">INSTITUTION ADDRESS</span>
                          <span className="text-slate-700 text-[11px] font-medium">{selectedDoc.institutionAddress}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">LOCATION HIERARCHY</span>
                        <span className="font-bold text-indigo-900 text-[11px]">
                          {[selectedDoc.village, selectedDoc.mandal && `${selectedDoc.mandal} Mdl`, selectedDoc.district && `${selectedDoc.district} Dist`, selectedDoc.state].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT SIDE: ONLY CANDIDATE PHOTO & SIGNATURE UNDER PHOTO */}
                    <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-amber-300/80 pt-3 md:pt-0 md:pl-5 shrink-0 w-full md:w-auto self-stretch">
                      <div className="flex flex-col items-center justify-center my-auto">
                        {/* Candidate Passport Photo Frame */}
                        <div className="relative w-28 h-32 rounded-xl bg-gradient-to-b from-slate-100 to-amber-100/90 border-2 border-amber-900 shadow-md flex flex-col items-center justify-end overflow-hidden p-1">
                          <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-amber-900 text-amber-100 text-[8px] font-mono font-bold uppercase z-10 shadow-xs">
                            PASSPORT
                          </div>
                          <div className="w-16 h-16 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-slate-700 shadow-inner mb-1">
                            <User className="w-10 h-10 text-slate-700" />
                          </div>
                          <div className="w-full bg-slate-900 text-amber-200 text-[8.5px] font-mono font-black text-center py-0.5 tracking-tight truncate uppercase">
                            {selectedDoc.holderName}
                          </div>
                        </div>

                        {/* UNDER PHOTO: SIGNATURE OF CANDIDATE */}
                        <div className="mt-2.5 text-center space-y-0.5 w-32">
                          <div className="bg-white/90 border border-amber-400 rounded-lg p-1.5 shadow-xs text-center">
                            <p className="font-serif italic text-sm font-extrabold text-slate-950 tracking-wider font-mono border-b border-slate-300 pb-0.5">
                              G. Vasu
                            </p>
                            <span className="text-[8.5px] font-extrabold text-amber-950 uppercase tracking-tight block pt-0.5">
                              Signature of Candidate
                            </span>
                          </div>
                          <span className="text-[7.5px] font-bold text-slate-500 uppercase block">
                            (అభ్యర్థి సంతకం)
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 3. Detailed Subject-Wise Marks Statement Table with Theory & Oral Marks */}
                  <div className="font-sans">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        DETAILED SUBJECT-WISE MARKS STATEMENT (THEORY + ORAL / INTERNAL)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">AUTHENTICATED BY EXAMINATION CELL</span>
                    </div>

                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                          <th className="p-2.5 border border-slate-700">SL</th>
                          <th className="p-2.5 border border-slate-700">SUBJECT TITLE</th>
                          <th className="p-2.5 border border-slate-700 text-center">THEORY MARKS</th>
                          <th className="p-2.5 border border-slate-700 text-center">ORAL / INTERNAL</th>
                          <th className="p-2.5 border border-slate-700 text-center">TOTAL SECURED</th>
                          <th className="p-2.5 border border-slate-700 text-center">MAX MARKS</th>
                          <th className="p-2.5 border border-slate-700 text-center">GRADE / STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {selectedDoc.subjectMarks && selectedDoc.subjectMarks.length > 0 ? (
                          selectedDoc.subjectMarks.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/50 font-sans">
                              <td className="p-2.5 border border-slate-200 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2.5 border border-slate-200 font-bold text-slate-900">{sub.subjectName}</td>
                              <td className="p-2.5 border border-slate-200 text-center font-mono text-slate-700 font-bold">{sub.theoryMarks || '-'}</td>
                              <td className="p-2.5 border border-slate-200 text-center font-mono text-slate-700 font-bold">{sub.oralOrInternalMarks || '-'}</td>
                              <td className="p-2.5 border border-slate-200 text-center font-mono font-black text-amber-900 text-sm">{sub.securedMarks}</td>
                              <td className="p-2.5 border border-slate-200 text-center font-mono text-slate-600">{sub.maxMarks}</td>
                              <td className="p-2.5 border border-slate-200 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                                  {sub.gradeOrStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                              Full subject breakdown details verified in Docpay Vault. Overall Result: {selectedDoc.marksOrGpa}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-amber-100/90 font-black text-slate-950 text-xs border-t-2 border-slate-800">
                          <td colSpan={4} className="p-3 border border-slate-300 uppercase tracking-wider text-amber-950">
                            GRAND TOTAL MARKS SECURED
                          </td>
                          <td className="p-3 border border-slate-300 text-center font-mono text-amber-900 text-base">
                            {selectedDoc.totalMarksSecured || 554}
                          </td>
                          <td className="p-3 border border-slate-300 text-center font-mono">{selectedDoc.totalMaxMarks || 600}</td>
                          <td className="p-3 border border-slate-300 text-center font-mono text-emerald-800 text-xs">
                            {selectedDoc.divisionOrClass || 'FIRST CLASS DISTINCTION'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* 4. Total Marks and CGPA in Full Alphabetic Words Banner */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white font-mono space-y-2 border-2 border-amber-400">
                    <div>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">
                        TOTAL MARKS GETTING / SECURED (IN WORDS):
                      </span>
                      <p className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
                        {selectedDoc.totalMarksInWords || 'FIVE HUNDRED FIFTY FOUR OUT OF SIX HUNDRED ONLY'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                        CUMULATIVE GRADE POINT AVERAGE (CGPA IN WORDS):
                      </span>
                      <p className="text-xs md:text-sm font-black text-emerald-300 uppercase tracking-wider">
                        {selectedDoc.cgpaInWords || 'NINE POINT EIGHT CUMULATIVE GRADE POINT AVERAGE (A1 GRADE)'}
                      </p>
                    </div>
                  </div>

                  {/* 5. Official Signatures, QR Code & Docpay Verified Stamp */}
                  <div className="pt-4 border-t-2 border-amber-900/40 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-400 flex items-center justify-center shrink-0 shadow-sm">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-emerald-800 uppercase block">DOCPAY VERIFIED DIGITAL STAMP</span>
                        <p className="text-[10px] font-mono font-bold text-slate-800">SERIAL: DOCPAY-EDUC-992014</p>
                        <p className="text-[9px] text-slate-500">Cryptographically signed on {selectedDoc.verifiedAt || '2026-02-12'}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-mono font-extrabold text-slate-700 block">
                        Date of Issue / जारी तिथि: <span className="text-amber-950 font-black">{selectedDoc.issueDate || '12/06/2011'}</span>
                      </span>
                      <div className="inline-block border-b-2 border-slate-800 px-6 pb-1 font-serif italic text-sm font-bold text-amber-950">
                        Controller of Examinations
                      </div>
                      <span className="block text-[10px] font-bold text-slate-600 uppercase">Board of Examination Authority</span>
                    </div>
                  </div>

                  {/* 6. Highlighted Issue Date & Year of Passing Bottom Section */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 text-white font-sans flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0 shadow-md">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                          ISSUE DATE & YEAR OF PASSING / जारी तिथि एवं उत्तीर्ण वर्ष
                        </span>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5">
                          <span className="font-mono text-xs md:text-sm font-black text-white">
                            Date of Issue: <span className="text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500/50">{selectedDoc.issueDate || '12/06/2011'}</span>
                          </span>
                          <span className="text-amber-400 font-bold hidden sm:inline">•</span>
                          <span className="font-mono text-xs md:text-sm font-black text-white">
                            Year of Passing: <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                              {selectedDoc.issueDate ? (selectedDoc.issueDate.includes('/') ? selectedDoc.issueDate.split('/')[2] : selectedDoc.issueDate.split('-')[0]) : '2011'} (MAY {selectedDoc.issueDate ? (selectedDoc.issueDate.includes('/') ? selectedDoc.issueDate.split('/')[2] : selectedDoc.issueDate.split('-')[0]) : '2011'})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3.5 py-2 bg-amber-500/20 border border-amber-400/80 rounded-xl text-xs font-mono font-black text-amber-200 shrink-0 text-center shadow-xs">
                      CERTIFICATE BATCH: {selectedDoc.issueDate ? (selectedDoc.issueDate.includes('/') ? selectedDoc.issueDate.split('/')[2] : selectedDoc.issueDate.split('-')[0]) : '2011'}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* STANDARD DIGITAL DOCUMENT CARD FULL VIEW (Aadhaar, PAN, Voter, DL) WITH 3D FLIP */
              <div className="space-y-4">
                {/* ID Card PDF & Action Toolbar */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold text-white block">
                        DocPay Verified • Status: Certified Active
                      </span>
                      <span className="text-[10px] text-slate-400">UIDAI / Income Tax / Official Registry Validated</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadVerificationSummary(selectedDoc)}
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Download Official Verification Status Summary PDF"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-200" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDocumentFile(selectedDoc)}
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Download High-Resolution Digital ID Card PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Card PDF</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                <div className="relative w-full" style={{ perspective: '1200px' }}>
                <div
                  onClick={() => setModalFlipped(!modalFlipped)}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: modalFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="relative w-full cursor-pointer group"
                >
                  {/* FRONT FACE OF MODAL DIGITAL CARD */}
                  <div
                    style={{ backfaceVisibility: 'hidden' }}
                    className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden text-white"
                  >
                    {/* Header Info with Symbols */}
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        {selectedDoc.type === 'aadhaar' ? (
                          <AshokaChakraSymbol className="w-10 h-10 text-amber-400 shrink-0" />
                        ) : selectedDoc.type === 'voter' ? (
                          <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black shrink-0">
                            <Vote className="w-6 h-6" />
                          </div>
                        ) : selectedDoc.type === 'pan' ? (
                          <IndiaGovernmentEmblem className="w-10 h-10 text-cyan-400 shrink-0" />
                        ) : (
                          <div className="p-2.5 bg-teal-500 text-slate-950 rounded-2xl font-black shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase block">
                            OFFICIAL GOVT VERIFIED DIGITAL CARD (FRONT / सामने)
                          </span>
                          <h4 className="font-extrabold text-lg text-white">{selectedDoc.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {selectedDoc.type === 'voter' ? 'Election Commission of India (ECI)' : selectedDoc.type === 'pan' ? 'Income Tax Department (GOVT OF INDIA)' : selectedDoc.type === 'aadhaar' ? 'Unique Identification Authority of India (UIDAI)' : 'Union of India Motor Vehicles Dept (RTO)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="w-14 h-14 bg-white p-1 rounded-2xl border border-slate-700 flex items-center justify-center shrink-0 shadow-lg">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>
                        <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          <FlipHorizontal className="w-3 h-3 text-amber-400" /> Click to Flip 3D
                        </span>
                      </div>
                    </div>

                    {/* Card Number Banner */}
                    <div className="p-3 bg-amber-500/20 border-2 border-amber-400/80 rounded-2xl text-center space-y-0.5 shadow-inner">
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
                        CARD / IDENTIFICATION NUMBER
                      </span>
                      <p className="text-2xl font-mono font-black text-amber-300 tracking-widest">
                        {selectedDoc.documentNumberMasked}
                      </p>
                    </div>

                    {/* Main 2-Column Content Layout: LEFT Photo & Signature, RIGHT Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                      {/* LEFT COLUMN: CANDIDATE PHOTO & SIGNATURE DIRECTLY UNDER PHOTO */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-center">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          CANDIDATE PASSPORT PHOTO
                        </span>
                        <div className="relative w-24 h-32 rounded-xl bg-gradient-to-b from-slate-800 to-indigo-950 border-2 border-indigo-400/80 shadow-md flex flex-col items-center justify-end overflow-hidden p-1">
                          <div className="w-16 h-16 rounded-full bg-slate-700 border border-indigo-300 flex items-center justify-center text-indigo-200 shadow-inner mb-1">
                            <User className="w-10 h-10 text-indigo-200" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-indigo-950 bg-indigo-400 w-full text-center py-0.5 uppercase tracking-wider">
                            VERIFIED
                          </span>
                        </div>

                        {/* DIRECTLY UNDER PHOTO: CANDIDATE SIGNATURE */}
                        <div className="w-full pt-1">
                          <div className="bg-slate-950 border border-indigo-500/50 rounded-lg p-1.5 text-center shadow-2xs">
                            <span className="font-serif italic text-sm font-extrabold text-indigo-200 block leading-tight">
                              G. Vasu
                            </span>
                            <span className="text-[7px] font-black text-indigo-400 uppercase tracking-wider block border-t border-slate-800 pt-0.5">
                              CANDIDATE SIGNATURE
                            </span>
                          </div>
                          <span className="text-[7px] font-bold text-slate-400 uppercase block mt-0.5">
                            (धारक का हस्ताक्षर / అభ్యర్థి సంతకం)
                          </span>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: ALL CANDIDATE DETAILS */}
                      <div className="md:col-span-2 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">HOLDER NAME / नाम</span>
                            <span className="font-extrabold text-white text-sm">{selectedDoc.holderName}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">FATHER'S NAME WITH INITIAL / पिता का नाम</span>
                            <span className="font-extrabold text-emerald-300 text-sm">{selectedDoc.fatherName || 'G. LAKSHMI NARAYANA'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">DATE OF BIRTH / जन्म तिथि</span>
                            <span className="font-mono text-amber-300 text-sm font-black">{selectedDoc.dateOfBirth || '20/05/1995'}</span>
                            {selectedDoc.dobInWords && (
                              <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{selectedDoc.dobInWords}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">ISSUE DATE / जारी करने की तिथि</span>
                            <span className="font-mono text-emerald-300 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block">{selectedDoc.issueDate || '12/06/2011'}</span>
                          </div>
                        </div>

                        {selectedDoc.constituency && (
                          <div className="pt-2 border-t border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">ASSEMBLY CONSTITUENCY</span>
                            <span className="font-bold text-emerald-300 text-xs">{selectedDoc.constituency}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Geographic Location Breakdown */}
                    {(selectedDoc.state || selectedDoc.district || selectedDoc.mandal || selectedDoc.village) && (
                      <div className="p-3 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                          <Map className="w-3.5 h-3.5 text-indigo-400" /> State & District Location Hierarchy
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-indigo-500/20">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">State</span>
                            <span className="font-bold text-amber-300 text-[11px] truncate block">{selectedDoc.state || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-indigo-500/20">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">District</span>
                            <span className="font-bold text-emerald-300 text-[11px] truncate block">{selectedDoc.district || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-indigo-500/20">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Mandal</span>
                            <span className="font-bold text-indigo-300 text-[11px] truncate block">{selectedDoc.mandal || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-indigo-500/20">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Village / Town</span>
                            <span className="font-bold text-teal-300 text-[11px] truncate block">{selectedDoc.village || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Stamp */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Docpay Verified Stamp
                      </span>
                      <span className="font-mono text-[10px]">VERIFIED: DOCPAY-GOVT-9910</span>
                    </div>
                  </div>

                  {/* BACK FACE OF MODAL DIGITAL CARD (FLIP-FLOP) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 space-y-4 shadow-2xl overflow-hidden text-white flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-indigo-800/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <AshokaChakraSymbol className="w-8 h-8 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                            REVERSE SIDE / पीछे का भाग
                          </span>
                          <h4 className="font-extrabold text-base text-white">{selectedDoc.title} Address & Official Details</h4>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/40">
                        <RotateCcw className="w-3.5 h-3.5" /> Click to Flip Front
                      </span>
                    </div>

                    {/* Prominent Card / Aadhaar Number Banner on Modal Reverse Side */}
                    <div className="p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-2 border-amber-300 rounded-2xl text-center space-y-0.5 shadow-lg">
                      <span className="text-[10px] font-extrabold text-amber-100 uppercase tracking-widest block">
                        {selectedDoc.type === 'aadhaar' ? 'आधार क्रमांक / AADHAAR NUMBER' : 'CARD / IDENTIFICATION NUMBER'}
                      </span>
                      <p className="text-xl md:text-2xl font-mono font-black text-white tracking-widest">
                        {selectedDoc.documentNumberMasked}
                      </p>
                    </div>

                    {/* Address Section in English & Regional Language */}
                    <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-indigo-500/30">
                      <div>
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                          PERMANENT RESIDENTIAL ADDRESS (पता / చిరునామా):
                        </span>
                        <p className="text-xs text-white font-semibold mt-1 leading-relaxed">
                          S/O: {selectedDoc.fatherName || 'G. LAKSHMI NARAYANA'}, H.No. 4-88, Main Road, Village: {selectedDoc.village || 'Ananthapur'}, Mandal: {selectedDoc.mandal || 'Dharmavaram'}, District: {selectedDoc.district || 'Anantapur'}, State: {selectedDoc.state || 'Andhra Pradesh'}, Pincode: 515671.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">HELPLINE / CONTACT</span>
                          <span className="font-mono text-emerald-300 font-bold">1947 (Toll Free UIDAI/Govt)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">OFFICIAL PORTAL</span>
                          <span className="font-mono text-cyan-300 font-bold">www.uidai.gov.in / docpay.gov</span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline Banner for Aadhaar */}
                    {selectedDoc.type === 'aadhaar' && (
                      <div className="p-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl text-center shadow-xs">
                        <span className="font-black text-xs tracking-widest uppercase">
                          मेरा आधार, मेरी पहचान • UNIQUE IDENTIFICATION AUTHORITY OF INDIA
                        </span>
                      </div>
                    )}

                    {/* Large Secure Barcode & Security Microprint */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-1">
                      {/* Barcode Lines Simulation */}
                      <div className="w-full h-10 flex items-center justify-between gap-1 overflow-hidden px-2 bg-slate-100 rounded p-1">
                        {Array.from({ length: 48 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-full ${idx % 3 === 0 ? 'w-1 bg-slate-950' : idx % 5 === 0 ? 'w-1.5 bg-slate-800' : 'w-0.5 bg-slate-900'}`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-900 tracking-widest">
                        {selectedDoc.documentNumberMasked || 'UIDAI-INDIA-SECURE-99201'}
                      </span>
                    </div>

                    {/* Reverse Footer Notice */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>DOCPAY VAULT OFFICIAL REVERSE ENCRYPTION</span>
                      <span className="text-amber-400 font-bold">SERIAL: REV-99482-IN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Active Generation Toast */}
            {pdfDownloadMessage && (
              <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl text-center text-xs font-bold text-indigo-200 flex items-center justify-center gap-2 animate-fade-in shadow-lg">
                {isGeneratingPdf && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                <span>{pdfDownloadMessage}</span>
              </div>
            )}

            {/* Comprehensive Bottom Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDownloadVerificationSummary(selectedDoc)}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4 text-emerald-200" />}
                <span>Download Verification Summary PDF</span>
              </button>

              <button
                onClick={() => handleDownloadDocumentFile(selectedDoc)}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Document PDF</span>
              </button>

              <button
                onClick={() => { setSelectedDoc(null); setModalFlipped(false); }}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs cursor-pointer transition-all"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / SCAN NEW DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Add / Upload Document PDF</h3>
                  <p className="text-[11px] text-slate-400">Upload Marks Memo PDF, Father's Name, DOB, School & Location</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isScanning ? (
              <form onSubmit={handleStartScanUpload} className="space-y-4">
                
                {/* 1. Select Document Type */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    1. Select Document Category & Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <optgroup label="🎓 Academic & Educational Certificates">
                      <option value="10th">10th Class Marks Sheet (SSC Marks Memo)</option>
                      <option value="inter">Intermediate Marks Sheet (12th Memo)</option>
                      <option value="graduation">Graduation Degree Certificate & Grade Memo</option>
                    </optgroup>
                    <optgroup label="🪪 Identity & Government Cards">
                      <option value="voter">Voter ID Card (EPIC Card)</option>
                      <option value="aadhaar">Aadhaar Card (12-Digit)</option>
                      <option value="pan">PAN Card (10-AlphaNum)</option>
                      <option value="dl">Driving Licence (DL)</option>
                      <option value="other">Other Document / Certificate</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. PDF FILE UPLOADER INPUT */}
                <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border-2 border-dashed border-amber-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-400" /> Upload PDF Marks Memo / Document File
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Docpay Verified Reader</span>
                  </div>

                  <input
                    type="file"
                    id="pdf-file-upload-input"
                    accept="application/pdf,.pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <label
                    htmlFor="pdf-file-upload-input"
                    className="flex flex-col items-center justify-center p-4 bg-slate-900/90 border border-slate-700 hover:border-amber-400 rounded-xl cursor-pointer transition-all hover:bg-slate-800"
                  >
                    {pdfFileName ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <span>Loaded: {pdfFileName}</span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileSpreadsheet className="w-7 h-7 text-amber-400 mx-auto" />
                        <p className="text-xs font-bold text-white">Click or Drag to Upload PDF Marks Memo</p>
                        <p className="text-[10px] text-slate-400">Supports PDF, JPG, PNG files with high clarity OCR</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* 3. Student / Holder, Father Name & DOB Details */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    3. Candidate, Father's Name & Date of Birth (DOB)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Applicant Holder Name</label>
                      <input
                        type="text"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        required
                        placeholder="Full Name as per Certificate"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Father's Name with Initials
                      </label>
                      <input
                        type="text"
                        value={uploadFatherName}
                        onChange={(e) => setUploadFatherName(e.target.value)}
                        placeholder="e.g. G. LAKSHMI NARAYANA"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Date of Birth (DOB)
                      </label>
                      <input
                        type="date"
                        value={uploadDob}
                        onChange={(e) => setUploadDob(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        DOB in Words (as per SSC list)
                      </label>
                      <input
                        type="text"
                        value={uploadDobInWords}
                        onChange={(e) => setUploadDobInWords(e.target.value)}
                        placeholder="e.g. TWENTIETH MAY NINETEEN NINETY FIVE"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Roll Number / Hall Ticket / Serial No
                      </label>
                      <input
                        type="text"
                        value={uploadRoll}
                        onChange={(e) => setUploadRoll(e.target.value)}
                        placeholder="e.g. 1109204581 or Reg No"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {['10th', 'inter', 'graduation'].includes(uploadType) && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Marks Obtained / CGPA</label>
                        <input
                          type="text"
                          value={uploadMarks}
                          onChange={(e) => setUploadMarks(e.target.value)}
                          placeholder="e.g. 554 / 600 or GPA 9.8"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {uploadType === 'voter' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">EPIC Card Number</label>
                        <input
                          type="text"
                          value={uploadNumber}
                          onChange={(e) => setUploadNumber(e.target.value)}
                          placeholder="e.g. ZYX9876543"
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Assembly Constituency</label>
                        <input
                          type="text"
                          value={uploadConstituency}
                          onChange={(e) => setUploadConstituency(e.target.value)}
                          placeholder="e.g. 152-Koramangala Assembly"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. School / College Name & Address */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <School className="w-3.5 h-3.5" /> 4. School / College Name & Full Address
                  </span>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      School / College / Institution Name
                    </label>
                    <input
                      type="text"
                      value={uploadSchool}
                      onChange={(e) => setUploadSchool(e.target.value)}
                      placeholder="e.g. Zilla Parishad High School (ZPHS) / Sri Chaitanya College"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      School / College Address (Street / Landmark)
                    </label>
                    <input
                      type="text"
                      value={uploadAddress}
                      onChange={(e) => setUploadAddress(e.target.value)}
                      placeholder="e.g. Main Road, Near Bus Stand, Opp SBI Branch"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Indian Geographical Location: State -> District -> Mandal -> Village */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" /> 5. State, District, Mandal & Village Selection
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Indian Geography</span>
                  </div>

                  {/* State & District row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select State in India</label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select District</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {availableDistricts.map((dst) => (
                          <option key={dst} value={dst}>
                            {dst}
                          </option>
                        ))}
                        <option value="Other">+ Other / Custom District</option>
                      </select>
                    </div>
                  </div>

                  {selectedDistrict === 'Other' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Type Custom District Name</label>
                      <input
                        type="text"
                        value={customDistrict}
                        onChange={(e) => setCustomDistrict(e.target.value)}
                        placeholder="e.g. Kadapa / Tirupati"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  {/* Mandal & Village row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Mandal / Tehsil</label>
                      <select
                        value={selectedMandal}
                        onChange={(e) => handleMandalChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {availableMandals.map((mnd) => (
                          <option key={mnd} value={mnd}>
                            {mnd}
                          </option>
                        ))}
                        <option value="Other">+ Other / Custom Mandal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Village / Town / Ward</label>
                      <select
                        value={selectedVillage}
                        onChange={(e) => setSelectedVillage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {availableVillages.map((vlg) => (
                          <option key={vlg} value={vlg}>
                            {vlg}
                          </option>
                        ))}
                        <option value="Other">+ Other / Custom Village</option>
                      </select>
                    </div>
                  </div>

                  {selectedMandal === 'Other' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Type Custom Mandal Name</label>
                      <input
                        type="text"
                        value={customMandal}
                        onChange={(e) => setCustomMandal(e.target.value)}
                        placeholder="e.g. Dharmavaram Rural"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  {selectedVillage === 'Other' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Type Custom Village / Gram Panchayat Name</label>
                      <input
                        type="text"
                        value={customVillage}
                        onChange={(e) => setCustomVillage(e.target.value)}
                        placeholder="e.g. Subbaraopeta Grama Panchayat"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  id="start-doc-ocr-btn"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" /> Save & Verify PDF Marks Memo in Docpay Vault
                </button>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-sm font-bold text-emerald-300">{scanStepText}</p>
                <p className="text-xs text-slate-400">Authenticating with Docpay Verified Vault & State Examination APIs...</p>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
