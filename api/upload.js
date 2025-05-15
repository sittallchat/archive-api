const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const https = require('https');
const allowCors = require('https://sittallchat.github.io/lib/cors');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send("Sadece POST istekleri destekleniyor.");
  }

  const form = formidable({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send("Yükleme hatası.");
    }

    const file = files.file;
    const filePath = file.filepath;
    const fileName = path.basename(filePath);
    const access = process.env.ARCHIVE_USER;
    const secret = process.env.ARCHIVE_PASS;

    const identifier = upload-${Date.now()};
    const uploadUrl = https://${access}:${secret}@s3.us.archive.org/${identifier}/${fileName};

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Content-Length': file.size,
      }
    };

    const reqUpload = https.request(uploadUrl, options, (uploadRes) => {
      if (uploadRes.statusCode === 200) {
        res.status(200).json({
          message: 'Dosya archive.org’a yüklendi!',
          url: https://archive.org/download/${identifier}/${fileName},
        });
      } else {
        res.status(uploadRes.statusCode).send("Archive.org yükleme hatası.");
      }
    });

    fs.createReadStream(filePath).pipe(reqUpload);
    reqUpload.on('error', () => res.status(500).send("Hata oluştu."));
  });
}

module.exports = allowCors(handler);
