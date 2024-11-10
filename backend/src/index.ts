import textToSpeech from "@google-cloud/text-to-speech";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import OpenAI from "openai";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// app.use(
//   express.text({
//     limit: "10mb",
//     type: ["text/html", "text/plain", "application/javascript"],
//   })
// );

app.use(express.json(
  {
    limit: "10mb"
  }
));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

import path from "path";

const keyFilename = path.resolve(
  __dirname,
  "../secret/sample1-a0cb0-096e65d87e5e.json"
);

const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: keyFilename,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

// Define the request body type for TypeScript
interface ChatRequestBody {
  prompt: string;
}
function parseHtmlResponse(html: string): string {
  return html
    .replace(/```html|```/g, "") // Remove code block markers
    .replace(/\s{2,}/g, " ") // Replace 2+ spaces with single space
    .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with double newline
    .trim(); // Remove leading/trailing whitespace
}

const prompt1 = `You are an AI assistant that helps summarize and turn website content into digestible accessible format for visual lerners. You will be given the content of the website. Your task is to analyze the content of the website, take the content, and produce a consise outline that wil then be used to make a page to present a concise digestable summary of the website.

1. Analyze the website content
2. Create a concise summary
3. Produce a well-structured HTML page that presents this summary in a visually appealing way

The HTML output should:
- Use a clean, modern design with cards, grids, and sections
- Include relevant emojis as icons where appropriate
- Be interactive when beneficial to understanding
- Be organized for easy reading and visual learning
- Use a consistent style with proper spacing and typography
- Not include placeholder images

The summary should be a concise and detailed, include important and detailed information. Keep the summary and analysis consise, 800 words max.

Input website content:`;


const audioPrompt=`You are an AI assistant that helps summarize and turn website content into a digestible, accessible format for visual learners. You will be given the content of the website. Your task is to analyze the content of the website, take the content, and produce a concise summary of the website, capped at 300 words. The summary should be suitable for conversion into an audio file that does not exceed 3 minutes when read aloud at a normal speaking pace. Adapt the summery and analysis depending on the context, for example:

- If it's about a detailed weather forecast, provide an interpretation of radar data and discuss humidity levels.
- If it's about a sports event or a news article, give a concise summary, mention any biases, and predict the winning chances for teams if it's a sports article.
- If it's a YouTube video, write a brief summary and analyze the sentiment of the video and top comments.
- If it's a map or a review, summarize the key review points, determine the overall sentiment, and suggest nearby places of interest.
- If none of the categories fit, read the text, identify a theme, then summarize based on that theme and/or perform sentiment analysis.`;

var prompt2:any ;

function buildPrompt2(colorB:any,dys:any,highC:any)
{
  prompt2 = `You are an AI assistant that turns summarys to HTML pages. You will be given a summary of the website and sugested components and icons. Your task is to use the summary and sugested visual components to produce a well-structured HTML page to present a concise digestable summary of the website. The HTML page you produce, can be interactive and adapt depending on the context of the website. Make it for visual learners. Ensure the HTML output is visually appealing and digestible. Style it acordingly. Do not include any placeholder images.

Organize the content in a way that is easy to read and understand (for example, cards in a grid). You can use emojis for icons.

Make sure to include all usful information from the summary (dont just make it a high level summary, actualy include detailes and usful information).

Keep the folloing accesabilety variubles in mind when styling the page:
color blind: ${colorB}
dislexic: ${dys}
high contrast: ${highC}


Encapsulate your HTML output exclusively between the <generatedcode> and </generatedcode> tags.

Input summary:`;
  
return prompt2

}

app.post("/process-html", async (req: any, res: any) => {
  try {
    const reqs = req.body;
  
    if (!reqs['websiteContent']) {
      return res.status(400).json({ error: "Content is required" });
    }

    // First API call - Get the summary
    const summaryResponse = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt1 + reqs['websiteContent'] }],
    });

    const summary = summaryResponse.choices[0].message?.content;
    if (!summary) {
      throw new Error("Failed to generate summary");
    }
    console.log("buildP2",buildPrompt2(reqs['colorB'],reqs['dys'],reqs['highC']))
    // Second API call - Convert summary to HTML
    const htmlResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: buildPrompt2(reqs['colorB'],reqs['dys'],reqs['highC']) + summary }],
    });
``
    const reply = htmlResponse.choices[0].message?.content;
    const parsedHTML = parseHtmlResponse(reply!);

    res.setHeader("Content-Type", "text/html");
    return res.send(parsedHTML);
  } catch (error: any) {
    console.error("Error processing content:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

// Define an endpoint to generate responses using OpenAI's ChatGPT
app.post("/chat", async (req: any, res: any) => {
  try {
    const { prompt } = req.body as ChatRequestBody;

    // Check if the prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Use OpenAI to create a chat completion (response from ChatGPT)
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the reply and send it as a response
    const reply = response.choices[0].message?.content;
    const parsedHTML = parseHtmlResponse(reply!);

    // Set the Content-Type to text/html and send the HTML response
    res.setHeader("Content-Type", "text/html");
    return res.send(parsedHTML);
  } catch (error: any) {
    console.error("Error processing prompt:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

async function generateSummary(text: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: audioPrompt + text }],
  });

  let summary = response.choices[0].message?.content || "";

  // Trim the summary to 300 words if necessary
  const words = summary.split(/\s+/);
  if (words.length > 300) {
    summary = words.slice(0, 300).join(" ") + "...";
  }

  return summary.trim();
}

function splitTextIntoChunks(text: string, maxChunkBytes: number): string[] {
  const encoder = new TextEncoder();
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    const testChunk = currentChunk ? `${currentChunk} ${word}` : word;
    const chunkBytes = encoder.encode(testChunk).length;

    if (chunkBytes > maxChunkBytes) {
      if (!currentChunk) {
        // Single word exceeds the max chunk size
        throw new Error("A single word is too large to process");
      }
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk = testChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function generateAudioFromText(text: string): Promise<Buffer> {
  const maxChunkLength = 5000; // Maximum allowed bytes per chunk
  const textChunks = splitTextIntoChunks(text, maxChunkLength);

  const audioBuffers: Buffer[] = [];

  for (const chunk of textChunks) {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: chunk },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    });

    const audioContent = response.audioContent as Buffer;

    if (audioContent) {
      audioBuffers.push(audioContent);
    } else {
      throw new Error("Failed to generate audio for a chunk");
    }
  }

  // Concatenate all audio buffers into one
  const combinedAudio = Buffer.concat(audioBuffers);
  return combinedAudio;
}

app.post("/generate-mp3", async (req: any, res: any) => {
  const text = req.body.text || req.body;

  if (!text) {
    return res
      .status(400)
      .json({ error: "Text is required for MP3 generation" });
  }

  try {
    // Step 1: Generate the summary
    const summary = await generateSummary(text);

    // Step 2: Generate audio from the summary
    const audioContent = await generateAudioFromText(summary);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'attachment; filename="output.mp3"');
    return res.send(audioContent);
  } catch (error: any) {
    console.error("Error generating MP3:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
