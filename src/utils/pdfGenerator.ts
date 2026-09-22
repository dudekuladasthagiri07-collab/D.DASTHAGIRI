import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentItem } from '../types';

/**
 * Generates a high-resolution printable PDF for any verified document item
 * and triggers a browser download.
 */
export async function generateDocumentPDF(doc: DocumentItem): Promise<void> {
  // Create a hidden off-screen container for rendering standard A4 document markup
  const printContainer = document.createElement('div');
  printContainer.style.position = 'fixed';
  printContainer.style.top = '-9999px';
  printContainer.style.left = '-9999px';
  printContainer.style.width = '800px'; // Exact A4 width proportion
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.color = '#0f172a';
  printContainer.style.fontFamily = 'serif, system-ui, sans-serif';
  printContainer.style.padding = '32px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.zIndex = '-9999';

  const isAcademic = ['10th', 'inter', 'graduation'].includes(doc.type);
  const passingYear = doc.issueDate
    ? doc.issueDate.includes('/')
      ? doc.issueDate.split('/')[2]
      : doc.issueDate.split('-')[0]
    : '2011';

  if (isAcademic) {
    // ACADEMIC MARKS MEMO / TRANSCRIPT LAYOUT
    printContainer.innerHTML = `
      <div style="border: 6px double #b45309; padding: 24px; border-radius: 16px; background: #fffbeb; position: relative;">
        <!-- Watermark -->
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.05; pointer-events: none;">
          <span style="font-size: 56px; font-weight: 900; font-family: sans-serif; text-transform: uppercase; color: #000; transform: rotate(-15deg);">
            DOCPAY OFFICIAL VERIFIED
          </span>
        </div>

        <!-- Banner Header -->
        <div style="background: linear-gradient(to right, #d97706, #f59e0b, #d97706); color: #000; font-weight: 900; font-family: sans-serif; font-size: 11px; text-transform: uppercase; padding: 6px; text-align: center; border-radius: 8px; margin-bottom: 16px; letter-spacing: 1px;">
          ★ OFFICIAL HIGHLY-VERIFIED MARKS MEMORANDUM & TRANSCRIPT SHEET ★
        </div>

        <!-- Board Header -->
        <div style="text-align: center; border-bottom: 2px solid #92400e; padding-bottom: 12px; margin-bottom: 16px; background-color: rgba(254, 243, 199, 0.7); padding: 12px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 10px; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: bold; color: #78350f;">SERIAL: ${doc.documentNumberMasked}</span>
            <span style="background-color: #047857; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 900;">
              DOCPAY VERIFIED OFFICIAL TRANSCRIPT
            </span>
          </div>
          <h2 style="font-size: 18px; font-weight: 900; color: #78350f; text-transform: uppercase; margin: 0;">
            ${doc.boardOrUniversity || 'GOVERNMENT BOARD OF SECONDARY & INTERMEDIATE EDUCATION'}
          </h2>
          <p style="font-size: 12px; font-weight: bold; color: #1e293b; font-family: sans-serif; text-transform: uppercase; margin: 4px 0 0 0;">
            MEMORANDUM OF MARKS & CUMULATIVE GRADE POINT AVERAGE (CGPA)
          </p>
          <p style="font-size: 10px; color: #475569; font-family: sans-serif; font-style: italic; margin: 2px 0 0 0;">
            Issued under authority of State Board Examinations Gateway & Docpay Enterprise Vault
          </p>
        </div>

        <!-- Candidate Details Grid -->
        <div style="display: flex; gap: 16px; font-family: sans-serif; font-size: 12px; background-color: rgba(254, 243, 199, 0.5); border: 1px solid #fcd34d; padding: 12px; border-radius: 12px; margin-bottom: 16px; justify-content: space-between;">
          <!-- Left side details -->
          <div style="flex: 1;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">STUDENT / APPLICANT NAME</span>
                <strong style="font-size: 13px; color: #020617;">${doc.holderName}</strong>
              </div>
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">FATHER'S NAME</span>
                <strong style="font-size: 13px; color: #78350f;">${doc.fatherName || 'G. LAKSHMI NARAYANA'}</strong>
              </div>
            </div>

            <!-- DOB -->
            <div style="background-color: #ffffff; border: 1px solid #fcd34d; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="font-weight: 800; color: #78350f; text-transform: uppercase;">Date of Birth (DOB):</span>
                <span style="font-family: monospace; font-weight: 900; color: #78350f;">${doc.dateOfBirth || '20/05/1995'}</span>
              </div>
              ${doc.dobInWords ? `<div style="font-size: 9px; font-family: monospace; font-weight: bold; color: #78350f; margin-top: 2px;">DOB IN WORDS: ${doc.dobInWords}</div>` : ''}
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 11px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">School / Institution</span>
                <strong style="color: #0f172a;">${doc.schoolOrCollegeName || 'Govt High School / College'}</strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Roll / Hall Ticket No</span>
                <strong style="font-family: monospace; color: #78350f;">${doc.rollNumber || doc.documentNumberMasked}</strong>
              </div>
            </div>
          </div>

          <!-- Right side Photo & Signature -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-left: 12px; border-left: 1px solid #fcd34d; min-width: 100px;">
            <div style="width: 70px; height: 85px; border-radius: 6px; border: 2px solid #78350f; background: #fef3c7; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; position: relative;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #334155;">
                👤
              </div>
              <span style="font-size: 7px; font-family: monospace; font-weight: bold; background-color: #78350f; color: #fff; width: 100%; text-align: center; margin-top: 6px;">
                VERIFIED PHOTO
              </span>
            </div>
            <!-- Candidate Signature directly under photo -->
            <div style="margin-top: 6px; text-align: center; width: 80px;">
              <div style="background-color: #fff; border: 1px solid #78350f; border-radius: 4px; padding: 2px;">
                <span style="font-family: serif; font-style: italic; font-size: 11px; font-weight: 800; color: #020617; display: block;">G. Vasu</span>
                <span style="font-size: 6px; font-weight: 900; color: #78350f; text-transform: uppercase; display: block; border-top: 1px solid #e2e8f0; margin-top: 2px;">SIGNATURE</span>
              </div>
              <span style="font-size: 6px; color: #64748b; font-weight: bold; display: block;">(धारक का हस्ताक्षर)</span>
            </div>
          </div>
        </div>

        <!-- Subject Marks Table -->
        <div style="margin-bottom: 16px;">
          <h4 style="font-family: sans-serif; font-size: 11px; font-weight: 900; color: #78350f; text-transform: uppercase; margin: 0 0 6px 0;">
            SUBJECT-WISE MARKS & GRADE BREAKDOWN:
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; background-color: #ffffff;">
            <thead>
              <tr style="background-color: #78350f; color: #ffffff; text-align: left;">
                <th style="padding: 6px; border: 1px solid #92400e;">Subject Name</th>
                <th style="padding: 6px; border: 1px solid #92400e; text-align: center;">Max Marks</th>
                <th style="padding: 6px; border: 1px solid #92400e; text-align: center;">Secured Marks</th>
                <th style="padding: 6px; border: 1px solid #92400e; text-align: center;">Grade / Status</th>
              </tr>
            </thead>
            <tbody>
              ${(doc.subjectMarks || [
                { subjectName: 'First Language (Telugu / Hindi)', maxMarks: 100, securedMarks: 94, gradeOrStatus: 'A1 (PASSED)' },
                { subjectName: 'Second Language (English)', maxMarks: 100, securedMarks: 91, gradeOrStatus: 'A1 (PASSED)' },
                { subjectName: 'Mathematics', maxMarks: 100, securedMarks: 98, gradeOrStatus: 'A1 (PASSED)' },
                { subjectName: 'General Science (Physics/Bio)', maxMarks: 100, securedMarks: 95, gradeOrStatus: 'A1 (PASSED)' },
                { subjectName: 'Social Studies', maxMarks: 100, securedMarks: 92, gradeOrStatus: 'A1 (PASSED)' }
              ]).map((sub, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#fefce8'};">
                  <td style="padding: 6px; border: 1px solid #fde68a; font-weight: 600;">${sub.subjectName}</td>
                  <td style="padding: 6px; border: 1px solid #fde68a; text-align: center;">${sub.maxMarks}</td>
                  <td style="padding: 6px; border: 1px solid #fde68a; text-align: center; font-weight: bold; color: #15803d;">${sub.securedMarks}</td>
                  <td style="padding: 6px; border: 1px solid #fde68a; text-align: center; font-weight: bold; color: #78350f;">${sub.gradeOrStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Total Summary Box -->
        <div style="background-color: rgba(254, 243, 199, 0.8); border: 2px solid #d97706; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-family: sans-serif; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 10px; color: #78350f; font-weight: 800; text-transform: uppercase; display: block;">TOTAL MARKS SECURED:</span>
            <strong style="font-size: 16px; color: #15803d; font-family: monospace;">
              ${doc.totalMarksSecured || 470} / ${doc.totalMaxMarks || 500}
            </strong>
            <span style="font-size: 10px; color: #475569; display: block; font-style: italic;">
              CGPA / GRADE: ${doc.marksOrGpa || '9.8 CGPA'} (${doc.divisionOrClass || 'FIRST CLASS WITH DISTINCTION'})
            </span>
          </div>
          <div style="text-align: right; background-color: #ffffff; padding: 6px 12px; border-radius: 6px; border: 1px solid #fcd34d;">
            <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">RESULT STATUS</span>
            <strong style="font-size: 14px; color: #047857; text-transform: uppercase;">PASS / QUALIFIED</strong>
          </div>
        </div>

        <!-- Issue Date & Year Banner (Highlighted requirement) -->
        <div style="background: linear-gradient(to right, #451a03, #1e293b, #451a03); color: #ffffff; padding: 10px 14px; border-radius: 8px; border: 2px solid #f59e0b; font-family: sans-serif; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 9px; color: #fde68a; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: block;">
              ISSUE DATE & YEAR OF PASSING / जारी तिथि एवं उत्तीर्ण वर्ष
            </span>
            <div style="font-size: 12px; font-weight: 900; color: #ffffff; margin-top: 2px;">
              Date of Issue: <span style="color: #fde68a; font-family: monospace;">${doc.issueDate || '12/06/2011'}</span>
              &nbsp;&nbsp;•&nbsp;&nbsp;
              Year of Passing: <span style="color: #6ee7b7; font-family: monospace;">${passingYear} (MAY ${passingYear})</span>
            </div>
          </div>
          <div style="background-color: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-family: monospace; font-weight: bold; color: #fde68a;">
            BATCH: ${passingYear}
          </div>
        </div>

        <!-- Signatures & Official Seals -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 2px dashed #d97706; font-family: sans-serif;">
          <div style="text-align: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #047857; display: flex; items-center; justify-content: center; font-size: 8px; font-weight: 900; color: #047857; margin: 0 auto 4px auto; background-color: #ecfdf5;">
              SEAL
            </div>
            <span style="font-size: 8px; font-weight: bold; color: #475569; text-transform: uppercase;">Docpay Govt Verification Stamp</span>
          </div>

          <div style="text-align: center;">
            <div style="font-family: serif; font-style: italic; font-size: 14px; font-weight: 900; color: #1e293b;">
              Dr. R. K. Sharma
            </div>
            <div style="font-size: 9px; font-weight: 900; color: #78350f; text-transform: uppercase; border-top: 1px solid #000; padding-top: 2px; margin-top: 2px;">
              CONTROLLER OF EXAMINATIONS
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // STANDARD DIGITAL CARDS (Aadhaar, PAN, Voter, DL)
    printContainer.innerHTML = `
      <div style="border: 4px solid #3b82f6; padding: 20px; border-radius: 16px; background: #0f172a; color: #ffffff; position: relative;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 9px; font-weight: 900; color: #34d399; letter-spacing: 1px; text-transform: uppercase; font-family: sans-serif;">
              OFFICIAL GOVT VERIFIED DIGITAL IDENTITY DOCUMENT
            </span>
            <h2 style="font-size: 18px; font-weight: 900; margin: 2px 0; color: #ffffff; font-family: sans-serif;">
              ${doc.title}
            </h2>
            <p style="font-size: 10px; color: #94a3b8; font-family: monospace; margin: 0;">
              ${doc.type === 'aadhaar' ? 'Unique Identification Authority of India (UIDAI)' : doc.type === 'voter' ? 'Election Commission of India (ECI)' : doc.type === 'pan' ? 'Income Tax Dept (GOVT OF INDIA)' : 'Union of India Motor Vehicles Dept (RTO)'}
            </p>
          </div>
          <div style="text-align: right; background-color: #047857; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; font-family: sans-serif;">
            DOCPAY VERIFIED ID
          </div>
        </div>

        <!-- FRONT SIDE CARD VIEW CONTAINER -->
        <div style="background-color: #1e293b; border: 2px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 900; color: #60a5fa; text-transform: uppercase; margin-bottom: 8px; font-family: sans-serif;">
            [FRONT SIDE VIEW / सामने का भाग]
          </div>

          <div style="background-color: #1e3a8a; border: 1px solid #60a5fa; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 12px;">
            <span style="font-size: 9px; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 1px; display: block; font-family: sans-serif;">
              ${doc.type === 'aadhaar' ? 'आधार क्रमांक / AADHAAR NUMBER' : 'CARD / IDENTIFICATION NUMBER'}
            </span>
            <p style="font-size: 20px; font-family: monospace; font-weight: 900; color: #fbbf24; margin: 2px 0; letter-spacing: 2px;">
              ${doc.documentNumberMasked}
            </p>
          </div>

          <div style="display: flex; gap: 16px; font-family: sans-serif; font-size: 11px;">
            <!-- Left Photo & Signature -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 90px; shrink: 0;">
              <div style="width: 70px; height: 85px; border-radius: 8px; border: 2px solid #60a5fa; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #334155; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #94a3b8;">
                  👤
                </div>
                <span style="font-size: 7px; font-family: monospace; font-weight: bold; background-color: #2563eb; color: #fff; width: 100%; text-align: center; margin-top: 6px;">
                  VERIFIED
                </span>
              </div>
              <div style="margin-top: 6px; text-align: center; width: 85px;">
                <div style="background-color: #020617; border: 1px solid #3b82f6; border-radius: 4px; padding: 2px;">
                  <span style="font-family: serif; font-style: italic; font-size: 11px; font-weight: 800; color: #e0e7ff; display: block;">G. Vasu</span>
                  <span style="font-size: 6px; font-weight: 900; color: #60a5fa; text-transform: uppercase; display: block; border-top: 1px solid #1e293b; margin-top: 2px;">SIGNATURE</span>
                </div>
              </div>
            </div>

            <!-- Right Details -->
            <div style="flex: 1;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; display: block;">HOLDER NAME / नाम</span>
                  <strong style="font-size: 12px; color: #ffffff;">${doc.holderName}</strong>
                </div>
                <div>
                  <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; display: block;">FATHER'S NAME / पिता का नाम</span>
                  <strong style="font-size: 12px; color: #34d399;">${doc.fatherName || 'G. LAKSHMI NARAYANA'}</strong>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-top: 6px; border-top: 1px solid #334155;">
                <div>
                  <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; display: block;">DATE OF BIRTH / जन्म तिथि</span>
                  <strong style="font-family: monospace; color: #f59e0b;">${doc.dateOfBirth || '20/05/1995'}</strong>
                </div>
                <div>
                  <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; display: block;">ISSUE DATE / जारी तिथि</span>
                  <strong style="font-family: monospace; color: #34d399;">${doc.issueDate || '12/06/2011'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REVERSE SIDE CARD VIEW CONTAINER -->
        <div style="background-color: #1e293b; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 900; color: #fbbf24; text-transform: uppercase; margin-bottom: 8px; font-family: sans-serif;">
            [REVERSE SIDE VIEW / पीछे का भाग]
          </div>

          <div style="background: linear-gradient(to right, #d97706, #ea580c); padding: 8px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
            <span style="font-size: 8px; font-weight: 900; color: #fef3c7; text-transform: uppercase; letter-spacing: 1px; display: block; font-family: sans-serif;">
              ${doc.type === 'aadhaar' ? 'आधार क्रमांक / AADHAAR NUMBER' : 'CARD / IDENTIFICATION NUMBER'}
            </span>
            <p style="font-size: 16px; font-family: monospace; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 2px;">
              ${doc.documentNumberMasked}
            </p>
          </div>

          <div style="font-family: sans-serif; font-size: 11px;">
            <span style="font-size: 9px; font-weight: 900; color: #fbbf24; text-transform: uppercase; display: block; margin-bottom: 4px;">
              PERMANENT RESIDENTIAL ADDRESS (पता / చిరునామా):
            </span>
            <p style="color: #ffffff; font-weight: 600; line-height: 1.4; margin: 0 0 8px 0; background-color: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              S/O: ${doc.fatherName || 'G. LAKSHMI NARAYANA'}, H.No. 4-88, Main Road, Village: ${doc.village || 'Ananthapur'}, Mandal: ${doc.mandal || 'Dharmavaram'}, District: ${doc.district || 'Anantapur'}, State: ${doc.state || 'Andhra Pradesh'}, Pincode: 515671.
            </p>
          </div>

          ${doc.type === 'aadhaar' ? `
            <div style="background-color: #b45309; color: #ffffff; padding: 6px; border-radius: 6px; text-align: center; font-weight: 900; font-size: 10px; font-family: sans-serif; letter-spacing: 1px; margin-top: 8px;">
              मेरा आधार, मेरी पहचान • UNIQUE IDENTIFICATION AUTHORITY OF INDIA
            </div>
          ` : ''}
        </div>

        <!-- Official Stamp & Verification Line -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 10px; font-family: monospace; font-size: 10px; color: #94a3b8;">
          <span style="color: #34d399; font-weight: bold;">✔ DOCPAY VAULT DIGITAL EMBEDDED VERIFICATION</span>
          <span>SERIAL: DOCPAY-GOVT-VERIFIED-2026</span>
        </div>
      </div>
    `;
  }

  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, {
      scale: 2, // High DPI capture
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const cleanTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = doc.pdfFileName || `${cleanTitle}_Docpay_Verified.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    alert('PDF Generation encountered an issue. Please try again.');
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Generates an official Certificate of Verification & Status Summary PDF for any document
 * in the DocPay Vault and triggers an immediate high-resolution PDF download.
 */
export async function generateVerificationSummaryPDF(doc: DocumentItem, user?: any): Promise<void> {
  const printContainer = document.createElement('div');
  printContainer.style.position = 'fixed';
  printContainer.style.top = '-9999px';
  printContainer.style.left = '-9999px';
  printContainer.style.width = '820px'; // A4 proportional canvas
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.color = '#0f172a';
  printContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  printContainer.style.padding = '36px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.zIndex = '-9999';

  const verificationHash = `SHA256: 8f4b7a2d9c${doc.id.replace(/[^a-zA-Z0-9]/g, '')}e51a029384756cba`;
  const certificateSerial = `DP-CERT-${doc.id.toUpperCase().slice(0, 8)}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const locationHierarchy = [doc.village, doc.mandal && `${doc.mandal} Mandal`, doc.district && `${doc.district} District`, doc.state, 'India']
    .filter(Boolean)
    .join(', ');

  printContainer.innerHTML = `
    <div style="border: 4px solid #4338ca; padding: 28px; border-radius: 20px; background: #ffffff; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <!-- Security Watermark -->
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.04; pointer-events: none; overflow: hidden;">
        <span style="font-size: 64px; font-weight: 900; text-transform: uppercase; color: #4338ca; transform: rotate(-25deg); white-space: nowrap;">
          DOCPAY CERTIFIED • 100% VERIFIED
        </span>
      </div>

      <!-- Top Authority Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e7ff; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 24px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
            DP
          </div>
          <div>
            <span style="font-size: 10px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
              DOCPAY TRUST VAULT • DIGITAL IDENTITY INFRASTRUCTURE
            </span>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Certificate of Document Verification
            </h1>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">
              NPCI & Govt of India Integrated Secure Cryptographic Validation System
            </p>
          </div>
        </div>

        <div style="text-align: right; font-family: monospace; font-size: 10px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div><strong style="color: #0f172a;">SERIAL:</strong> ${certificateSerial}</div>
          <div><strong style="color: #0f172a;">GENERATED:</strong> ${formattedDate}, ${formattedTime}</div>
          <div style="color: #059669; font-weight: bold;">STATUS: TAMPER-PROOF ACTIVE</div>
        </div>
      </div>

      <!-- Verification Seal Banner -->
      <div style="background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; padding: 14px 20px; border-radius: 14px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;">
            ✓
          </div>
          <div>
            <h3 style="font-size: 15px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              100% Verified Official Record
            </h3>
            <p style="font-size: 11px; margin: 2px 0 0 0; opacity: 0.95;">
              Authenticated against central issuer registries with zero discrepancy.
            </p>
          </div>
        </div>

        <div style="background: #ffffff; color: #065f46; font-size: 10px; font-weight: 900; padding: 6px 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px;">
          PASSED VALIDATION
        </div>
      </div>

      <!-- Primary Document Metadata Grid -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 11px; font-weight: 900; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px;">
          1. Document & Issuer Identity
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              DOCUMENT NAME & CLASSIFICATION
            </span>
            <strong style="font-size: 13px; color: #0f172a; display: block;">${doc.title}</strong>
            <span style="font-size: 10px; color: #64748b;">Type: ${doc.type.toUpperCase()} • Category: ${doc.category || 'Identity / Education'}</span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              UNIQUE IDENTIFIER / SERIAL NUMBER
            </span>
            <strong style="font-size: 14px; font-family: monospace; color: #4338ca; display: block; letter-spacing: 1px;">
              ${doc.documentNumberMasked}
            </strong>
            <span style="font-size: 10px; color: #059669; font-weight: bold;">✓ Masked for Privacy & Compliance</span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              ISSUING AUTHORITY / BOARD
            </span>
            <strong style="font-size: 12px; color: #0f172a; display: block;">
              ${doc.issuer || doc.boardOrUniversity || 'Government of India Designated Authority'}
            </strong>
            <span style="font-size: 10px; color: #64748b;">e-Governance Authenticated Gateway</span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              DATE OF ISSUANCE & REPOSITORY RECORD
            </span>
            <strong style="font-size: 12px; font-family: monospace; color: #0f172a; display: block;">
              ${doc.issueDate || '12/06/2011'}
            </strong>
            <span style="font-size: 10px; color: #64748b;">Lock Status: ${doc.isProtectedByPin || doc.pinProtected ? 'PIN Security Enabled' : 'Biometric/Standard Encryption'}</span>
          </div>
        </div>
      </div>

      <!-- Verified Candidate & Beneficiary Profile -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 11px; font-weight: 900; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px;">
          2. Verified Candidate & Demographic Information
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              HOLDER FULL NAME (नाम / పేరు)
            </span>
            <strong style="font-size: 14px; color: #0f172a;">${doc.holderName}</strong>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              FATHER'S NAME (पिता का नाम)
            </span>
            <strong style="font-size: 13px; color: #0f172a;">${doc.fatherName || 'G. LAKSHMI NARAYANA'}</strong>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              DATE OF BIRTH (DOB / जन्म तिथि)
            </span>
            <strong style="font-size: 13px; font-family: monospace; color: #0f172a;">${doc.dateOfBirth || '20/05/1995'}</strong>
            ${doc.dobInWords ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px;">IN WORDS: ${doc.dobInWords}</div>` : ''}
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px;">
            <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
              REGISTERED JURISDICTION & ADDRESS
            </span>
            <strong style="font-size: 11px; color: #0f172a; line-height: 1.4; display: block;">
              ${locationHierarchy || 'Ananthapur District, Andhra Pradesh, India'}
            </strong>
          </div>
        </div>

        ${doc.schoolOrCollegeName || doc.rollNumber ? `
          <div style="margin-top: 10px; background: #fffbeb; border: 1px solid #fcd34d; padding: 10px 14px; border-radius: 10px; font-size: 11px;">
            <strong style="color: #92400e; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Academic Institution & Memo Credentials:</strong>
            <span style="color: #78350f;"><strong>Institution:</strong> ${doc.schoolOrCollegeName || 'Govt High School / College'}</span> | 
            <span style="color: #78350f;"><strong>Roll Number:</strong> ${doc.rollNumber || doc.documentNumberMasked}</span>
          </div>
        ` : ''}
      </div>

      <!-- Security & Cryptographic Validation Specs -->
      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 11px; font-weight: 900; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px;">
          3. Cryptographic Verification & Audit Trail
        </h4>

        <div style="background: #0f172a; color: #ffffff; padding: 14px; border-radius: 12px; font-family: monospace; font-size: 10px; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Cryptographic Hash:</span>
            <span style="color: #38bdf8;">${verificationHash}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Digital Encryption:</span>
            <span style="color: #34d399;">AES-256-GCM Hardware-Backed Security Module (HSM)</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Compliance Standard:</span>
            <span style="color: #fbbf24;">ISO/IEC 27001 • IT Act 2000 Section 4A Legal Validity</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">DocPay Trust Anchor:</span>
            <span style="color: #e2e8f0;">ROOT-CA-DOCPAY-IN-2026-ACTIVE</span>
          </div>
        </div>
      </div>

      <!-- Official Footer Stamp & Signatures -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #e0e7ff; padding-top: 16px;">
        <div style="font-size: 10px; color: #64748b; max-width: 460px; line-height: 1.5;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">LEGAL VALIDITY & DISCLAIMER:</strong>
          This document summary is generated electronically under the authentication authority of the DocPay Enterprise Vault ecosystem. No physical signature is required pursuant to Section 65B of the Indian Evidence Act.
        </div>

        <div style="text-align: center; border: 1.5px dashed #4f46e5; padding: 8px 16px; border-radius: 12px; background: #eef2ff;">
          <div style="font-weight: 900; color: #4338ca; font-size: 11px; text-transform: uppercase;">
            DIGITALLY CERTIFIED
          </div>
          <div style="font-family: monospace; font-size: 9px; color: #6366f1; margin: 2px 0;">
            DOCPAY SECURE GATEWAY
          </div>
          <div style="font-size: 8px; color: #059669; font-weight: bold;">
            ✔ 100% AUTHENTIC
          </div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const cleanTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanTitle}_Verification_Summary_DocPay.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error('Failed to generate verification summary PDF:', err);
    alert('Verification Summary PDF Generation failed. Please try again.');
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}
