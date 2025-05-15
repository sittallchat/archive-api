import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send("Sadece POST istekleri destekleniyor.");
  }

  const form = new formidable.IncomingForm({ uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Yüleme sırasında hata oluştu.");
    }

    console.log("Yülenen dosya:", files.file);

    res.status(200).send("Dosya başarıyla yülendi.");
  });
}
