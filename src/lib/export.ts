import { jsPDF } from 'jspdf';
import type { EvaluationState } from '@/hooks/useEvaluation';
import { grille } from '@/data/grille-2026';

// ── Helpers ──────────────────────────────────────────────────

const fmtPt = (v: number) => {
  if (Number.isInteger(v)) return String(v);
  return String(v).replace('.', ',');
};

const fmtDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ── PDF layout constants ─────────────────────────────────────

const MARGIN = 10;
const PW = 297; // landscape A4 width
const PH = 210; // landscape A4 height
const CW = PW - 2 * MARGIN; // content width

// Column widths (total = CW = 277)
const COL_CRIT = 48;
const COL_LEVEL = 52; // ×4 = 208
const COL_BAR = 21;
// 48 + 208 + 21 = 277 ✓

const COL_X = [
  MARGIN,                          // critères
  MARGIN + COL_CRIT,               // insuffisante
  MARGIN + COL_CRIT + COL_LEVEL,   // fragile
  MARGIN + COL_CRIT + COL_LEVEL * 2, // satisfaisante
  MARGIN + COL_CRIT + COL_LEVEL * 3, // très bonne
  MARGIN + COL_CRIT + COL_LEVEL * 4, // barème
];
const COL_W = [COL_CRIT, COL_LEVEL, COL_LEVEL, COL_LEVEL, COL_LEVEL, COL_BAR];

// Colors
const GRAY_HEADER: [number, number, number] = [70, 70, 70];
const GRAY_SECTION: [number, number, number] = [235, 235, 235];
const HIGHLIGHT_COLORS: Record<string, [number, number, number]> = {
  insufficient: [254, 226, 226],
  fragile: [255, 237, 213],
  satisfactory: [219, 234, 254],
  excellent: [220, 252, 231],
};

// ── Drawing helpers ──────────────────────────────────────────

const drawRect = (doc: jsPDF, x: number, y: number, w: number, h: number, fill?: [number, number, number]) => {
  if (fill) {
    doc.setFillColor(...fill);
    doc.rect(x, y, w, h, 'FD');
  } else {
    doc.rect(x, y, w, h, 'S');
  }
};

const measureTextHeight = (doc: jsPDF, text: string, maxW: number, fontSize: number): number => {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxW - 3);
  return lines.length * fontSize * 0.38;
};

// ── Main export ──────────────────────────────────────────────

export const exportPDF = (state: EvaluationState) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  let y = MARGIN;

  // ── Title ──
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Grille d'evaluation de l'epreuve orale de 3eme - 2026", PW / 2, y + 5, { align: 'center' });
  y += 10;

  // ── Candidate info ──
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const candLine1Left = `CANDIDAT : ${state.candidate.nom}`;
  const candLine1Mid = `PRENOM : ${state.candidate.prenom}`;
  const candLine1Right = `Classe : ${state.candidate.classe}`;
  doc.text(candLine1Left, MARGIN + 10, y + 5);
  doc.text(candLine1Mid, PW / 2 - 20, y + 5);
  doc.text(candLine1Right, PW - MARGIN - 40, y + 5);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const juryLine = `Jury : ${state.jury.juryNumber}`;
  const horLine = `Horaires : ${state.candidate.horaire || ''}`;
  const salLine = `Salle : ${state.jury.salle}`;
  doc.text(juryLine, MARGIN + 50, y + 4);
  doc.text(horLine, PW / 2 - 20, y + 4);
  doc.text(salLine, PW / 2 + 40, y + 4);
  y += 8;

  // ── Helper: draw table header row ──
  const drawTableHeader = () => {
    const hh = 8;
    doc.setFillColor(...GRAY_HEADER);
    doc.setTextColor(255, 255, 255);

    const headers = ["Criteres d'evaluation", 'Maitrise insuffisante', 'Maitrise fragile', 'Maitrise satisfaisante', 'Tres bonne maitrise', 'Bareme'];
    for (let i = 0; i < 6; i++) {
      doc.rect(COL_X[i], y, COL_W[i], hh, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(headers[i], COL_X[i] + COL_W[i] / 2, y + 5, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);
    y += hh;
  };

  // ── Helper: draw section header ──
  const drawSectionHeader = (title: string) => {
    const hh = 7;
    doc.setFillColor(...GRAY_SECTION);
    doc.rect(MARGIN, y, CW, hh, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, MARGIN + 2, y + 5);
    y += hh;
  };

  // ── Helper: draw criterion row ──
  const drawCriterionRow = (criterion: typeof grille.sections[0]['criteria'][0], selectedPoints: number | undefined) => {
    const DESC_FONT = 7;
    const POINTS_FONT = 7;
    const pad = 2;

    // Calculate row height for descriptions
    doc.setFontSize(DESC_FONT);
    const critHeight = measureTextHeight(doc, '- ' + criterion.title, COL_W[0] - 3, DESC_FONT);
    const levelHeights = criterion.levels.map((l) =>
      measureTextHeight(doc, l.description, COL_W[1] - 3, DESC_FONT)
    );
    const maxDescH = Math.max(critHeight, ...levelHeights);
    const pointsRowH = 5;
    const totalRowH = maxDescH + pointsRowH + pad * 2 + 2;

    // Check for page break
    if (y + totalRowH > PH - 15) {
      doc.addPage('a4', 'landscape');
      y = MARGIN;
      drawTableHeader();
    }

    const rowTop = y;

    // Draw cell backgrounds and borders
    for (let i = 0; i < 6; i++) {
      // Highlight selected level
      let fill: [number, number, number] | undefined;
      if (i >= 1 && i <= 4) {
        const levelIdx = i - 1;
        const level = criterion.levels[levelIdx];
        if (level && selectedPoints !== undefined) {
          if (selectedPoints === level.points || (levelIdx === 0 && selectedPoints === 0)) {
            fill = HIGHLIGHT_COLORS[level.color];
          }
        }
      }
      drawRect(doc, COL_X[i], rowTop, COL_W[i], totalRowH, fill);
    }

    // Draw criterion title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(DESC_FONT);
    doc.setFont('helvetica', 'bold');
    const critLines = doc.splitTextToSize('- ' + criterion.title, COL_W[0] - 4);
    doc.text(critLines, COL_X[0] + 2, rowTop + pad + 3);

    // Draw level descriptions
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(DESC_FONT);
    for (let li = 0; li < criterion.levels.length; li++) {
      const level = criterion.levels[li];
      const colIdx = li + 1;
      const descLines = doc.splitTextToSize(level.description, COL_W[colIdx] - 4);
      doc.text(descLines, COL_X[colIdx] + 2, rowTop + pad + 3);
    }

    // Draw points values at the bottom of each level cell
    const pointsY = rowTop + totalRowH - pointsRowH - 1;
    doc.setFontSize(POINTS_FONT);
    doc.setFont('helvetica', 'bold');

    for (let li = 0; li < criterion.levels.length; li++) {
      const level = criterion.levels[li];
      const colIdx = li + 1;
      const ptText = `${fmtPt(level.points)} point${level.points > 1 ? 's' : ''}`;

      // Draw underlined point value box
      const isSelected = selectedPoints === level.points || (li === 0 && selectedPoints === 0);

      if (isSelected) {
        // Bold + filled box for selected
        const tw = doc.getTextWidth(ptText) + 4;
        const bx = COL_X[colIdx] + COL_W[colIdx] - tw - 2;
        doc.setFillColor(...HIGHLIGHT_COLORS[level.color]);
        doc.setDrawColor(0);
        doc.rect(bx, pointsY - 1, tw, 5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.text(ptText, bx + 2, pointsY + 2.5);
      } else {
        // Normal underlined text
        doc.setFont('helvetica', 'normal');
        const tw = doc.getTextWidth(ptText);
        const tx = COL_X[colIdx] + COL_W[colIdx] - tw - 3;
        doc.text(ptText, tx, pointsY + 2.5);
        // Underline
        doc.setLineWidth(0.2);
        doc.line(tx - 0.5, pointsY + 3.5, tx + tw + 0.5, pointsY + 3.5);
        doc.setLineWidth(0.3);
      }
    }

    // Draw barème
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const barText = `/${criterion.maxPoints}`;
    doc.text(barText, COL_X[5] + COL_W[5] / 2, rowTop + totalRowH / 2 + 1, { align: 'center' });

    y += totalRowH;
  };

  // ── Helper: draw subtotal row ──
  const drawSubtotalRow = (label: string, maxPts: number, actualPts?: number) => {
    const hh = 8;
    drawRect(doc, MARGIN, y, CW, hh);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, MARGIN + 2, y + 5.5);

    // Score
    let scoreText = `/${maxPts}`;
    if (actualPts !== undefined) {
      scoreText = `${fmtPt(actualPts)}   /${maxPts}`;
    }
    doc.text(scoreText, COL_X[5] + COL_W[5] / 2, y + 5.5, { align: 'center' });
    y += hh;
  };

  // ── Draw page 1: Section 1 ──
  drawTableHeader();
  const section1 = grille.sections[0];
  drawSectionHeader(section1.title);

  for (const criterion of section1.criteria) {
    drawCriterionRow(criterion, state.scores[criterion.id]);
  }

  const s1Total = section1.criteria.reduce((sum, c) => sum + (state.scores[c.id] ?? 0), 0);
  drawSubtotalRow('Sous-total points', section1.maxPoints, s1Total);

  // ── Page 2: Section 2 ──
  doc.addPage('a4', 'landscape');
  y = MARGIN;

  drawTableHeader();
  const section2 = grille.sections[1];
  drawSectionHeader(section2.title);

  for (const criterion of section2.criteria) {
    drawCriterionRow(criterion, state.scores[criterion.id]);
  }

  const s2Total = section2.criteria.reduce((sum, c) => sum + (state.scores[c.id] ?? 0), 0);
  drawSubtotalRow('Sous-total points', section2.maxPoints, s2Total);

  // Total row
  const total = s1Total + s2Total;
  const hh = 8;
  doc.setFillColor(240, 240, 240);
  doc.rect(MARGIN, y, CW, hh, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total points', MARGIN + 2, y + 5.5);
  doc.text(`${fmtPt(total)}   /${grille.totalPoints}`, COL_X[5] + COL_W[5] / 2, y + 5.5, { align: 'center' });
  y += hh;

  // Timer info (if available)
  if (state.timers?.expose || state.timers?.entretien) {
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const parts: string[] = [];
    if (state.timers.expose && state.timers.expose.actualSeconds > 0) {
      const over = state.timers.expose.actualSeconds > state.timers.expose.expectedSeconds;
      parts.push(`Expose : ${fmtDuration(state.timers.expose.actualSeconds)} / ${fmtDuration(state.timers.expose.expectedSeconds)}${over ? ' (depassement)' : ''}`);
    }
    if (state.timers.entretien && state.timers.entretien.actualSeconds > 0) {
      const over = state.timers.entretien.actualSeconds > state.timers.entretien.expectedSeconds;
      parts.push(`Entretien : ${fmtDuration(state.timers.entretien.actualSeconds)} / ${fmtDuration(state.timers.entretien.expectedSeconds)}${over ? ' (depassement)' : ''}`);
    }
    if (parts.length > 0) {
      doc.text(parts.join('     '), MARGIN, y + 3);
      y += 6;
    }
  }

  // Comments
  if (state.comments) {
    y += 3;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarques :', MARGIN, y + 3);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const commentLines = doc.splitTextToSize(state.comments, CW);
    doc.text(commentLines, MARGIN, y + 3);
    y += commentLines.length * 3.5;
  }

  // Signatures
  y = PH - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${state.jury.prof1Prenom} ${state.jury.prof1Nom} - signature Professeur 1`,
    MARGIN + 20,
    y
  );
  doc.text(
    `${state.jury.prof2Prenom} ${state.jury.prof2Nom} - signature Professeur 2`,
    PW - MARGIN - 80,
    y
  );

  // Signature lines
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 10, y + 8, MARGIN + 100, y + 8);
  doc.line(PW - MARGIN - 100, y + 8, PW - MARGIN - 10, y + 8);

  // Save
  const fileName = `evaluation_${state.candidate.nom}_${state.candidate.prenom}.pdf`.replace(/\s/g, '_');
  doc.save(fileName);
};

// ── CSV Export ───────────────────────────────────────────────

export const exportCSV = (history: EvaluationState[]) => {
  const headers = [
    'Nom', 'Prenom', 'Classe', 'Horaire', 'Sujet',
    ...grille.sections.flatMap((s) =>
      s.criteria.map((c) => c.title)
    ),
    ...grille.sections.map((s) => `Total ${s.title}`),
    'Total',
    'Expose (s)', 'Entretien (s)',
    'Commentaires',
  ];

  const escape = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const rows = history.map((entry) => {
    const criteriaScores = grille.sections.flatMap((s) =>
      s.criteria.map((c) => fmtPt(entry.scores[c.id] ?? 0))
    );
    const sectionTotals = grille.sections.map((s) =>
      fmtPt(s.criteria.reduce((sum, c) => sum + (entry.scores[c.id] ?? 0), 0))
    );
    const total = fmtPt(Object.values(entry.scores).reduce((a, b) => a + b, 0));
    const exposeTime = entry.timers?.expose?.actualSeconds ?? '';
    const entretienTime = entry.timers?.entretien?.actualSeconds ?? '';

    return [
      entry.candidate.nom,
      entry.candidate.prenom,
      entry.candidate.classe,
      entry.candidate.horaire,
      entry.candidate.sujet,
      ...criteriaScores,
      ...sectionTotals,
      total,
      String(exposeTime),
      String(entretienTime),
      entry.comments,
    ].map(escape).join(';');
  });

  const csv = [headers.map(escape).join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evaluations_oral_dnb_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
