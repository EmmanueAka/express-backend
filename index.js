import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

// Expanded Middleware configuration to parse incoming body structures safely
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("CRITICAL WARNING: GROQ_API_KEY is not defined in your environment variables!");
}

const client = new Groq({ apiKey: GROQ_API_KEY });

app.post("/ask-ai", async (req, res) => {
    // Fallback extraction logic prevents crashing if data is wrapped inside alternative payloads
    const prompt = req.body.prompt || (req.body.bodyPayload && req.body.bodyPayload.prompt);

    if (!prompt) {
        return res.status(400).json({ answer: "Error: No prompt was provided in the request body." });
    }

    try {
        // Updated model parameter to the current active long-context standard
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful, encouraging AI academic tutor assisting students with their lessons."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_completion_tokens: 1024
        });

        const answer = response.choices[0]?.message?.content || "No response from Groq";
        return res.json({ answer });

    } catch (err) {
        // Detailed logging helps you inspect the exact API error message in your terminal console
        console.error("Groq API Error Details:", err);
        return res.status(500).json({
            answer: "Error connecting to Groq service. Check your server terminal logs for exact network reasons."
        });
    }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running successfully!`);
    console.log(`- Mobile device network endpoint available.`);
});
