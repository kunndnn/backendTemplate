import multer, { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import path from "path";
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

export const upload = multer({
  storage: storage(),
});

// export const userImage = multer({ // test
//   storage: storage("images"),
// });
