## Gist.ai

![Banner](https://i.postimg.cc/J4N8ws18/gist-ai-banner.jpg)

**Gist.ai** is a Chrome extension that simplifies web content, summarizes it in real-time, and even generates a short podcast-style audio summary for hands-free browsing. Designed for accessibility and ease of understanding, Gist.ai is built with React, TailwindCSS, Node.js, and Express, integrating AI and contextual APIs to bring concise insights and summaries from complex information.

### Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Configuration](#configuration)
- [License](#license)

---

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Gistly-ai/gist.ai.git
   ```

2. **Configure API Keys and Environment:**

   ```bash
   cd backend
   mkdir secrets
   touch .env
   ```

   #### OpenAI Configuration:

   - Create an account at [OpenAI Platform](https://platform.openai.com)
   - Generate an API key from your dashboard
   - Add the following to your `.env` file:
     ```
     OPENAI_API_KEY=your_api_key_here
     PORT=3000
     ```

   #### Google Cloud Configuration:

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Text-to-Speech API for your project
   - Navigate to IAM & Admin > Service Accounts
   - Create a new service account
   - Create a new key (JSON type) for this service account
   - Download the JSON file and place it in the `backend/secrets` folder
   - Rename it to `google-credentials.json`

3. **Set Up the Backend:**

   ```bash
   npm install
   npm start
   ```

   This will install the necessary backend dependencies and start the backend server.

4. **Set Up the Frontend as a Chrome Extension:**

   - Open Google Chrome and go to `chrome://extensions`.
   - Enable **Developer mode** (top right corner).
   - Click on **Load unpacked** and select the `frontend` folder within the project directory.
   - You should see Gist.ai listed as an enabled extension.

5. **Launch the Extension:**
   - Click the Gist.ai icon in the Chrome extensions toolbar to start using the extension.

---

### Features

- **Real-Time Summarization:** Gist.ai simplifies and summarizes web content as you browse.
- **Audio Podcast Summary:** Generates a 1-2 minute audio summary of the webpage, providing a hands-free, podcast-like experience for on-the-go users.
- **Accessible Content:** Makes complex information easier to understand for all users.
- **Personalized Settings:** Users can customize the extension’s functionality and appearance.
- **Seamless API Integrations:** Utilizes advanced AI and contextual data APIs for enriched summaries.

### Configuration

- **OpenAI Configuration:**

  - Create an account at [OpenAI Platform](https://platform.openai.com)
  - Generate an API key from your dashboard
  - Add the following to your `.env` file:
    ```
    OPENAI_API_KEY=your_api_key_here
    PORT=3000
    ```

- **Google Cloud Configuration:**
  - Go to [Google Cloud Console](https://console.cloud.google.com)
  - Create a new project or select an existing one
  - Enable the Text-to-Speech API for your project
  - Navigate to IAM & Admin > Service Accounts
  - Create a new service account
  - Create a new key (JSON type) for this service account
  - Download the JSON file and place it in the `backend/secrets` folder
  - Rename it to `google-credentials.json`

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Authors

- [Nirman Malaviya](https://github.com/Nirman529)
- [Harsh Jain](https://github.com/harsh3401)
- [Abhinav Prakash](https://github.com/abhinavprkash)
- [Daniel Trachtenberg](https://github.com/daniel-trachtenberg)
