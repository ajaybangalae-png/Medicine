import { useState } from "react";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:5000";

function toReadableLine(key, value) {
  if (value === null || value === undefined) {
    return `${key}: -`;
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `${key}: ${value.join(", ")}`;
    }
    return `${key}: ${Object.entries(value)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(", ")}`;
  }
  return `${key}: ${String(value)}`;
}

function formatResponse(data) {
  if (data === null || data === undefined) {
    return "No output received.";
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return String(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => formatResponse(item)).join("\n");
  }

  if (typeof data === "object") {
    if ("output" in data) {
      return formatResponse(data.output);
    }
    if ("result" in data) {
      return formatResponse(data.result);
    }
    if ("message" in data && Object.keys(data).length === 1) {
      return String(data.message);
    }

    return Object.entries(data)
      .map(([key, value]) => toReadableLine(key, value))
      .join("\n");
  }

  return "Unable to format response.";
}

export default function App() {
  const [medicineName, setMedicineName] = useState("");
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/medicine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: medicineName.trim(),
          disease: disease.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Request failed.");
      }

      setResult(formatResponse(payload.data));
    } catch (submitError) {
      setError(submitError.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <motion.main
        className="card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1
          className="title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Medicine Insight Request
        </motion.h1>

        <p className="subtitle">
          Enter your medicine and disease details. The request is sent to your
          n8n webhook and the result is shown below.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="medicineName">Medicine Name</label>
          <input
            id="medicineName"
            name="medicineName"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="e.g. Paracetamol"
            required
          />

          <label htmlFor="disease">Disease / Condition</label>
          <input
            id="disease"
            name="disease"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            placeholder="e.g. Fever"
            required
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit to Webhook"}
          </motion.button>
        </form>

        {error && (
          <motion.section
            className="output error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Error</h2>
            <pre>{error}</pre>
          </motion.section>
        )}

        {result && (
          <motion.section
            className="output success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Webhook Response</h2>
            <pre>{result}</pre>
          </motion.section>
        )}
      </motion.main>
    </div>
  );
}
