const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const https = require('https');
const allowCors = require('../lib/cors');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send("Sadece POST istekleri destekleniyor.");
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse hatası:', err);
      return res.status(500).send("Form verisi işlenemedi.");
    }

    const file = files.file;
    if (!file) {
      return res.status(400).send("Dosya bulunamadı.");
    }

    const filePath = file.filepath || file.path;
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).send("Geçersiz dosya yolu.");
    }

    const fileName = path.basename(filePath);
    const access = process.env.ARCHIVE_USER;
    const secret = process.env.ARCHIVE_PASS;

    if (!access || !secret) {
      return res.status(500).send("Gerekli kimlik bilgileri ayarlanmamış.");
    }

    const identifier = `upload-${Date.now()}`;
    const uploadUrl = `https://${access}:${secret}@s3.us.archive.org/${identifier}/${fileName}`;

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Content-Length': file.size,
      }
    };

    const uploadReq = https.request(uploadUrl, options, (uploadRes) => {
      if (uploadRes.statusCode === 200) {
        return res.status(200).json({
          message: 'Dosya archive.org’a yüklendi!',
          url: `https://archive.org/download/${identifier}/${fileName}`,
        });
      } else {
        console.error('Yükleme hatası:', uploadRes.statusCode);
        return res.status(uploadRes.statusCode).send("Yükleme başarısız.");
      }
    });

    uploadReq.on('error', (e) => {
      console.error('HTTPS yükleme hatası:', e);
      return res.status(500).send("Yükleme sırasında hata oluştu.");
    });

    fs.createReadStream(filePath).pipe(uploadReq);
  });
};

module.exports = allowCors(handler);
