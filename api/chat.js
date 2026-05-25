export default async function handler(req, res) {
  // allow only POST
  if (req.method !== "POST") {
    return res.status(405).send("method not allowed");
  }

  try {
    // debug incoming body
    console.log("BODY:", req.body);

    const message = req.body?.message;

    if (!message) {
      return res.status(400).send("missing message");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RESPONSE:", JSON.stringify(data));

    const output =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(output || "empty ai response");

  } catch (error) {
    console.error(error);
    return res.status(500).send("server error");
  }
}
