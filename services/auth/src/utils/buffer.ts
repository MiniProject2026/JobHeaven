import Dataurioarser from "datauri/parser.js";
import path from "path";

const getbuffer = (file:any) => {
    const parser = new Dataurioarser();

    const ext = path.extname(file.originalname).toString();

    return parser.format(ext, file.buffer);
}

export default getbuffer;