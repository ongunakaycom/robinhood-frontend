const functions = require('firebase-functions');
const axios = require('axios');

const AYA_API_URL = "https://api.deepseek.com";
const MODEL_NAME = "deepseek/deepseek-r1:free";

exports.getAIResponse = functions.https.onRequest(async (req, res) => {
  const { userPrompt } = req.body;

  try {
    const payload = {
      model: MODEL_NAME,
      messages: [{ role: "user", content: userPrompt }],
    };

    const response = await axios.post(`${AYA_API_URL}/generate`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    });

    const responseText = response.data.choices?.[0]?.message?.content || "I didn't quite get that.";
    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: 'AI response error' });
  }
});
