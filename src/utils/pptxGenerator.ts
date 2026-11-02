import pptxgen from 'pptxgenjs';
import { ZoneMonthlySubmission, ServiceType } from '../types';
import { CENTRAL_ETHIOPIA_ZONES } from '../data/mockDatabase';
import { getCurrentEthiopianDate } from './ethiopianCalendar';

interface GenerateReportOptions {
  submissions: ZoneMonthlySubmission[];
  monthName: string;
  year: number;
  selectedZone: string; // 'all' or zoneName
  selectedService: string; // 'all' or ServiceType
}

export async function generatePowerPointReport({
  submissions,
  monthName,
  year,
  selectedZone,
  selectedService,
}: GenerateReportOptions): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት የወሳኝ ኩነቶች ምዝገባ ኤጀንሲ';
  pptx.company = 'የማዕከላዊ ኢትዮጵያ ክልል አስተዳደር';
  pptx.title = `የወሳኝ ኩነቶች ወርሃዊ የትንታኔ ሪፖርት - ${monthName} ${year} ዓ.ም`;

  // Filter submissions by zone if specified
  const filteredSubmissions = selectedZone === 'all'
    ? submissions
    : submissions.filter(s => s.zoneName === selectedZone);

  // Compute total current, late, and backlog by service
  let totalCurrentBirth = 0, totalLateBirth = 0, totalBacklogBirth = 0;
  let totalCurrentDeath = 0, totalLateDeath = 0, totalBacklogDeath = 0;
  let totalCurrentMarriage = 0, totalLateMarriage = 0, totalBacklogMarriage = 0;
  let totalCurrentDivorce = 0, totalLateDivorce = 0, totalBacklogDivorce = 0;
  let totalCurrentAdoption = 0, totalLateAdoption = 0, totalBacklogAdoption = 0;

  filteredSubmissions.forEach(sub => {
    totalCurrentBirth += sub.birth?.current || 0;
    totalLateBirth += sub.birth?.late || 0;
    totalBacklogBirth += sub.birth?.backlog || 0;

    totalCurrentDeath += sub.death?.current || 0;
    totalLateDeath += sub.death?.late || 0;
    totalBacklogDeath += sub.death?.backlog || 0;

    totalCurrentMarriage += sub.marriage?.current || 0;
    totalLateMarriage += sub.marriage?.late || 0;
    totalBacklogMarriage += sub.marriage?.backlog || 0;

    totalCurrentDivorce += sub.divorce?.current || 0;
    totalLateDivorce += sub.divorce?.late || 0;
    totalBacklogDivorce += sub.divorce?.backlog || 0;

    totalCurrentAdoption += sub.adoption?.current || 0;
    totalLateAdoption += sub.adoption?.late || 0;
    totalBacklogAdoption += sub.adoption?.backlog || 0;
  });

  const serviceRowsData = [
    { type: 'birth' as ServiceType, name: 'የልደት ምዝገባ', current: totalCurrentBirth, late: totalLateBirth, backlog: totalBacklogBirth, limit: 'በ90 ቀናት (የዘገየ: 90ቀን-1ዓመት | ነባር: >1ዓመት)', feeCur: 'ነፃ (0 ብር)', feeLate: '500 ብር' },
    { type: 'death' as ServiceType, name: 'የሞት ምዝገባ', current: totalCurrentDeath, late: totalLateDeath, backlog: totalBacklogDeath, limit: 'እስከ 50 ቀናት (የዘገየ: 50ቀን-1ዓመት | ነባር: >1ዓመት)', feeCur: 'ነፃ (0 ብር)', feeLate: '500 ብር' },
    { type: 'marriage' as ServiceType, name: 'የጋብቻ ምዝገባ', current: totalCurrentMarriage, late: totalLateMarriage, backlog: totalBacklogMarriage, limit: 'በ30 ቀናት (የዘገየ: 31ቀን-1ዓመት | ነባር: >1ዓመት)', feeCur: 'ነፃ (0 ብር)', feeLate: '500 ብር' },
    { type: 'divorce' as ServiceType, name: 'የፍቺ ምዝገባ', current: totalCurrentDivorce, late: totalLateDivorce, backlog: totalBacklogDivorce, limit: 'በ30 ቀናት (የዘገየ: 31ቀን-1ዓመት | ነባር: >1ዓመት)', feeCur: 'ነፃ (0 ብር)', feeLate: '500 ብር' },
    { type: 'adoption' as ServiceType, name: 'የጉዲፈቻ ምዝገባ', current: totalCurrentAdoption, late: totalLateAdoption, backlog: totalBacklogAdoption, limit: 'በ30 ቀናት (የዘገየ: 31ቀን-1ዓመት | ነባር: >1ዓመት)', feeCur: 'ነፃ (0 ብር)', feeLate: '500 ብር' },
  ];

  const totalCurrentAll = totalCurrentBirth + totalCurrentDeath + totalCurrentMarriage + totalCurrentDivorce + totalCurrentAdoption;
  const totalLateAll = totalLateBirth + totalLateDeath + totalLateMarriage + totalLateDivorce + totalLateAdoption;
  const totalBacklogAll = totalBacklogBirth + totalBacklogDeath + totalBacklogMarriage + totalBacklogDivorce + totalBacklogAdoption;
  const totalSumAll = totalCurrentAll + totalLateAll + totalBacklogAll;

  const currentPercent = totalSumAll > 0 ? ((totalCurrentAll / totalSumAll) * 100).toFixed(1) : '0';
  const latePercent = totalSumAll > 0 ? ((totalLateAll / totalSumAll) * 100).toFixed(1) : '0';
  const backlogPercent = totalSumAll > 0 ? ((totalBacklogAll / totalSumAll) * 100).toFixed(1) : '0';
  const totalPenaltyRevenueETB = totalLateAll * 500; // 500 ETB for every late registration

  // Zone Breakdown computation for all 10 zones
  const zoneSummaryList = CENTRAL_ETHIOPIA_ZONES.map(z => {
    const zSubs = filteredSubmissions.filter(s => s.zoneId === z.id);
    let zCur = 0;
    let zLate = 0;
    let zBack = 0;
    zSubs.forEach(s => {
      zCur += ((s.birth?.current || 0) + (s.death?.current || 0) + (s.marriage?.current || 0) + (s.divorce?.current || 0) + (s.adoption?.current || 0));
      zLate += ((s.birth?.late || 0) + (s.death?.late || 0) + (s.marriage?.late || 0) + (s.divorce?.late || 0) + (s.adoption?.late || 0));
      zBack += ((s.birth?.backlog || 0) + (s.death?.backlog || 0) + (s.marriage?.backlog || 0) + (s.divorce?.backlog || 0) + (s.adoption?.backlog || 0));
    });
    const zTotal = zCur + zLate + zBack;
    const zCurRate = zTotal > 0 ? ((zCur / zTotal) * 100).toFixed(1) : '0.0';
    return {
      name: z.name,
      woredas: z.woredasCount,
      current: zCur,
      late: zLate,
      backlog: zBack,
      total: zTotal,
      rate: `${zCurRate}%`
    };
  });

  // Color Palette
  const BG_COLOR = '0A0F1D';
  const CARD_BG = '151E32';
  const TEXT_WHITE = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const CYAN_ACCENT = '06B6D4';
  const EMERALD_ACCENT = '10B981';
  const AMBER_ACCENT = 'F59E0B';
  const BORDER_COLOR = '334155';

  // -------------------------------------------------------------
  // SLIDE 1: አርእስት (TITLE SLIDE)
  // -------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.2,
    fill: { color: CYAN_ACCENT },
  });

  slide1.addText('የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት · የወሳኝ ኩነቶች ምዝገባ ኤጀንሲ', {
    x: 1.0,
    y: 1.3,
    w: 11.33,
    h: 0.5,
    fontSize: 15,
    fontFace: 'Arial',
    color: CYAN_ACCENT,
    bold: true,
  });

  slide1.addText('የወሳኝ ኩነቶች ወርሃዊ የትንታኔ ሪፖርት\n(መደበኛ እና ዘግይቶ የተከናወኑ ምዝገባዎች)', {
    x: 1.0,
    y: 1.9,
    w: 11.33,
    h: 1.7,
    fontSize: 32,
    fontFace: 'Arial',
    color: TEXT_WHITE,
    bold: true,
  });

  slide1.addText(
    `የሪፖርት ወቅት፡ ${monthName} ${year} ዓ.ም (የኢትዮጵያ ዘመን አቆጣጠር)\nየተካተቱ ዞኖች፡ ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ ሀላባ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና ዞኖች\nየክፍያ መመሪያ፡ መደበኛ ምዝገባ ሙሉ በሙሉ ነፃ (0 ብር) | ዘግይቶ ምዝገባ 500 የኢትዮጵያ ብር (ETB)`,
    {
      x: 1.0,
      y: 3.8,
      w: 11.33,
      h: 1.3,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    }
  );

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 5.3,
    w: 11.33,
    h: 1.3,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
  });

  const ethNow = getCurrentEthiopianDate();

  slide1.addText(
    `ያዘጋጀው፡ የማዕከላዊ ኢትዮጵያ ክልል የወሳኝ ኩነቶች ዳይሬክቶሬት\nየሰነድ ደረጃ፡ ይፋዊ የክልሉ መንግሥት ስታትስቲካዊ መረጃ\nየተዘጋጀበት ቀን፡ ${ethNow.fullFormatted} (${ethNow.weekdayName})`,
    {
      x: 1.3,
      y: 5.5,
      w: 10.7,
      h: 0.9,
      fontSize: 12,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    }
  );

  // -------------------------------------------------------------
  // SLIDE 2: ዋና ዋና ውጤቶች (EXECUTIVE SUMMARY & KPIS)
  // -------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: BG_COLOR };

  slide2.addText('ዋና ዋና የወሳኝ ኩነቶች ምዝገባ ጠቋሚዎች (KPIs)', {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: 'Arial',
    color: TEXT_WHITE,
    bold: true,
  });

  slide2.addText(`የ${monthName} ${year} ዓ.ም በ10ሩም ዞኖች የተመዘገቡ ወሳኝ ኩነቶች አጠቃላይ ማጠቃለያ (በኢትዮጵያ ካላንደር)`, {
    x: 0.8,
    y: 1.1,
    w: 11.7,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Arial',
    color: TEXT_MUTED,
  });

  // Card 1: Total
  slide2.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.7, w: 2.7, h: 1.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 } });
  slide2.addText('አጠቃላይ የተመዘገቡ', { x: 1.0, y: 1.9, w: 2.3, h: 0.3, fontSize: 11, color: TEXT_MUTED, bold: true });
  slide2.addText(String(totalSumAll.toLocaleString()), { x: 1.0, y: 2.3, w: 2.3, h: 0.7, fontSize: 30, color: TEXT_WHITE, bold: true });
  slide2.addText('በ10ሩም ዞኖች የተጠናከረ', { x: 1.0, y: 3.0, w: 2.3, h: 0.3, fontSize: 10, color: TEXT_MUTED });

  // Card 2: Current
  slide2.addShape(pptx.ShapeType.roundRect, { x: 3.7, y: 1.7, w: 2.7, h: 1.8, fill: { color: CARD_BG }, line: { color: EMERALD_ACCENT, width: 1.5 } });
  slide2.addText('መደበኛ ምዝገባ (ነፃ - 0 ብር)', { x: 3.9, y: 1.9, w: 2.3, h: 0.3, fontSize: 11, color: EMERALD_ACCENT, bold: true });
  slide2.addText(String(totalCurrentAll.toLocaleString()), { x: 3.9, y: 2.3, w: 2.3, h: 0.7, fontSize: 30, color: TEXT_WHITE, bold: true });
  slide2.addText(`${currentPercent}% ሙሉ በሙሉ በነፃ የተመዘገቡ`, { x: 3.9, y: 3.0, w: 2.3, h: 0.3, fontSize: 10, color: EMERALD_ACCENT });

  // Card 3: Late
  slide2.addShape(pptx.ShapeType.roundRect, { x: 6.6, y: 1.7, w: 2.7, h: 1.8, fill: { color: CARD_BG }, line: { color: AMBER_ACCENT, width: 1.5 } });
  slide2.addText('ዘግይቶ ምዝገባ (በ500 ብር)', { x: 6.8, y: 1.9, w: 2.3, h: 0.3, fontSize: 11, color: AMBER_ACCENT, bold: true });
  slide2.addText(String(totalLateAll.toLocaleString()), { x: 6.8, y: 2.3, w: 2.3, h: 0.7, fontSize: 30, color: TEXT_WHITE, bold: true });
  slide2.addText(`${latePercent}% በ500 ብር ቅጣት ክፍያ`, { x: 6.8, y: 3.0, w: 2.3, h: 0.3, fontSize: 10, color: AMBER_ACCENT });

  // Card 4: Revenue from Late Penalty
  slide2.addShape(pptx.ShapeType.roundRect, { x: 9.5, y: 1.7, w: 3.0, h: 1.8, fill: { color: CARD_BG }, line: { color: CYAN_ACCENT, width: 1 } });
  slide2.addText('የተሰበሰበ የቅጣት ገቢ (ETB)', { x: 9.7, y: 1.9, w: 2.6, h: 0.3, fontSize: 11, color: CYAN_ACCENT, bold: true });
  slide2.addText(`${totalPenaltyRevenueETB.toLocaleString()} ብር`, { x: 9.7, y: 2.3, w: 2.6, h: 0.7, fontSize: 26, color: TEXT_WHITE, bold: true });
  slide2.addText(`ከ${totalLateAll} የዘገዩ ምዝገባዎች (በ500 ብር)`, { x: 9.7, y: 3.0, w: 2.6, h: 0.3, fontSize: 10, color: TEXT_MUTED });

  // Summary Container
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.8,
    w: 11.7,
    h: 3.0,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
  });

  slide2.addText('የወሩ ዋና ዋና አፈጻጸም ግኝቶች፡', {
    x: 1.1,
    y: 4.1,
    w: 11.1,
    h: 0.4,
    fontSize: 14,
    color: CYAN_ACCENT,
    bold: true,
  });

  const amharicBullets = [
    `የምዝገባ ሽፋን፡ በማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖች ውስጥ ${currentPercent}% የሚሆኑት ወሳኝ ኩነቶች በህጋዊ የጊዜ ገደብ ሙሉ በሙሉ በነፃ (0 ብር) ተመዝግበዋል።`,
    `የዘገዩ ምዝገባዎች ክፍያ፡ በወሩ የተመዘገቡ ${totalLateAll.toLocaleString()} የዘገዩ ኩነቶች እያንዳንዳቸው በ500 የኢትዮጵያ ብር (ETB) ህጋዊ የቅጣት ክፍያ ተመዝግበው አጠቃላይ ${totalPenaltyRevenueETB.toLocaleString()} ብር ገቢ ተሰብስቧል።`,
    `የሀላባ ዞን እና ሌሎች ዞኖች አፈጻጸም፡ ሀላባ፣ ሀዲያ፣ ጉራጌ፣ ስልጤ፣ ከምባታ እና ሌሎች ዞኖች ወርሃዊ ሪፖርታቸውን በወቅቱ ለክልሉ አስገብተዋል።`,
    `የቀን አቆጣጠር፡ መላው የሪፖርት አቀራረብ በኢትዮጵያ ዘመን አቆጣጠር (ካላንደር) መሰረት ${monthName} ${year} ዓ.ም ተጠናቅሯል።`
  ];

  slide2.addText(
    amharicBullets.map(b => ({ text: b, options: { bullet: true, breakLine: true, fontSize: 12, color: TEXT_WHITE } })),
    { x: 1.1, y: 4.6, w: 11.1, h: 2.0 }
  );

  // -------------------------------------------------------------
  // SLIDE 3: የኩነቶች ዓይነት ዝርዝር (SERVICE BREAKDOWN)
  // -------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: BG_COLOR };

  slide3.addText('የወሳኝ ኩነቶች ዓይነት ዝርዝር፡ መደበኛ (ነፃ) እና ዘግይቶ ምዝገባ (500 ብር)', {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    color: TEXT_WHITE,
    bold: true,
  });

  slide3.addText('በልደት፣ ሞት፣ ጋብቻ፣ ፍቺ እና ጉዲፈቻ የተመዘገቡ ኩነቶች ንፅፅር እና የክፍያ ተመን', {
    x: 0.8,
    y: 1.1,
    w: 11.7,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Arial',
    color: TEXT_MUTED,
  });

  const tableHeaders = [
    { text: 'የወሳኝ ኩነት ዓይነት', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
    { text: 'ህጋዊ የጊዜ ገደብ መስፈርት', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
    { text: 'ወቅታዊ (ነፃ 0 ብር)', options: { bold: true, fill: { color: '1E293B' }, color: EMERALD_ACCENT } },
    { text: 'የዘገየ (እስከ 1 ዓመት)', options: { bold: true, fill: { color: '1E293B' }, color: AMBER_ACCENT } },
    { text: 'ነባር (>1 ዓመት)', options: { bold: true, fill: { color: '1E293B' }, color: 'A855F7' } },
    { text: 'አጠቃላይ ድምር', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
  ];

  const tableRows = serviceRowsData.map(s => {
    const sTotal = s.current + s.late + s.backlog;
    return [
      { text: s.name, options: { fill: { color: CARD_BG }, color: TEXT_WHITE, bold: true } },
      { text: s.limit, options: { fill: { color: CARD_BG }, color: TEXT_MUTED } },
      { text: String(s.current.toLocaleString()), options: { fill: { color: CARD_BG }, color: EMERALD_ACCENT, bold: true } },
      { text: String(s.late.toLocaleString()), options: { fill: { color: CARD_BG }, color: AMBER_ACCENT, bold: true } },
      { text: String(s.backlog.toLocaleString()), options: { fill: { color: CARD_BG }, color: 'A855F7', bold: true } },
      { text: String(sTotal.toLocaleString()), options: { fill: { color: CARD_BG }, color: TEXT_WHITE, bold: true } },
    ];
  });

  slide3.addTable([tableHeaders, ...tableRows], {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    colW: [2.5, 2.8, 1.6, 1.6, 1.6, 1.6],
    rowH: 0.48,
    border: { pt: 1, color: BORDER_COLOR },
    fontSize: 10,
    fontFace: 'Arial',
    align: 'center',
    valign: 'middle',
  });

  // Chart with 3 Series
  const chartData = [
    {
      name: 'ወቅታዊ (ነፃ - 0 ብር)',
      labels: serviceRowsData.map(s => s.name),
      values: serviceRowsData.map(s => s.current),
    },
    {
      name: 'የዘገየ (እስከ 1 ዓመት)',
      labels: serviceRowsData.map(s => s.name),
      values: serviceRowsData.map(s => s.late),
    },
    {
      name: 'ነባር (>1 ዓመት)',
      labels: serviceRowsData.map(s => s.name),
      values: serviceRowsData.map(s => s.backlog),
    },
  ];

  slide3.addChart(pptx.ChartType.bar, chartData, {
    x: 0.8,
    y: 4.8,
    w: 11.7,
    h: 2.1,
    barDir: 'col',
    barGrouping: 'stacked',
    chartColors: ['10B981', 'F59E0B', '8B5CF6'],
    showLegend: true,
    legendPos: 't',
    legendColor: TEXT_MUTED,
    chartArea: { fill: { color: CARD_BG } },
    plotArea: { fill: { color: CARD_BG } },
    catAxisLabelColor: TEXT_WHITE,
    valAxisLabelColor: TEXT_MUTED,
  });

  // -------------------------------------------------------------
  // SLIDE 4: የማዕከላዊ ኢትዮጵያ 10ሩም ዞኖች አፈጻጸም (ZONES BREAKDOWN)
  // -------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: BG_COLOR };

  slide4.addText('የማዕከላዊ ኢትዮጵያ ክልል 10ሩም ዞኖችና ልዩ ወረዳዎች አፈጻጸም (በ3ቱ የጊዜ ገደቦች)', {
    x: 0.8,
    y: 0.4,
    w: 11.7,
    h: 0.5,
    fontSize: 20,
    fontFace: 'Arial',
    color: TEXT_WHITE,
    bold: true,
  });

  slide4.addText('ሀዲያ፣ ጉራጌ፣ ምሥራቅ ጉራጌ፣ ስልጤ፣ ከምባታ፣ ሀላባ፣ የም፣ ማረቆ፣ ጠምባሮ እና ቀቤና', {
    x: 0.8,
    y: 0.95,
    w: 11.7,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: TEXT_MUTED,
  });

  const zoneHeaders = [
    { text: 'ዞን / ልዩ ወረዳ', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
    { text: 'ወረዳዎች', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
    { text: 'ወቅታዊ (ነፃ)', options: { bold: true, fill: { color: '1E293B' }, color: EMERALD_ACCENT } },
    { text: 'የዘገየ (እስከ 1ዓመት)', options: { bold: true, fill: { color: '1E293B' }, color: AMBER_ACCENT } },
    { text: 'ነባር (>1 ዓመት)', options: { bold: true, fill: { color: '1E293B' }, color: 'A855F7' } },
    { text: 'አጠቃላይ ድምር', options: { bold: true, fill: { color: '1E293B' }, color: TEXT_WHITE } },
    { text: 'ወቅታዊ ምጣኔ', options: { bold: true, fill: { color: '1E293B' }, color: EMERALD_ACCENT } },
  ];

  const zoneRows = zoneSummaryList.map(z => [
    { text: z.name, options: { fill: { color: CARD_BG }, color: TEXT_WHITE, bold: true } },
    { text: String(z.woredas), options: { fill: { color: CARD_BG }, color: TEXT_MUTED } },
    { text: String(z.current.toLocaleString()), options: { fill: { color: CARD_BG }, color: EMERALD_ACCENT } },
    { text: String(z.late.toLocaleString()), options: { fill: { color: CARD_BG }, color: AMBER_ACCENT } },
    { text: String(z.backlog.toLocaleString()), options: { fill: { color: CARD_BG }, color: 'A855F7' } },
    { text: String(z.total.toLocaleString()), options: { fill: { color: CARD_BG }, color: TEXT_WHITE, bold: true } },
    { text: z.rate, options: { fill: { color: CARD_BG }, color: EMERALD_ACCENT, bold: true } },
  ]);

  slide4.addTable([zoneHeaders, ...zoneRows], {
    x: 0.8,
    y: 1.35,
    w: 11.7,
    colW: [2.5, 1.2, 1.6, 1.7, 1.6, 1.7, 1.4],
    rowH: 0.40,
    border: { pt: 1, color: BORDER_COLOR },
    fontSize: 9.5,
    fontFace: 'Arial',
    align: 'center',
    valign: 'middle',
  });

  // -------------------------------------------------------------
  // SLIDE 5: የፖሊሲ ምክረ-ሃሳቦች (STRATEGIC RECOMMENDATIONS)
  // -------------------------------------------------------------
  const slide5 = pptx.addSlide();
  slide5.background = { color: BG_COLOR };

  slide5.addText('የወደፊት የትኩረት አቅጣጫዎች እና የውሳኔ ምክረ-ሃሳቦች', {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: 'Arial',
    color: TEXT_WHITE,
    bold: true,
  });

  slide5.addText('የዘገዩ ምዝገባዎችን (500 ብር ቅጣት) ለመቀነስ በማዕከላዊ ኢትዮጵያ ክልል የሚተገበሩ ቁልፍ ተግባራት', {
    x: 0.8,
    y: 1.1,
    w: 11.7,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Arial',
    color: TEXT_MUTED,
  });

  const recommendationsAm = [
    {
      num: '01',
      title: 'በወቅቱ ምዝገባ ነፃ (0 ብር) መሆኑን ለህብረተሰቡ በስፋት ማስተዋወቅ',
      desc: 'ልደት በ90 ቀናት፣ ሞትና ጋብቻ በ30 ቀናት በነፃ መመዝገብ እንደሚችሉ እና ከጊዜ ገደብ በኋላ 500 ብር ቅጣት እንዳለ ለቀበሌ አመራሮችና ለህዝቡ ግንዛቤ መስጠት።',
    },
    {
      num: '02',
      title: 'የሆስፒታሎችና ጤና ተቋማት ዲጂታል ትስስር ማጠናከር',
      desc: 'በሆሳዕና፣ ወልቂጤ፣ ቡታጅራ፣ ወራቤ፣ ዱራሜ እና ሀላባ ቁሊቶ በሚገኙ ሪፈራል ሆስፒታሎች እና ጤና ጣቢያዎች እናቶች እንደወለዱ ወዲያውኑ የልደት መረጃ እንዲመዘገብ ማድረግ።',
    },
    {
      num: '03',
      title: 'ተንቀሳቃሽ የምዝገባ ቡድኖችን ወደ ሩቅ ወረዳዎች ማሰማራት',
      desc: 'በተራራማና ሩቅ አካባቢዎች ዜጎች ረጅም ርቀት ሳይጓዙ በየቀበሌው ተንቀሳቃሽ የምዝገባ አገልግሎት በመስጠት በወቅቱ እንዲመዘገቡ ማመቻቸት።',
    },
  ];

  recommendationsAm.forEach((rec, idx) => {
    const cardY = 1.6 + idx * 1.7;
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: 11.7,
      h: 1.5,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    slide5.addText(rec.num, {
      x: 1.1,
      y: cardY + 0.35,
      w: 0.8,
      h: 0.8,
      fontSize: 24,
      color: CYAN_ACCENT,
      bold: true,
    });

    slide5.addText(rec.title, {
      x: 2.1,
      y: cardY + 0.25,
      w: 10.0,
      h: 0.4,
      fontSize: 14,
      color: TEXT_WHITE,
      bold: true,
    });

    slide5.addText(rec.desc, {
      x: 2.1,
      y: cardY + 0.68,
      w: 10.0,
      h: 0.65,
      fontSize: 11,
      color: TEXT_MUTED,
    });
  });

  slide5.addText('የማዕከላዊ ኢትዮጵያ ብሔራዊ ክልላዊ መንግሥት · ህጋዊና ይፋዊ ወርሃዊ የወሳኝ ኩነቶች ሪፖርት (በኢትዮጵያ ካላንደር)', {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 11,
    color: TEXT_MUTED,
    align: 'center',
  });

  const fileName = `የማዕከላዊ_ኢትዮጵያ_ወሳኝ_ኩነቶች_${monthName}_${year}_ዓም.pptx`;
  await pptx.writeFile({ fileName });
}
