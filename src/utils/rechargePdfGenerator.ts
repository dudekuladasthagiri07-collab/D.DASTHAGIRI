import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MobileRechargeLog } from '../types';

/**
 * Generates an official, high-resolution printable PDF Receipt/Invoice
 * for a Mobile Recharge transaction and triggers browser download.
 */
export async function generateRechargeReceiptPDF(log: MobileRechargeLog): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '750px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  const providerBgColor =
    log.networkProvider === 'Jio'
      ? '#0072bc'
      : log.networkProvider === 'Airtel'
      ? '#e40000'
      : log.networkProvider === 'Vi'
      ? '#d0021b'
      : '#0084c8';

  container.innerHTML = `
    <div style="border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; background: #ffffff; position: relative; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      
      <!-- Top Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="92" height="92" rx="24" fill="#020617" stroke="#F59E0B" stroke-width="2" />
              <rect x="8" y="8" width="84" height="84" rx="20" fill="none" stroke="#38BDF8" stroke-width="1" stroke-dasharray="4 2" opacity="0.4" />
              <path d="M 24 22 H 52 C 72 22 84 34 84 50 C 84 66 72 78 52 78 H 24 V 22 Z" fill="none" stroke="#F59E0B" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M 33 31 H 50 C 62 31 73 39 73 50 C 73 61 62 69 50 69 H 33 V 31 Z" fill="#F59E0B" fill-opacity="0.1" />
              <path d="M 44 22 V 86" stroke="#38BDF8" stroke-width="9" stroke-linecap="round" />
              <path d="M 44 22 H 64 C 76 22 82 31 82 42 C 82 53 74 60 62 60 H 44" fill="none" stroke="#6366F1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M 44 22 H 58" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.8" />
              <circle cx="24" cy="22" r="4.5" fill="#FDE047" />
              <circle cx="44" cy="22" r="5" fill="#38BDF8" />
              <circle cx="44" cy="60" r="4.5" fill="#F59E0B" />
              <circle cx="44" cy="86" r="4.5" fill="#38BDF8" />
            </svg>
            <div>
              <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #1e1b4b; letter-spacing: -0.5px;">
                DocPay
              </h1>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0; font-weight: 600;">
                OFFICIAL MOBILE RECHARGE RECEIPT & INVOICE
              </p>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="background-color: ${log.paymentStatus === 'Success' ? '#10b981' : log.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444'}; color: #ffffff; font-size: 10px; font-weight: 900; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${log.paymentStatus === 'Success' ? '✓ RECHARGE SUCCESSFUL' : log.paymentStatus}
          </span>
          <p style="font-size: 10px; font-family: monospace; color: #64748b; margin: 6px 0 0 0; font-weight: bold;">
            DATE: ${log.rechargeDate}
          </p>
        </div>
      </div>

      <!-- Provider & Mobile Banner -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; border-radius: 12px; padding: 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; tracking-wider: 1px;">
            RECHARGED MOBILE NUMBER
          </span>
          <div style="font-size: 22px; font-family: monospace; font-weight: 900; color: #38bdf8; margin-top: 2px;">
            +91 ${log.mobileNumber}
          </div>
          ${log.contactName ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Name: <strong>${log.contactName}</strong></div>` : ''}
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
          <div style="background-color: ${providerBgColor}; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.3);">
            ${log.networkProvider} (${log.rechargeType.toUpperCase()})
          </div>
          <span style="font-size: 10px; color: #38bdf8; font-family: monospace; margin-top: 6px; font-weight: 800;">
            REF: ${log.referenceNumber}
          </span>
        </div>
      </div>

      <!-- Plan Details Box -->
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; background-color: #f8fafc;">
        <h3 style="font-size: 12px; font-weight: 900; color: #334155; text-transform: uppercase; margin: 0 0 12px 0; border-bottom: 1px border #cbd5e1; padding-bottom: 6px;">
          RECHARGE PLAN BREAKDOWN
        </h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">PLAN NAME</span>
            <strong style="color: #0f172a; font-size: 13px;">${log.planName}</strong>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">CATEGORY</span>
            <strong style="color: #4338ca;">${log.planCategory}</strong>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">PLAN VALIDITY</span>
            <strong style="color: #0f172a; font-family: monospace;">${log.validity}</strong>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">PLAN START DATE</span>
            <strong style="color: #047857; font-family: monospace;">${log.planStartDate}</strong>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">PLAN EXPIRY DATE</span>
            <strong style="color: #b91c1c; font-family: monospace;">${log.planExpiryDate}</strong>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">PAYMENT METHOD</span>
            <strong style="color: #0f172a;">${log.paymentMethod}</strong>
          </div>
        </div>
      </div>

      <!-- Payment Summary Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
            <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Item Description</th>
            <th style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600;">
              ${log.planName} (${log.networkProvider} ${log.rechargeType})
            </td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 700;">
              ₹${log.planAmount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">
              Platform Convenience Fee & Taxes (GST Included)
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #16a34a; font-weight: bold;">
              ₹0.00
            </td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: 900; font-size: 14px; color: #0f172a;">
              TOTAL AMOUNT PAID
            </td>
            <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: 900; font-size: 16px; color: #4338ca;">
              ₹${log.planAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Audit Metadata -->
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px; font-size: 10px; color: #475569; margin-bottom: 20px; font-family: monospace; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div><strong>RECHARGE ID:</strong> ${log.id}</div>
        <div><strong>TRANSACTION ID:</strong> ${log.transactionId}</div>
        <div><strong>OPERATOR REF NO:</strong> ${log.referenceNumber}</div>
        <div><strong>CREATED BY:</strong> ${log.createdBy}</div>
        <div><strong>CREATED ON:</strong> ${log.createdOn}</div>
        <div><strong>LAST UPDATED:</strong> ${log.lastUpdated}</div>
      </div>

      <!-- Footer Stamp -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b;">
        <div>
          <span style="color: #059669; font-weight: 900; display: flex; align-items: center; gap: 4px;">
            ✔ VERIFIED BY DOCPAY TELECOM GATEWAY
          </span>
          <p style="margin: 2px 0 0 0; font-style: italic;">
            This is a computer-generated tax invoice and requires no physical signature.
          </p>
        </div>
        <div style="text-align: right; font-weight: bold; color: #334155;">
          DocPay Digital Vault © 2026
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
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

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Recharge_Receipt_${log.id}_${log.mobileNumber}.pdf`);
  } catch (err) {
    console.error('Failed to generate Recharge PDF:', err);
    alert('Could not generate PDF receipt. Please try again.');
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Export Recharge Logs to Excel / CSV file
 */
export function exportRechargeLogsCSV(logs: MobileRechargeLog[]): void {
  const headers = [
    'Recharge ID',
    'Transaction ID',
    'Mobile Number',
    'Contact Name',
    'Network Provider',
    'Recharge Type',
    'Plan Category',
    'Plan Name',
    'Plan Amount (INR)',
    'Validity',
    'Recharge Date',
    'Plan Start Date',
    'Plan Expiry Date',
    'Payment Method',
    'Payment Status',
    'Recharge Status',
    'Reference Number',
    'Created By',
    'Created On',
    'Remarks',
  ];

  const rows = logs.map((log) => [
    `"${log.id}"`,
    `"${log.transactionId}"`,
    `"${log.mobileNumber}"`,
    `"${log.contactName || ''}"`,
    `"${log.networkProvider}"`,
    `"${log.rechargeType}"`,
    `"${log.planCategory}"`,
    `"${log.planName}"`,
    log.planAmount,
    `"${log.validity}"`,
    `"${log.rechargeDate}"`,
    `"${log.planStartDate}"`,
    `"${log.planExpiryDate}"`,
    `"${log.paymentMethod}"`,
    `"${log.paymentStatus}"`,
    `"${log.rechargeStatus}"`,
    `"${log.referenceNumber}"`,
    `"${log.createdBy}"`,
    `"${log.createdOn}"`,
    `"${log.remarks || ''}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Mobile_Recharge_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
