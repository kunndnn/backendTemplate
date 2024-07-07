import { con } from "../../db/index.js";
import { promisify } from "util";
export const query = promisify(con.query).bind(con);
// usage await query('RAW query');
