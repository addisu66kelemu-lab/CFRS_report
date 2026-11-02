import { ZoneMonthlySubmission, VitalRecord } from '../types';

export function exportZoneSubmissionsToCSV(submissions: ZoneMonthlySubmission[], fileNamePrefix: string = 'የማዕከላዊ_ኢትዮጵያ_ወሳኝ_ኩነቶች'): void {
  const headers = [
    'መለያ_ቁጥር',
    'ዞን_ወይም_ልዩ_ወረዳ',
    'ዓመተ_ምህረት',
    'የወሩ_ስም',
    'ያቀረበው_ኃላፊ',
    'የቀረበበት_ቀን',
    'የወረዳዎች_ቁጥር',
    'የቀበሌዎች_ቁጥር',
    'የልደት_ወቅታዊ',
    'የልደት_የዘገየ',
    'የልደት_ነባር',
    'የሞት_ወቅታዊ',
    'የሞት_የዘገየ',
    'የሞት_ነባር',
    'የጋብቻ_ወቅታዊ',
    'የጋብቻ_የዘገየ',
    'የጋብቻ_ነባር',
    'የፍቺ_ወቅታዊ',
    'የፍቺ_የዘገየ',
    'የፍቺ_ነባር',
    'የጉዲፈቻ_ወቅታዊ',
    'የጉዲፈቻ_የዘገየ',
    'የጉዲፈቻ_ነባር',
    'አጠቃላይ_ወቅታዊ',
    'አጠቃላይ_የዘገየ',
    'አጠቃላይ_ነባር',
    'አጠቃላይ_ድምር',
    'የሪፖርት_ሁኔታ'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = submissions.map(s => {
    const curTotal = (s.birth?.current || 0) + (s.death?.current || 0) + (s.marriage?.current || 0) + (s.divorce?.current || 0) + (s.adoption?.current || 0);
    const lateTotal = (s.birth?.late || 0) + (s.death?.late || 0) + (s.marriage?.late || 0) + (s.divorce?.late || 0) + (s.adoption?.late || 0);
    const backlogTotal = (s.birth?.backlog || 0) + (s.death?.backlog || 0) + (s.marriage?.backlog || 0) + (s.divorce?.backlog || 0) + (s.adoption?.backlog || 0);
    const grandTotal = curTotal + lateTotal + backlogTotal;

    return [
      escapeCSV(s.id),
      escapeCSV(s.zoneName),
      escapeCSV(s.year),
      escapeCSV(s.monthNameAm),
      escapeCSV(s.submittedBy),
      escapeCSV(s.submittedAt),
      escapeCSV(s.reportingWoredasCount),
      escapeCSV(s.reportingKebelesCount),
      escapeCSV(s.birth?.current || 0),
      escapeCSV(s.birth?.late || 0),
      escapeCSV(s.birth?.backlog || 0),
      escapeCSV(s.death?.current || 0),
      escapeCSV(s.death?.late || 0),
      escapeCSV(s.death?.backlog || 0),
      escapeCSV(s.marriage?.current || 0),
      escapeCSV(s.marriage?.late || 0),
      escapeCSV(s.marriage?.backlog || 0),
      escapeCSV(s.divorce?.current || 0),
      escapeCSV(s.divorce?.late || 0),
      escapeCSV(s.divorce?.backlog || 0),
      escapeCSV(s.adoption?.current || 0),
      escapeCSV(s.adoption?.late || 0),
      escapeCSV(s.adoption?.backlog || 0),
      escapeCSV(curTotal),
      escapeCSV(lateTotal),
      escapeCSV(backlogTotal),
      escapeCSV(grandTotal),
      escapeCSV(s.status)
    ].join(',');
  });

  // Include UTF-8 BOM so Excel and tools open Amharic Ethiopic characters perfectly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDetailedRecordsToCSV(records: VitalRecord[], fileNamePrefix: string = 'የግለሰቦች_የወሳኝ_ኩነቶች_ምዝገባ'): void {
  const headers = [
    'የምስክር_ወረቀት_መለያ',
    'የኩነት_ዓይነት',
    'የተከሰተበት_ቀን',
    'የተመዘገበበት_ቀን',
    'የምዝገባ_ሁኔታ',
    'የዘገየበት_ቀናት',
    'ዞን',
    'ወረዳ',
    'ቀበሌ',
    'የተመዝጋቢ_ስም',
    'ጾታ',
    'የዕድሜ_ክልል',
    'የዘገየበት_ምክንያት',
    'የተከፈለ_ክፍያ_ብር'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCSV(r.id),
    escapeCSV(r.eventType),
    escapeCSV(r.eventDate),
    escapeCSV(r.registrationDate),
    escapeCSV(r.registrationType === 'current' ? 'መደበኛ (በወቅቱ)' : 'ዘግይቶ የተመዘገበ'),
    escapeCSV(r.lateDays),
    escapeCSV(r.zone),
    escapeCSV(r.woreda),
    escapeCSV(r.kebele),
    escapeCSV(r.primarySubject),
    escapeCSV(r.gender),
    escapeCSV(r.ageGroup),
    escapeCSV(r.lateReason || 'በህጋዊ የጊዜ ገደብ ውስጥ የተመዘገበ'),
    escapeCSV(r.feePaid)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
