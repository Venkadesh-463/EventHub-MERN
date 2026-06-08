const PDFDocument = require('pdfkit');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Generate a PDF certificate for a specific registration
// @route   GET /api/certificates/:registrationId
// @access  Private (Student owner / College / Admin)
const generateCertificate = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.registrationId)
    .populate('student', 'name email')
    .populate('event', 'title date location category');

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  // Allow only the student who owns it, or a college/admin
  const isOwner = registration.student._id.toString() === req.user._id.toString();
  const isStaff = req.user.role === 'college' || req.user.role === 'admin';
  if (!isOwner && !isStaff) {
    res.status(403);
    throw new Error('Not authorized to download this certificate');
  }

  if (registration.status !== 'attended') {
    res.status(400);
    throw new Error('Certificate can only be generated for attended students');
  }

  const { student, event } = registration;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const issuedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=EventHub-Certificate-${student.name.replace(/\s+/g, '-')}.pdf`
  );
  doc.pipe(res);

  const W = doc.page.width;   // ~841
  const H = doc.page.height;  // ~595

  // ═══════════════════════════════════════
  //  LAYER 1 — BACKGROUND GRADIENT SIMULATION
  // ═══════════════════════════════════════
  // Deep dark base
  doc.rect(0, 0, W, H).fill('#0f0c29');
  // Top-left indigo glow
  doc.circle(0, 0, 350).fillOpacity(0.35).fill('#6366f1');
  // Bottom-right purple glow
  doc.circle(W, H, 300).fillOpacity(0.3).fill('#a855f7');
  // Center soft overlay
  doc.rect(0, 0, W, H).fillOpacity(0.15).fill('#1e1b4b');

  // ═══════════════════════════════════════
  //  LAYER 2 — DECORATIVE CORNER DIAMONDS
  // ═══════════════════════════════════════
  const drawCornerDiamond = (cx, cy) => {
    doc.save()
      .translate(cx, cy)
      .rotate(45)
      .rect(-18, -18, 36, 36)
      .lineWidth(2)
      .strokeColor('#6366f1')
      .fillOpacity(0.15)
      .fillAndStroke('#6366f1', '#a5b4fc')
      .restore();
  };
  drawCornerDiamond(45, 45);
  drawCornerDiamond(W - 45, 45);
  drawCornerDiamond(45, H - 45);
  drawCornerDiamond(W - 45, H - 45);

  // ═══════════════════════════════════════
  //  LAYER 3 — OUTER & INNER BORDER FRAMES
  // ═══════════════════════════════════════
  // Gold outer border
  doc.rect(25, 25, W - 50, H - 50)
    .lineWidth(2.5)
    .fillOpacity(0)
    .strokeColor('#c4a44e')
    .stroke();

  // Inner thin border
  doc.rect(35, 35, W - 70, H - 70)
    .lineWidth(0.8)
    .strokeColor('#e2c97e')
    .stroke();

  // ═══════════════════════════════════════
  //  LAYER 4 — TOP BANNER
  // ═══════════════════════════════════════
  doc.rect(25, 25, W - 50, 70).fillOpacity(0.6).fill('#1e1b4b');

  doc.fillOpacity(1)
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#e2c97e')
    .text('EVENT  HUB  CAMPUS  MANAGEMENT', 0, 48, {
      align: 'center', characterSpacing: 3
    });

  // ═══════════════════════════════════════
  //  LAYER 5 — DECORATIVE HORIZONTAL LINES
  // ═══════════════════════════════════════
  const drawGoldLine = (y) => {
    doc.moveTo(60, y).lineTo(W - 60, y)
      .lineWidth(0.8).strokeColor('#c4a44e').stroke();
  };
  drawGoldLine(98);
  drawGoldLine(102);

  // ═══════════════════════════════════════
  //  LAYER 6 — "CERTIFICATE OF PARTICIPATION" HEADING
  // ═══════════════════════════════════════
  doc.font('Helvetica')
    .fontSize(11)
    .fillColor('#a5b4fc')
    .fillOpacity(1)
    .text('C E R T I F I C A T E', 0, 118, { align: 'center', characterSpacing: 8 });

  doc.font('Helvetica-Bold')
    .fontSize(30)
    .fillColor('#ffffff')
    .text('of Participation', 0, 138, { align: 'center' });

  // ═══════════════════════════════════════
  //  LAYER 7 — BODY TEXT
  // ═══════════════════════════════════════
  doc.font('Helvetica')
    .fontSize(13)
    .fillColor('#cbd5e1')
    .text('This is to proudly certify that', 0, 195, { align: 'center' });

  // Student Name with gold underline
  doc.font('Helvetica-Bold')
    .fontSize(40)
    .fillColor('#e2c97e')
    .text(student.name, 0, 220, { align: 'center' });

  // Name underline
  const nameWidth = Math.min(student.name.length * 22, 400);
  const nameX = (W - nameWidth) / 2;
  doc.moveTo(nameX, 275).lineTo(nameX + nameWidth, 275)
    .lineWidth(1.5).strokeColor('#c4a44e').stroke();

  doc.font('Helvetica')
    .fontSize(13)
    .fillColor('#cbd5e1')
    .text('has successfully attended and completed the event', 0, 310, { align: 'center' });

  // Event title box
  doc.rect(W / 2 - 250, 330, 500, 44)
    .fillOpacity(0.2)
    .fill('#6366f1');

  doc.rect(W / 2 - 250, 330, 500, 44)
    .lineWidth(1)
    .fillOpacity(0)
    .strokeColor('#6366f1')
    .stroke();

  doc.font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#ffffff')
    .fillOpacity(1)
    .text(`"${event.title}"`, W / 2 - 250, 344, {
      width: 500, align: 'center'
    });

  doc.font('Helvetica')
    .fontSize(12)
    .fillColor('#94a3b8')
    .text(`Held on ${eventDate}`, 0, 386, { align: 'center' });

  // ═══════════════════════════════════════
  //  LAYER 8 — BOTTOM INFO ROW
  // ═══════════════════════════════════════
  drawGoldLine(H - 105);
  drawGoldLine(H - 109);

  // Three-column footer
  const col1X = 80, col2X = W / 2, col3X = W - 200;
  const footerY = H - 98;

  // Column 1 — Issued Date
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#e2c97e')
    .text('ISSUED ON', col1X, footerY, { width: 120, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#e2e8f0')
    .text(issuedOn, col1X, footerY + 14, { width: 120, align: 'center' });

  // Column 2 — Seal / Logo
  doc.circle(W / 2, footerY + 12, 28)
    .lineWidth(1.5)
    .strokeColor('#c4a44e')
    .fillOpacity(0.1)
    .fillAndStroke('#6366f1', '#c4a44e');

  doc.font('Helvetica-Bold').fontSize(7).fillColor('#e2c97e').fillOpacity(1)
    .text('EVENT', W / 2 - 28, footerY + 4, { width: 56, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
    .text('HUB', W / 2 - 28, footerY + 14, { width: 56, align: 'center' });
  doc.font('Helvetica').fontSize(5).fillColor('#a5b4fc')
    .text('OFFICIAL SEAL', W / 2 - 28, footerY + 23, { width: 56, align: 'center' });

  // Column 3 — Registration ID
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#e2c97e')
    .text('REGISTRATION ID', col3X - 10, footerY, { width: 130, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
    .text(registration.qrCodeData, col3X - 10, footerY + 13, { width: 130, align: 'center' });

  // ═══════════════════════════════════════
  //  LAYER 9 — BOTTOM STRIP
  // ═══════════════════════════════════════
  doc.rect(25, H - 55, W - 50, 30)
    .fillOpacity(0.4).fill('#1e1b4b');

  doc.font('Helvetica').fontSize(8).fillColor('#64748b').fillOpacity(1)
    .text(
      `Issued by Event Hub Campus Management Platform  •  This certificate is digitally verified  •  ${registration.qrCodeData}`,
      0, H - 48, { align: 'center' }
    );

  // ═══════════════════════════════════════
  //  LAYER 10 — SUBTLE WATERMARK
  // ═══════════════════════════════════════
  doc.save()
    .translate(W / 2, H / 2)
    .rotate(-30)
    .font('Helvetica-Bold')
    .fontSize(90)
    .fillColor('#6366f1')
    .fillOpacity(0.03)
    .text('VERIFIED', -220, -45)
    .restore();

  doc.end();
});

module.exports = { generateCertificate };
