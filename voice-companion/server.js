const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let clients = [];

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

app.post('/speak', (req, res) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).send('Text is required');
    }
    
    clients.forEach(client => client.write(`data: ${JSON.stringify({ text })}\n\n`));
    res.send('Message sent to TTS clients');
});

app.post('/speak-file', (req, res) => {
    const filePath = req.body.filePath;
    if (!filePath) {
        return res.status(400).send('filePath is required');
    }
    
    try {
        let text = fs.readFileSync(filePath, 'utf8');
        
        // Strip out Markdown formatting for cleaner speech
        // 1. Remove code blocks
        text = text.replace(/```[\s\S]*?```/g, '');
        // 2. Remove inline code
        text = text.replace(/`([^`]+)`/g, '$1');
        // 3. Remove URLs but keep link text: [text](url) -> text
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // 4. Remove bold/italics
        text = text.replace(/(\*\*|__|\*|_)/g, '');
        // 5. Remove headers
        text = text.replace(/^#+\s+/gm, '');
        // 6. Remove blockquotes
        text = text.replace(/^>\s+/gm, '');
        // 7. Remove markdown alerts like [!IMPORTANT]
        text = text.replace(/\[!.*?\]/g, '');
        
        clients.forEach(client => client.write(`data: ${JSON.stringify({ text })}\n\n`));
        res.send('File content processed and sent to TTS clients');
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).send('Error reading file');
    }
});

app.listen(port, () => {
    console.log(`Voice companion server running at http://localhost:${port}`);
});
