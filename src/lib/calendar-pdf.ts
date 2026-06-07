import * as fs from "node:fs";
import * as path from "node:path";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

type CalendarMatch = {
  groupName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: string;
  awayTeam: string;
};

type MatchSection = {
  label: string;
  matches: CalendarMatch[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 24;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const HEADER_BOTTOM_Y = 108;
const FOOTER_Y = 792;
const ROW_HEIGHT = 22;
const TABLE_HEADER_HEIGHT = 24;
const SECTION_TITLE_GAP = 18;
const SECTION_GAP = 16;

const COLORS = {
  background: "#FBF2E6",
  title: "#1F2A37",
  body: "#3E4553",
  muted: "#6B7280",
  warning: "#A6344A",
  teal: "#17808F",
  amber: "#D8862C",
  sand: "#F2E4CB",
  rowAlt: "#FFF8F0",
  white: "#FFFFFF"
};

const logoPath = path.join(process.cwd(), "public", "assets", "inca-logo.png");
const TITLE = "Calend\u00E1rio de jogos - Palpites da Copa Inca";
const FOOTER_NOTE = "Calend\u00E1rio gerado a partir dos jogos cadastrados na plataforma.";
const PAGE_LABEL = "P\u00E1gina";

export async function buildCalendarPdf(matches: CalendarMatch[]) {
  const sections = groupMatchesByDate(matches);
  const pages = paginateSections(sections);

  return renderPdf(pages);
}

function groupMatchesByDate(matches: CalendarMatch[]) {
  const grouped = new Map<string, CalendarMatch[]>();

  for (const match of matches) {
    const current = grouped.get(match.matchDate) ?? [];
    current.push(match);
    grouped.set(match.matchDate, current);
  }

  return Array.from(grouped.entries()).map(([date, dateMatches]) => ({
    label: formatDateBR(date),
    matches: dateMatches
  }));
}

function paginateSections(sections: MatchSection[]) {
  const dateToPage = new Map<string, number>([
    ["11/06/2026", 0],
    ["12/06/2026", 0],
    ["13/06/2026", 0],
    ["14/06/2026", 0],
    ["15/06/2026", 1],
    ["16/06/2026", 1],
    ["17/06/2026", 1],
    ["18/06/2026", 1],
    ["19/06/2026", 2],
    ["20/06/2026", 2],
    ["21/06/2026", 2],
    ["22/06/2026", 2],
    ["23/06/2026", 3],
    ["24/06/2026", 3],
    ["25/06/2026", 3],
    ["26/06/2026", 4],
    ["27/06/2026", 4]
  ]);

  const pages: MatchSection[][] = [[], [], [], [], []];

  for (const section of sections) {
    const pageIndex = dateToPage.get(section.label);
    if (pageIndex === undefined) {
      continue;
    }
    pages[pageIndex].push(section);
  }

  return pages.filter((page) => page.length > 0);
}

async function renderPdf(pages: MatchSection[][]) {
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 24,
      right: MARGIN_X,
      bottom: 28,
      left: MARGIN_X
    },
    compress: true,
    autoFirstPage: false,
    info: {
      Title: TITLE,
      Author: "Inca Bar"
    }
  });

  const chunks: Buffer[] = [];
  const pdfBuffer = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const logoBuffer = fs.readFileSync(logoPath);
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  pages.forEach((pageSections, pageIndex) => {
    doc.addPage();
    drawPageBackground(doc);
    drawHeader(doc, logoDataUri);
    drawSections(doc, pageSections);
    drawFooter(doc, pageIndex + 1, pages.length, pageIndex < pages.length - 1);
  });

  doc.end();

  return await pdfBuffer;
}

function drawPageBackground(doc: PDFKit.PDFDocument) {
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.background);
  doc.restore();
}

function drawHeader(doc: PDFKit.PDFDocument, logoDataUri: string) {
  const logoWidth = 98;
  const logoX = PAGE_WIDTH - MARGIN_X - logoWidth;
  const logoY = 26;

  doc.image(logoDataUri, logoX, logoY, { width: logoWidth });

  doc.fillColor(COLORS.title).font("Times-Bold").fontSize(24).text(TITLE, MARGIN_X, 40, {
    width: CONTENT_WIDTH - 128,
    align: "left",
    lineBreak: false
  });
}

function drawSections(doc: PDFKit.PDFDocument, sections: MatchSection[]) {
  let currentY = HEADER_BOTTOM_Y;

  for (const section of sections) {
  doc.fillColor(COLORS.warning).font("Helvetica-Bold").fontSize(12).text(`Data: ${section.label}`, MARGIN_X, currentY, {
    width: CONTENT_WIDTH,
    align: "left",
    lineBreak: false
  });

    currentY += SECTION_TITLE_GAP;
    drawTableHeader(doc, currentY);
    currentY += TABLE_HEADER_HEIGHT;

    section.matches.forEach((match, index) => {
      drawMatchRow(doc, match, currentY, index % 2 === 1);
      currentY += ROW_HEIGHT;
    });

    currentY += SECTION_GAP;
  }
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.save();
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, TABLE_HEADER_HEIGHT, 0).fill(COLORS.sand);
  doc.restore();

  doc.fillColor(COLORS.title).font("Helvetica-Bold").fontSize(10);
  doc.text("Dia", MARGIN_X + 12, y + 7, { width: 52, align: "left", lineBreak: false });
  doc.text("Hora", MARGIN_X + 98, y + 7, { width: 56, align: "left", lineBreak: false });
  doc.text("Jogos", MARGIN_X + 196, y + 7, { width: 250, align: "left", lineBreak: false });
  doc.text("Grupos", PAGE_WIDTH - MARGIN_X - 74, y + 7, { width: 52, align: "right", lineBreak: false });
}

function drawMatchRow(doc: PDFKit.PDFDocument, match: CalendarMatch, y: number, alternate: boolean) {
  doc.save();
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, ROW_HEIGHT).fill(alternate ? COLORS.rowAlt : COLORS.white);
  doc.restore();

  doc.fontSize(10).font("Helvetica").fillColor(COLORS.title);
  doc.text(formatDateShort(match.matchDate), MARGIN_X + 12, y + 6, { width: 56, align: "left", lineBreak: false });

  doc.font("Helvetica-Bold").fillColor(COLORS.teal);
  doc.text(match.matchTime, MARGIN_X + 98, y + 6, { width: 56, align: "left", lineBreak: false });

  doc.font("Helvetica").fillColor(COLORS.title);
  doc.text(`${match.homeTeam} x ${match.awayTeam}`, MARGIN_X + 196, y + 6, {
    width: 250,
    align: "left",
    lineBreak: false,
    ellipsis: true
  });

  doc.font("Helvetica-Bold").fillColor(COLORS.amber);
  doc.text(match.groupName.replace("Grupo ", ""), PAGE_WIDTH - MARGIN_X - 62, y + 6, {
    width: 40,
    align: "right",
    lineBreak: false
  });
}

function drawFooter(doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number, hasNextPage: boolean) {
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8.5).text(FOOTER_NOTE, MARGIN_X, FOOTER_Y, {
    width: 265,
    align: "left",
    lineBreak: false
  });

  doc.fillColor(COLORS.warning).font("Helvetica-Bold").fontSize(10).text("Inca Bar", PAGE_WIDTH - MARGIN_X - 110, FOOTER_Y, {
    width: 48,
    align: "left",
    lineBreak: false
  });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text("|", PAGE_WIDTH - MARGIN_X - 54, FOOTER_Y, {
    width: 8,
    align: "center",
    lineBreak: false
  });
  doc.fillColor(COLORS.title).font("Helvetica").fontSize(10).text(`${PAGE_LABEL} ${pageNumber} de ${totalPages}`, PAGE_WIDTH - MARGIN_X - 42, FOOTER_Y, {
    width: 62,
    align: "left",
    lineBreak: false
  });
}

function formatDateBR(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateShort(date: string) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}
