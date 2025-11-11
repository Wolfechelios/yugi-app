import multer from "multer";

// Configure Multer with proper 'limits' object.
// Import this in your server file:  import { upload } from "@/lib/upload";
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 500 * 1024 * 1024,  // 500MB per file
    fieldSize: 500 * 1024 * 1024, // 500MB for text fields
  },
});

export default upload;
