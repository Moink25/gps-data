const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let currentLocation = { lat: 2, lng: 2 };

// Endpoint to receive GPS data
app.post("/location", (req, res) => {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).send("Invalid data");

    currentLocation = { lat, lng };
    io.emit("locationUpdate", currentLocation);
    res.send({ success: true });
});

// Endpoint to send call request to ESP8266
app.post("/call-device", (req, res) => {
    io.emit("callDevice");
    res.send({ success: true, message: "Call request sent to device" });
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");

    if (currentLocation.lat && currentLocation.lng) {
        socket.emit("locationUpdate", currentLocation);
    }

    socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));
