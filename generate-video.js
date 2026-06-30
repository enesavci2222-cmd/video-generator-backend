// api/generate-video.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const { script, duration = 10 } = req.body;
        if (!script || script.length === 0) {
            return res.status(400).json({
                error: "Script is required"
            })
        }
        
        const response = await fetch("https://api.runwayml.com/v1/videos", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                promptText: script,
                duration,
                ratio: "16:9",
                model: "gen3a_turbo",
            }),
        })
        
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error || "Runway API error",
                details: data,
            })
        }
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: "Server error",
            message: error.message,
        })
    }
}