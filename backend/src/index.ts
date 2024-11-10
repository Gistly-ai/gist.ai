import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import OpenAI from 'openai';
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON

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