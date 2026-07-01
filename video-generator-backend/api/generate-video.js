export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Sadece POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }

  try {
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { script } = body;

    if (!script) {
      return res.status(400).json({
        success: false,
        error: "Script is required.",
      });
    }

    const runwayResponse = await fetch(
      "https://api.runwayml.com/v1/videos",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gen3a_turbo",
          promptText: script,
          ratio: "16:9",
          duration: 10,
        }),
      }
    );

    const data = await runwayResponse.json();

    if (!runwayResponse.ok) {
      return res.status(runwayResponse.status).json({
        success: false,
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}