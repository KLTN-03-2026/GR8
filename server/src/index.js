// Load env FIRST before any other imports
import { config } from "dotenv";
config();

import app from "./app.js";
import { startInvoiceReleaseJob } from "./jobs/invoiceRelease.job.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Khởi động job tự động phát hành hóa đơn
  startInvoiceReleaseJob();
});
