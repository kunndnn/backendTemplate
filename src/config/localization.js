import i18n from "i18n";
import path from "path";

i18n.configure({
  locales: ["en", "hi"],
  defaultLocale: "en",
  directory: path.join(process.cwd(), "locales"),
});

export default i18n;
// usage res.__("key")
