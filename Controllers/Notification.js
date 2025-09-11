import admin from "../config/firebase.js";

export const sendToUser = async (req, res) => {
    try {
        const { token, title, body } = req.body;

        if (!token || !title || !body) {
            return res.status(400).json({ success: false, message: "Token, title and body are required" });
        }

        const message = {
            notification: { title, body },
            android: { notification: { sound: "default" } },
            apns: { payload: { aps: { sound: "default" } } },
            token,
        };

        const response = await admin.messaging().send(message);
        res.json({ success: true, message: "Notification sent to user", response });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const sendToAll = async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, message: "Title and body are required" });
        }

        const message = {
            notification: { title, body },
            topic: "allUsers",
            android: { notification: { sound: "default" } },
            apns: { payload: { aps: { sound: "default" } } },
        };

        const response = await admin.messaging().send(message);
        res.json({ success: true, message: "Notification sent to all users", response });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
