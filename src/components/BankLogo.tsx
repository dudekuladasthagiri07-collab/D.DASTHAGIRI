import React from 'react';
import { Building2 } from 'lucide-react';

interface BankLogoProps {
  bankName: string;
  ifscCode?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadgeText?: boolean;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  bankName,
  ifscCode,
  size = 'md',
  className = '',
  showBadgeText = false,
}) => {
  const name = (bankName || '').toLowerCase();
  const ifsc = (ifscCode || '').toLowerCase();

  // Size mappings
  const sizeClasses = {
    xs: 'w-7 h-7 min-w-[28px] text-[10px]',
    sm: 'w-9 h-9 min-w-[36px] text-xs',
    md: 'w-11 h-11 min-w-[44px] text-sm',
    lg: 'w-14 h-14 min-w-[56px] text-base',
    xl: 'w-16 h-16 min-w-[64px] text-lg',
  }[size];

  const svgSizes = {
    xs: 20,
    sm: 24,
    md: 28,
    lg: 36,
    xl: 42,
  }[size];

  // Bank detection keys
  const isSbi = name.includes('state bank') || name.includes('sbi') || ifsc.startsWith('sbin');
  const isHdfc = name.includes('hdfc') || ifsc.startsWith('hdfc');
  const isIcici = name.includes('icici') || ifsc.startsWith('icic');
  const isAxis = name.includes('axis') || ifsc.startsWith('axis');
  const isPnb = name.includes('punjab national') || name.includes('pnb') || ifsc.startsWith('punb');
  const isBob = name.includes('baroda') || name.includes('bob') || ifsc.startsWith('barb');
  const isCanara = name.includes('canara') || ifsc.startsWith('cnrb');
  const isUnion = name.includes('union bank') || ifsc.startsWith('ubin');
  const isBoi = name.includes('bank of india') || ifsc.startsWith('bkid');
  const isIndianBank = (name.includes('indian bank') && !name.includes('overseas')) || ifsc.startsWith('idib');
  const isIob = name.includes('indian overseas') || name.includes('iob') || ifsc.startsWith('ioba');
  const isCentral = name.includes('central bank') || ifsc.startsWith('cbin');
  const isUco = name.includes('uco') || ifsc.startsWith('ucba');
  const isMaharashtra = name.includes('maharashtra') || ifsc.startsWith('mahb');
  const isPunjabSind = name.includes('punjab & sind') || name.includes('punjab and sind') || ifsc.startsWith('psib');

  const isKotak = name.includes('kotak') || ifsc.startsWith('kkbk');
  const isIndusind = name.includes('indusind') || ifsc.startsWith('indb');
  const isYes = name.includes('yes bank') || ifsc.startsWith('yesb');
  const isIdfc = name.includes('idfc') || ifsc.startsWith('idfb');
  const isFederal = name.includes('federal') || ifsc.startsWith('fdrl');
  const isSouthIndian = name.includes('south indian') || ifsc.startsWith('sibl');
  const isKarurVysya = name.includes('karur') || ifsc.startsWith('kvbl');
  const isCityUnion = name.includes('city union') || ifsc.startsWith('ciub');
  const isBandhan = name.includes('bandhan') || ifsc.startsWith('bdbl');
  const isRbl = name.includes('rbl') || ifsc.startsWith('ratn');
  const isJak = name.includes('j&k') || name.includes('jammu') || ifsc.startsWith('jaka');
  const isKarnataka = name.includes('karnataka bank') || ifsc.startsWith('karb');

  const isIppb = name.includes('india post') || name.includes('ippb') || ifsc.startsWith('ipos');
  const isPaytm = name.includes('paytm') || ifsc.startsWith('pytm');
  const isAirtel = name.includes('airtel') || ifsc.startsWith('airp');
  const isJio = name.includes('jio') || ifsc.startsWith('jiop');
  const isFino = name.includes('fino') || ifsc.startsWith('fino');

  const isAu = name.includes('au small') || name.includes('au bank') || ifsc.startsWith('aubl');
  const isEquitas = name.includes('equitas') || ifsc.startsWith('esfb');
  const isUjjivan = name.includes('ujjivan') || ifsc.startsWith('ujvn');
  const isJana = name.includes('jana') || ifsc.startsWith('jsfb');

  const isRrb = name.includes('grameena') || name.includes('gramin') || name.includes('rrb') || ifsc.startsWith('apgb') || ifsc.startsWith('pkgb') || ifsc.startsWith('tgbx') || ifsc.startsWith('klgb');

  // Render specific SVG logo or styled brand emblem
  const renderLogoContent = () => {
    if (isSbi) {
      // SBI Official Dynamic Keyhole Logo
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#00b4ec] via-[#0082c8] to-[#003087] rounded-2xl flex flex-col items-center justify-center p-1 shadow-md border border-[#0091d9]/50 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg className="w-full h-full max-w-[88%] max-h-[88%]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" fill="url(#sbiGrad)" />
            <defs>
              <linearGradient id="sbiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00b4ec" />
                <stop offset="100%" stopColor="#002d72" />
              </linearGradient>
            </defs>
            {/* White Keyhole Emblem */}
            <circle cx="50" cy="46" r="20" fill="#ffffff" />
            <rect x="43.5" y="46" width="13" height="42" fill="#ffffff" />
            <circle cx="50" cy="46" r="9" fill="#002d72" />
          </svg>
          <span className="text-[7.5px] font-black font-sans text-white leading-none tracking-wider drop-shadow-xs -mt-1 font-mono uppercase">
            SBI
          </span>
        </div>
      );
    }

    if (isHdfc) {
      // HDFC Blue & Red Box Logo
      return (
        <div className="w-full h-full bg-[#004c8f] rounded-2xl flex items-center justify-center p-1 shadow-md border border-[#002e6c] relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="18" fill="#004c8f" />
            {/* Outer Red Frame */}
            <rect x="8" y="8" width="84" height="84" stroke="#ed1c24" strokeWidth="14" fill="none" rx="10" />
            {/* Center Blue Crossbars forming HDFC emblem */}
            <rect x="36" y="36" width="28" height="28" fill="#ffffff" />
            <rect x="8" y="43" width="84" height="14" fill="#004c8f" />
            <rect x="43" y="8" width="14" height="84" fill="#004c8f" />
            <rect x="38" y="38" width="24" height="24" fill="#004c8f" />
          </svg>
        </div>
      );
    }

    if (isIcici) {
      // ICICI Orange & Red Flame 'i' Logo
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#f37021] via-[#e65c00] to-[#a01018] rounded-2xl flex items-center justify-center p-1 shadow-md border border-amber-600/60 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            {/* White Stylized 'i' Swoosh */}
            <path d="M18 18 H78 V38 H52 V82 H22 Z" fill="#ffffff" />
            <circle cx="68" cy="66" r="14" fill="#ffffff" />
            <path d="M30 30 L68 30 L50 68 Z" fill="#f37021" />
            <circle cx="68" cy="66" r="7" fill="#f37021" />
          </svg>
        </div>
      );
    }

    if (isAxis) {
      // Axis Maroon 'A' Chevron Logo
      return (
        <div className="w-full h-full bg-[#861242] rounded-2xl flex items-center justify-center p-1 shadow-md border border-[#5c0a2d] relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M50 12 L88 82 H66 L50 48 L34 82 H12 Z" fill="#ffffff" />
            <path d="M50 36 L66 70 H34 Z" fill="#861242" />
          </svg>
        </div>
      );
    }

    if (isBob) {
      // Bank of Baroda Orange Sun
      return (
        <div className="w-full h-full bg-[#f26522] rounded-2xl flex items-center justify-center p-1 shadow-md border border-orange-700/60 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" fill="#ffffff" opacity="0.15" />
            <path d="M22 78 Q50 18 78 78 Q50 60 22 78 Z" fill="#ffffff" />
            <path d="M32 72 Q50 32 68 72" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="30" r="6" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isPnb) {
      // PNB Maroon & Gold Emblem
      return (
        <div className="w-full h-full bg-[#800000] rounded-2xl flex flex-col items-center justify-center p-1 shadow-md border border-red-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#f59e0b" strokeWidth="6" fill="none" />
            <path d="M30 25 H52 C68 25 74 36 74 48 C74 60 66 70 52 70 H44 V82 H30 V25 Z" fill="#f59e0b" />
            <circle cx="52" cy="48" r="10" fill="#800000" />
            <rect x="44" y="36" width="8" height="24" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isCanara) {
      // Canara Twin Triangles Logo
      return (
        <div className="w-full h-full bg-[#0084c8] rounded-2xl flex items-center justify-center p-1 shadow-md border border-sky-800 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <polygon points="18,82 50,18 82,82" fill="#ffcb05" />
            <polygon points="34,82 50,52 66,82" fill="#0084c8" />
            <polygon points="28,28 50,72 72,28" fill="#ffffff" opacity="0.95" />
          </svg>
        </div>
      );
    }

    if (isKotak) {
      // Kotak Red & Globe Logo
      return (
        <div className="w-full h-full bg-[#d0021b] rounded-2xl flex items-center justify-center p-1 shadow-md border border-red-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="9" fill="none" />
            <path d="M26 50 H74 M50 26 V74" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
            <path d="M32 32 L68 68 M68 32 L32 68" stroke="#ffffff" strokeWidth="5" strokeOpacity="0.5" />
          </svg>
        </div>
      );
    }

    if (isUnion) {
      // Union Bank Interlocking U Emblem
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#003399] via-[#002266] to-[#e30613] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M22 25 V58 C22 74 34 82 50 82 C66 82 78 74 78 58 V25" stroke="#ffffff" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M36 25 V54 C36 64 42 68 50 68 C58 68 64 64 64 54 V25" stroke="#e30613" strokeWidth="8" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    if (isBoi) {
      // Bank of India Star
      return (
        <div className="w-full h-full bg-[#003b73] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <polygon points="50,12 64,38 90,38 69,55 77,82 50,65 23,82 31,55 10,38 36,38" fill="#f59e0b" />
            <circle cx="50" cy="48" r="12" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      );
    }

    if (isIndianBank || isIob) {
      // Indian Bank / IOB Arch Emblem
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#003399] to-[#001f5c] rounded-2xl flex items-center justify-center p-1 shadow-md border border-indigo-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M18 78 Q50 12 82 78 M30 78 Q50 30 70 78 M40 78 Q50 48 60 78" stroke="#f59e0b" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="22" r="6" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isCentral) {
      // Central Bank of India Emblem
      return (
        <div className="w-full h-full bg-[#006680] rounded-2xl flex items-center justify-center p-1 shadow-md border border-cyan-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="8" fill="none" />
            <circle cx="50" cy="35" r="10" fill="#ffffff" />
            <rect x="44" y="35" width="12" height="35" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isUco) {
      // UCO Bank Emblem
      return (
        <div className="w-full h-full bg-[#003366] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill="#f59e0b" />
            <circle cx="50" cy="50" r="16" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isMaharashtra) {
      // Bank of Maharashtra Emblem
      return (
        <div className="w-full h-full bg-[#006633] rounded-2xl flex items-center justify-center p-1 shadow-md border border-emerald-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M50 15 L80 40 V80 H20 V40 Z" fill="#f59e0b" />
            <rect x="36" y="45" width="28" height="35" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isPunjabSind) {
      // Punjab & Sind Bank Emblem
      return (
        <div className="w-full h-full bg-[#8b0000] rounded-2xl flex items-center justify-center p-1 shadow-md border border-red-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="6" fill="none" />
            <path d="M50 18 V82 M25 50 H75" stroke="#f59e0b" strokeWidth="8" />
          </svg>
        </div>
      );
    }

    if (isIndusind) {
      // IndusInd Bank Bull Emblem
      return (
        <div className="w-full h-full bg-[#800020] rounded-2xl flex items-center justify-center p-1 shadow-md border border-rose-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M20 65 Q35 25 60 30 Q80 35 85 55 Q70 50 60 65 Q40 75 20 65 Z" fill="#f59e0b" />
            <circle cx="70" cy="35" r="5" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isYes) {
      // YES Bank
      return (
        <div className="w-full h-full bg-[#0054a6] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-800 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M15 30 Q50 10 85 30" stroke="#e30613" strokeWidth="10" strokeLinecap="round" fill="none" />
            <text x="50" y="68" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="28" fontFamily="sans-serif">
              YES
            </text>
          </svg>
        </div>
      );
    }

    if (isIdfc) {
      // IDFC FIRST Bank
      return (
        <div className="w-full h-full bg-[#9a0036] rounded-2xl flex items-center justify-center p-1 shadow-md border border-rose-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <rect x="20" y="20" width="28" height="28" rx="6" fill="#ffffff" />
            <rect x="52" y="20" width="28" height="28" rx="6" fill="#f37021" />
            <rect x="20" y="52" width="28" height="28" rx="6" fill="#f37021" />
            <rect x="52" y="52" width="28" height="28" rx="6" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isFederal) {
      // Federal Bank
      return (
        <div className="w-full h-full bg-[#003366] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M22 25 H78 V42 H42 V54 H70 V70 H42 V82 H22 Z" fill="#f59e0b" />
          </svg>
        </div>
      );
    }

    if (isSouthIndian) {
      // South Indian Bank
      return (
        <div className="w-full h-full bg-[#800000] rounded-2xl flex items-center justify-center p-1 shadow-md border border-red-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M75 30 Q25 20 25 50 Q25 80 75 70" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );
    }

    if (isPaytm) {
      // Paytm Light Blue Logo
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#00baf2] to-[#008cc9] rounded-2xl flex items-center justify-center p-1 shadow-md border border-sky-600 relative overflow-hidden group-hover:scale-105 transition-transform">
          <div className="font-black text-[#002e6d] font-sans text-xs tracking-tighter italic drop-shadow-xs">
            Paytm
          </div>
        </div>
      );
    }

    if (isIppb) {
      // India Post Payments Bank
      return (
        <div className="w-full h-full bg-[#d32f2f] rounded-2xl flex flex-col items-center justify-center p-1 shadow-md border border-red-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M15 35 L85 35 L50 75 Z" fill="#f59e0b" />
            <text x="50" y="30" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="20" fontFamily="sans-serif">
              POST
            </text>
          </svg>
        </div>
      );
    }

    if (isAirtel) {
      // Airtel Payments Bank
      return (
        <div className="w-full h-full bg-[#e40000] rounded-2xl flex items-center justify-center p-1 shadow-md border border-red-800 relative overflow-hidden group-hover:scale-105 transition-transform">
          <span className="font-black text-white font-sans text-lg lowercase italic tracking-tighter">airtel</span>
        </div>
      );
    }

    if (isJio) {
      // Jio Payments Bank
      return (
        <div className="w-full h-full bg-[#0f52ba] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0f52ba] font-black text-xs">
            Jio
          </div>
        </div>
      );
    }

    if (isFino) {
      // Fino Payments Bank
      return (
        <div className="w-full h-full bg-[#5b2c6f] rounded-2xl flex items-center justify-center p-1 shadow-md border border-purple-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <span className="font-black text-[#f37021] font-sans text-xs uppercase tracking-wider">fino</span>
        </div>
      );
    }

    if (isAu) {
      // AU Small Finance Bank
      return (
        <div className="w-full h-full bg-[#4a154b] rounded-2xl flex items-center justify-center p-1 shadow-md border border-purple-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <span className="font-black text-[#f37023] font-sans text-sm tracking-tight">AU</span>
        </div>
      );
    }

    if (isEquitas) {
      // Equitas Small Finance Bank
      return (
        <div className="w-full h-full bg-[#00529b] rounded-2xl flex items-center justify-center p-1 shadow-md border border-blue-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M30 70 Q50 20 70 70" stroke="#10b981" strokeWidth="10" fill="none" />
            <circle cx="50" cy="45" r="8" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (isUjjivan) {
      // Ujjivan Small Finance Bank
      return (
        <div className="w-full h-full bg-[#1a365d] rounded-2xl flex items-center justify-center p-1 shadow-md border border-slate-900 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="30" fill="#f97316" />
            <path d="M50 10 V90 M10 50 H90" stroke="#ffffff" strokeWidth="6" />
          </svg>
        </div>
      );
    }

    if (isRrb) {
      // Regional Rural Bank / Grameena
      return (
        <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl flex flex-col items-center justify-center p-1 shadow-md border border-emerald-950 relative overflow-hidden group-hover:scale-105 transition-transform">
          <svg width={svgSizes} height={svgSizes} viewBox="0 0 100 100" fill="none">
            <path d="M15 75 Q50 35 85 75 Z" fill="#f59e0b" />
            <circle cx="50" cy="35" r="12" fill="#fef08a" />
          </svg>
          <span className="text-[7.5px] font-black text-amber-200 font-mono tracking-tighter -mt-1">GRAMIN</span>
        </div>
      );
    }

    // Default Fallback High-Quality Metallic Bank Vault Badge
    const bankInitials = name
      .split(' ')
      .filter((w) => w.length > 0 && !['of', 'and', '&', 'bank', 'ltd', 'limited'].includes(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'BK';

    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-slate-800 to-slate-950 rounded-2xl flex flex-col items-center justify-center p-1 shadow-md border border-indigo-400/40 text-white font-bold relative overflow-hidden group-hover:scale-105 transition-transform">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <Building2 className="w-4 h-4 text-amber-300 mb-0.5 relative z-10" />
        <span className="text-[8.5px] font-mono leading-none font-black tracking-widest text-slate-100 relative z-10 uppercase">
          {bankInitials}
        </span>
      </div>
    );
  };

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${sizeClasses} ${className}`}>
      {renderLogoContent()}
      {showBadgeText && (
        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-black px-1 rounded border border-white shadow-xs">
          RBI
        </span>
      )}
    </div>
  );
};

