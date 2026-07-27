# NoteSmart - AI Meeting & Class Notes Assistant

A comprehensive AI-powered note-taking platform that transforms real-time speech into structured notes, enhancing learning and meeting efficiency through intelligent processing and interactive features.

**Live Demo:** [https://d3a5oz43hbtqzi.cloudfront.net/](https://d3a5oz43hbtqzi.cloudfront.net/)

## Table of Contents
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Development Resources](#development-resources)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Core Features

### 1. Real-time Speech Processing & Note Generation
- **Intelligent Transcription**
  - Deepgram API for real-time speech recognition
  - Multi-language support with high accuracy
  - Automatic punctuation and formatting
- **AI-Powered Note Structure**
  - OpenAI-driven content organization
  - Key points extraction and highlighting
  - Automatic summary generation
  - Manual editing capabilities

### 2. Smart Learning Enhancement
- **Interactive Study Tools**
  - AI-generated flashcards for quick review
  - Custom practice questions (MCQ)
  - Visual mind mapping
  - Context-aware Q&A system

### 3. Versatile Content Import
- **Multiple Input Methods**
  - Real-time microphone recording
  - PDF document processing
  - Audio file transcription
  - YouTube video analysis

### 4. Note Management
- **Organization Features**
  - Custom categorization system
  - Smart tagging and search
  - Auto-save functionality
  - Export in multiple formats

## Technical Architecture

### Frontend Development
- Next.js for server-side rendering
- Redux state management
- Tailwind CSS for responsive design
- WebRTC for audio streaming

### Backend Infrastructure
- Node.js/Express.js API
- PostgreSQL for user data
- MongoDB for note storage
- AWS S3 for media files

### AI Integration
- OpenAI GPT-4 for processing
- LangChain for AI workflows
- Custom prompt engineering
- Real-time processing pipeline

### Security & Performance
- **Data Protection**
  - End-to-end encryption
  - Secure authentication (Auth0)
  - Regular backups
  - GDPR compliance
- **Performance Optimization**
  - CDN distribution
  - Caching strategies
  - Rate limiting
  - Load balancing

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites
- Node.js (v14.x or later)
- npm (v7.x or later)
- API keys for:
  - Deepgram
  - OpenAI
  - Auth0

### Installation
1. Clone the repository
   ```
   git clone https://github.com/ywutian/notesmart.git
   cd notesmart
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your API keys (see `.env.example`)

4. Start the development server
   ```
   npm start
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can eject at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except eject will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use eject. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However, we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Development Resources

### Learning React
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
To learn React, check out the [React documentation](https://reactjs.org/).

### Additional Topics
- [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
- [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
- [Making a Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
- [Advanced Configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

## Deployment
For deployment instructions, see the [deployment documentation](https://facebook.github.io/create-react-app/docs/deployment).

## Troubleshooting
If your `npm run build` fails to minify, check this [troubleshooting guide](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify).

## Contributing
Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
