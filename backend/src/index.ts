import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import OpenAI from 'openai';
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

app.use(express.text({ limit: '10mb', type: ['text/html', 'text/plain', 'application/javascript'] }));


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
  });

// Define the request body type for TypeScript
interface ChatRequestBody {
  prompt: string;
}
function parseHtmlResponse(html: string): string {
  return html.replace(/```html|```/g, '').replace(/\n/g, '').trim();
}

const mainprompt = "You are an AI assistant that helps summarize and turn website content into digestible accessible format for visual lerners. You will be given the content of the website. Your task is to analyze the content of the website, take the content, and produce a well-structured HTML page to present a concise digestable summary of the website, capped at 300 words. The HTML page you produce, can be interactive and adapt depending on the context of the website. Make it for visual learners.\n\nAdapt the summery and analysis depending on the context, for example:\n\n-If it's about a detailed weather forecast, provide an interpretation of radar data and discuss humidity levels.\n-If it's about a sports event or a news article, give a concise summary, mention biases if any, and predict the winning chances for teams if it's a sports article.\n-If it's a YouTube video, write a brief summary and analyze the sentiment of the video and top comments.\n-If it's a map or a review, summarize the key review points, determine the overall sentiment, suggest nearby places of interest.\n-If none of the categories fit, read the text and create a theme, then summarize based on that theme and/or perform sentiment analysis.\n\nEnsure the HTML output is visually appealing and digestible. Encapsulate your HTML output exclusively between the <generatedcode> and </generatedcode> tags.\n\nInput website content: ";

app.post('/process-html', async (req: any, res: any) => {
  try {
    
    const prompt=req.body;
    // Check if the prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Use OpenAI to create a chat completion (response from ChatGPT)
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: mainprompt + prompt }],
    });

    // Extract the reply and send it as a response
    const reply = response.choices[0].message?.content;
    const parsedHTML = parseHtmlResponse(reply!);

    // Set the Content-Type to text/html and send the HTML response
    res.setHeader('Content-Type', 'text/html');
    return res.send(parsedHTML);
  } catch (error: any) {
    console.error("Error processing prompt:", error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Define an endpoint to generate responses using OpenAI's ChatGPT
app.post('/chat', async (req: any, res: any) => {
  try {
    const { prompt } = req.body as ChatRequestBody;

    // Check if the prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use OpenAI to create a chat completion (response from ChatGPT)
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract the reply and send it as a response
    const reply = response.choices[0].message?.content;
    const parsedHTML = parseHtmlResponse(reply!);

    // Set the Content-Type to text/html and send the HTML response
    res.setHeader('Content-Type', 'text/html');
    return res.send(parsedHTML);
  } catch (error: any) {
    console.error("Error processing prompt:", error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });