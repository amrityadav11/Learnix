const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * Generate a professional PDF certificate and upload to Cloudinary
 */
const generateCertificate = async ({ studentName, courseName, instructorName, courseId, userId, instructorId }) => {
    const certificateId = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;
    const verifyUrl = `${process.env.CLIENT_URL}/verify-certificate/${certificateId}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', async () => {
            try {
                const pdfBuffer = Buffer.concat(buffers);
                const base64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
                const { url: pdfUrl } = await uploadToCloudinary(base64, 'course-marketplace/certificates', {
                    resource_type: 'raw',
                    public_id: `certificate-${certificateId}`,
                });

                resolve({
                    certificateId,
                    user: userId,
                    course: courseId,
                    instructor: instructorId,
                    studentName,
                    courseName,
                    instructorName,
                    pdfUrl,
                    qrCode: qrDataUrl,
                    completionDate: new Date(),
                });
            } catch (err) {
                reject(err);
            }
        });
        doc.on('error', reject);

        const W = 841.89; // A4 landscape width
        const H = 595.28; // A4 landscape height

        // Background gradient
        doc.rect(0, 0, W, H).fill('#0f0f1a');

        // Decorative border
        doc.rect(20, 20, W - 40, H - 40)
            .lineWidth(3)
            .stroke('#6366f1');

        doc.rect(26, 26, W - 52, H - 52)
            .lineWidth(1)
            .stroke('#8b5cf6');

        // Header decorative line
        doc.moveTo(60, 90).lineTo(W - 60, 90).lineWidth(1).stroke('#6366f1');

        // Title
        doc.fontSize(14).fillColor('#8b5cf6').font('Helvetica').text('CERTIFICATE OF COMPLETION', 0, 50, { align: 'center' });

        // Main heading
        doc.fontSize(48).fillColor('#ffffff').font('Helvetica-Bold').text('LEARNIX', 0, 110, { align: 'center' });

        // Subtitle
        doc.fontSize(14).fillColor('#a0a0c0').font('Helvetica').text('This is to certify that', 0, 175, { align: 'center' });

        // Student name
        doc.fontSize(38).fillColor('#6366f1').font('Helvetica-Bold').text(studentName, 0, 200, { align: 'center' });

        // Line under name
        const nameWidth = 300;
        doc.moveTo((W - nameWidth) / 2, 248).lineTo((W + nameWidth) / 2, 248).lineWidth(2).stroke('#6366f1');

        // Description
        doc.fontSize(14).fillColor('#a0a0c0').font('Helvetica')
            .text('has successfully completed the course', 0, 260, { align: 'center' });

        // Course name
        doc.fontSize(26).fillColor('#ffffff').font('Helvetica-Bold').text(`"${courseName}"`, 0, 285, { align: 'center' });

        // Instructor
        doc.fontSize(13).fillColor('#a0a0c0').font('Helvetica')
            .text(`Instructed by: ${instructorName}`, 0, 325, { align: 'center' });

        // Date and Certificate ID
        const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.fontSize(11).fillColor('#8080a0')
            .text(`Date: ${completionDate}`, 80, 390)
            .text(`Certificate ID: ${certificateId}`, 80, 410);

        // Signature line
        doc.moveTo(W - 280, 420).lineTo(W - 80, 420).lineWidth(1).stroke('#6366f1');
        doc.fontSize(11).fillColor('#a0a0c0').text('Authorized Signature', W - 280, 428);

        // Bottom border line
        doc.moveTo(60, H - 90).lineTo(W - 60, H - 90).lineWidth(1).stroke('#6366f1');

        // Footer
        doc.fontSize(10).fillColor('#606080')
            .text('Verify this certificate at: ' + verifyUrl, 0, H - 75, { align: 'center' });

        // QR Code
        const qrBase64 = qrDataUrl.replace('data:image/png;base64,', '');
        const qrBuffer = Buffer.from(qrBase64, 'base64');
        doc.image(qrBuffer, W - 170, H - 180, { width: 100, height: 100 });

        doc.end();
    });
};

module.exports = { generateCertificate };
