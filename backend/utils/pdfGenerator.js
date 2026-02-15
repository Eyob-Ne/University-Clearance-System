const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Certificate = require('../models/certificate');

class PDFGenerator {
  static async generateClearanceCertificate(student) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create certificate record
        const { certificateId, qrCodeUrl, expiryDate } = await this.createCertificateRecord(student);
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
        
        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve({
            pdfBuffer: pdfData,
            certificateId,
            expiryDate
          });
        });

        // Add content to PDF
        this.addCertificateContent(doc, student, certificateId, expiryDate, qrCodeDataUrl);
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
static async generateFromExisting(student, certificate) {
  return new Promise(async (resolve, reject) => {
    try {

      const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificate.certificateId}-${certificate.securityHash}`;

      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve({
          pdfBuffer: Buffer.concat(buffers)
        });
      });

      this.addCertificateContent(
        doc,
        student,
        certificate.certificateId,
        certificate.expiryDate,
        qrCodeDataUrl
      );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

  static async createCertificateRecord(student) {
    // Generate unique certificate ID
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
    const certificateId = `MAU-CERT-${timestamp}-${randomString}`;

    // Create security hash
    const securityHash = crypto
      .createHash('sha256')
      .update(student._id.toString() + certificateId + process.env.JWT_SECRET)
      .digest('hex')
      .substr(0, 8)
      .toUpperCase();

    // Set expiry (1 month from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // Generate QR code URL
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}-${securityHash}`;

    // Save to database
    const certificate = new Certificate({
      certificateId,
      studentId: student._id,
      expiryDate,
      securityHash,
      status: 'active'
    });
    await certificate.save();

    return { certificateId, qrCodeUrl, expiryDate };
  }

  static addCertificateContent(doc, student, certificateId, expiryDate, qrCodeDataUrl) {
    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');

    // Border
    doc.strokeColor('#1e40af')
       .lineWidth(3)
       .roundedRect(30, 30, doc.page.width - 60, doc.page.height - 60, 10)
       .stroke();

    // Header Section
    doc.fillColor('#1e3a8a')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('MEKDELA AMBA UNIVERSITY', 50, 60, { align: 'center' });

    doc.fillColor('#374151')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('OFFICIAL CLEARANCE CERTIFICATE', 50, 90, { align: 'center' });

    // Decorative line
    doc.strokeColor('#1e40af')
       .lineWidth(1)
       .moveTo(100, 120)
       .lineTo(doc.page.width - 100, 120)
       .stroke();

    // Main Content
    doc.fillColor('#1f2937')
       .fontSize(14)
       .font('Helvetica')
       .text('This certifies that:', 50, 150, { align: 'center' });

    // Student Name (Highlighted)
    doc.fillColor('#1e3a8a')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(student.fullName.toUpperCase(), 50, 180, { align: 'center' });

    // Student Details
    const detailsY = 220;
    doc.fillColor('#374151')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Student ID:', 80, detailsY)
       .font('Helvetica')
       .text(student.studentId, 160, detailsY);

    doc.font('Helvetica-Bold')
       .text('Department:', 80, detailsY + 25)
       .font('Helvetica')
       .text(student.department, 160, detailsY + 25);

    doc.font('Helvetica-Bold')
       .text('Year:', 80, detailsY + 50)
       .font('Helvetica')
       .text(`Year ${student.year}`, 160, detailsY + 50);

    // Clearance Statement
    doc.fillColor('#1f2937')
       .fontSize(12)
       .text('has successfully completed all academic requirements and', 50, detailsY + 90, { align: 'center' })
       .text('clearance procedures as verified by the university administration.', 50, detailsY + 105, { align: 'center' });

    // Certificate Details
    const certY = detailsY + 140;
    doc.font('Helvetica-Bold')
       .text('Issue Date:', 80, certY)
       .font('Helvetica')
       .text(new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), 160, certY);

    doc.font('Helvetica-Bold')
       .text('Expiry Date:', 80, certY + 20)
       .font('Helvetica')
       .text(expiryDate.toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), 160, certY + 20);

    doc.font('Helvetica-Bold')
       .text('Certificate ID:', 80, certY + 40)
       .font('Helvetica')
       .text(certificateId, 160, certY + 40);

    // QR Code Section
    const qrCodeY = certY + 80;
    doc.fillColor('#1f2937')
       .fontSize(10)
       .text('Scan QR code to verify authenticity:', 50, qrCodeY, { align: 'center' });

    // Add QR Code image
    doc.image(qrCodeDataUrl, doc.page.width / 2 - 40, qrCodeY + 15, { 
      width: 80, 
      height: 80 
    });

    // Verification URL
    doc.text('Verify at: mau.edu.et/verify', 50, qrCodeY + 110, { align: 'center' })
       .text(`Certificate ID: ${certificateId}`, 50, qrCodeY + 125, { align: 'center' });

  }
}

module.exports = PDFGenerator;