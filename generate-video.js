export default async function handler(req, res) {
    // 1. CORS Başlıklarını en başta ve eksiksiz tanımlıyoruz
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-export default async function handler(req, res) {
    // 1. YAPAY ZEKANIN İSTEDİĞİ HEADER'LARI (BAŞLIKLARI) BURAYA EKLİYORUZ:
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Tüm sitelerden gelen isteklere izin verir
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // 2. YAPAY ZEKANIN İSTEDİĞİ "OPTIONS" İSTEĞİNİ KARŞILAMA KODU:
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Tarayıcının ön kontrolüne anında "geçebilirsin" (200 OK) der.
    }

    // 3. ASIL POST İSTEĞİNİN İŞLENDİĞİ YER (RUNWAY BAĞLANTISI):
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        let bodyData = req.body;
        if (typeof bodyData === 'string' && bodyData.trim() !== '') {
            bodyData = JSON.parse(bodyData);
        }

        const { script } = bodyData || {};
        
        if (!script) {
            return res.status(400).json({ error: "Script alanı zorunludur." });
        }
        
        // Runway API'ye istek atılıyor
        const response = await fetch("https://api.runwayml.com/v1/videos", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                promptText: script,
                duration: 10,
                ratio: "16:9",
                model: "gen3a_turbo",
            }),
        });
        
        const data = await response.json();
        
        // Yapay zekanın bahsettiği durum: Runway hemen video linki vermez, bir task/job ID döner.
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error || "Runway API hatası",
                details: data,
            });
        }
        
        // Başarılıysa job/task bilgisini Framer'a fırlatıyoruz
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Sunucu hatası",
            message: error.message,
        });
    }
}, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // 2. Tarayıcının ön kontrol (OPTIONS) isteğini ANINDA 200 OK ile bitiriyoruz
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Sadece POST isteklerini kabul et
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Gelen veriyi güvenli oku
        let bodyData = req.body;
        if (typeof bodyData === 'string' && bodyData.trim() !== '') {
            try {
                bodyData = JSON.parse(bodyData);
            } catch (e) {
                // JSON parse hatası olursa devam etsin
            }
        }

        const { script } = bodyData || {};
        
        if (!script) {
            return res.status(400).json({ error: "Script is required" });
        }
        
        // Runway API'ye istek at
        const response = await fetch("https://api.runwayml.com/v1/videos", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                promptText: script,
                duration: 10,
                ratio: "16:9",
                model: "gen3a_turbo",
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error || "Runway API error",
                details: data,
            });
        }
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: "Server error",
            message: error.message,
        });
    }
}
