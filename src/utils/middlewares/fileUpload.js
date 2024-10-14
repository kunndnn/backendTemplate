const path = require("path");
const multer = require("multer");
const { existsSync, mkdirSync } = require("fs");
const storage = (dest = "temp") =>
  diskStorage({
    destination: function (req, file, cb) {
      const URI = `./public/${dest}`;
      if (!existsSync(URI)) mkdirSync(URI, { recursive: true });
      cb(null, URI);
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

exports.upload = multer({ storage: storage() });
exports.userImage = multer({
  // test
  storage: storage("images"),
});