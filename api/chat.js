export default async function handler(req, res) {
  // only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("method not allowed");
    return;
  }

  try {
    const { message } = req.body;

    // make sure message exists
    if (!message) {
      res.status(400).send("missing message");
      return;
    }

    // send request to gemini
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

    // extract ALL text parts
    let output = "";

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      output = data.candidates[0].content.parts
        .map(part => part.text || "")
        .join("");
    }

    // return ONLY plain text
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output || "no response");
  } catch (error) {
    res.status(500).send("server error");
  }
}
