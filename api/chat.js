export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("method not allowed");
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).send("missing GROQ_API_KEY");
    }

    // inject model automatically
    const groqBody = {
      model: "llama-3.3-70b-versatile",
      ...body
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(groqBody)
      }
    );

    const data = await response.json();

    // groq error handling
    if (data.error) {
      return res
        .status(500)
        .send("groq error: " + data.error.message);
    }

    // extract AI response
    const text =
      data?.choices?.[0]?.message?.content || "";

    if (!text) {
      return res
        .status(500)
        .send("empty response: " + JSON.stringify(data));
    }

    // return plain text ONLY (penguinmod-friendly)
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(text);

  } catch (err) {
    return res
      .status(500)
      .send("server error: " + err.message);
  }
}
