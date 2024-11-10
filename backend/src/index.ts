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

const mainprompt="Analyze the information on the given webpage. If it\'s about a detailed 10-day weather forecast, provide an interpretation of radar data and discuss humidity levels. If it\'s about a sports event or a news article, give a concise summary, mention biases if any, and predict the winning chances for teams if it\'s a sports article. If it\'s a YouTube video, write a brief summary and analyze the sentiment of the video and top comments. If it\'s a map or a review, summarize the key review points, determine the overall sentiment, suggest nearby places of interest. If none of the categories fit, read the text and create a theme, then summarize based on that theme and/or perform sentiment analysis. Limit the content to 80 words. Create a well-structured HTML page to present this theme summary and analysis. Ensure the HTML output includes Headings for each section. Inline CSS styles for colors, font sizes, and padding for clarity. A visually appealing but simple design layout and make it more digestible and doesn\'t need scrolling."
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