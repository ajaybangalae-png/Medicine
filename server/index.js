const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEBHOOK_URL = 
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/medicine";
  // 
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "medicine-webhook-server" });
});

app.post("/api/medicine", async (req, res) => {
  const { medicineName, disease } = req.body || {};

  if (!medicineName || !disease) {
    return res.status(400).json({
      ok: false,
      message: "medicineName and disease are required.",
    });
  }

  try {
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ medicineName, disease }),
    });

    const contentType = webhookResponse.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await webhookResponse.json()
      : await webhookResponse.text();

    if (!webhookResponse.ok) {
      return res.status(webhookResponse.status).json({
        ok: false,
        message: "Webhook returned an error.",
        data,
      });
    }

    return res.json({
      ok: true,
      source: "n8n-webhook",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Failed to reach webhook.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
