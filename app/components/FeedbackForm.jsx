// app/components/FeedbackForm.jsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { UAParser } from 'ua-parser-js';

export default function FeedbackForm({ onClose, userId }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async () => {
        if (!message.trim()) return;

        setSending(true);

        const parser = new UAParser();
        const payload = {
            message,
            userId: userId || null,
            user_agent: navigator.userAgent || 'Unknown',
            device_type: parser.getDevice().type || 'desktop',
            os_name: parser.getOS().name || 'Unknown',
            os_version: parser.getOS().version || '',
            browser: parser.getBrowser().name || 'Unknown',
        };

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setSending(false);

            if (res.ok) {
                setSent(true);
                setTimeout(onClose, 1500);
            } else {
                const errorData = await res.json();
                console.error("Feedback submission failed:", errorData);
                alert("There was a problem submitting your feedback. Please try again.");
            }
        } catch (err) {
            setSending(false);
            console.error("Feedback submission error:", err);
            alert("There was a problem submitting your feedback. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-100">
                        Tell me what you think!
                    </h2>
                    <button onClick={onClose}>
                        <X className="text-gray-500 hover:text-gray-300" />
                    </button>
                </div>

                {sent ? (
                    <div className="text-green-400 text-center py-6">
                        Thanks — feedback received!
                    </div>
                ) : (
                    <>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-blue-500"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What’s working for you or needs improvement...?"
                        />

                        <button
                            onClick={submit}
                            disabled={sending || !message.trim()}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg transition-all"
                        >
                            {sending ? "Sending..." : "Submit Feedback"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
