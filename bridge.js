const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const pty = require('node-pty');

// 1. Create the Terminal Process (Your Dev CLI)
const term = pty.spawn('cmd.exe', ['/k', 'dev activate'], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(), // Starts in your current folder
    env: process.env
});

// 2. Stream the Terminal to the Web
app.ws('/terminal', (ws) => {
    // Send terminal output to browser
    term.onData(data => ws.send(data));
    // Send browser typing to terminal
    ws.on('message', msg => term.write(msg));
});

app.get('/', (req, res) => {
    res.send(`<html><body style="background:#000;color:#fff;">
        <h2>Bridge Active</h2>
        <div id="terminal"></div>
        <script>
            const ws = new WebSocket('ws://localhost:8200/terminal');
            ws.onmessage = (e) => document.getElementById('terminal').innerText += e.data;
            window.onkeydown = (e) => ws.send(e.key === "Enter" ? "\\r" : e.key);
        </script>
    </body></html>`);
});

app.listen(8200, () => console.log('Bridge ready at http://localhost:8200'));
