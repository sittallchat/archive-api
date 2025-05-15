import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send("Sadece POST istekleri destekleniyor.");
  }

  const form = new IncomingForm({ uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Yükleme sırasında hata oluştu.");
    }

    console.log("Yüklenen dosya:", files.file);
    res.status(200).json({
      message: "Dosya başarıyla yüklendi.",
      filename: files.file.originalFilename,
      size: files.file.size
    });
  });
}
