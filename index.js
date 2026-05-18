const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '10mb' }));

const NVIDIA_BASE = 'https://integrate.api.nvidia.com';

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.all('/v1/*', async (req, res) => {
  try {
    const url = `${NVIDIA_BASE}${req.url}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limited by NVIDIA. Wait 15-30 seconds." });
    }

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (err) {
    console.error("Bridge Error:", err);
    res.status(500).json({ error: "Proxy Error", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NVIDIA Bridge is running on port ${PORT}`);
});
