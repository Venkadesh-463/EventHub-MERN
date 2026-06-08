const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Event = require('../models/Event');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake-key-for-now');

// @desc    Handle AI chat queries with event context
// @route   POST /api/ai/chat
// @access  Public
const handleAiChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    // 1. Fetch active events to use as context
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .select('title description date time location department category isFree price')
      .lean();

    // 2. Format context string
    let contextStr = "You are EventHub Assistant, an AI helper for a college event management platform.\n\n";
    contextStr += "Here are the current active events on the platform:\n";
    
    if (events.length === 0) {
      contextStr += "- No active events at the moment.\n";
    } else {
      events.forEach(ev => {
        const dateStr = new Date(ev.date).toLocaleDateString();
        contextStr += `- Event: "${ev.title}" (${ev.category}, ${ev.department})\n`;
        contextStr += `  When: ${dateStr} at ${ev.time}\n`;
        contextStr += `  Where: ${ev.location}\n`;
        contextStr += `  Price: ${ev.isFree ? 'Free' : '₹' + ev.price}\n`;
        contextStr += `  Description: ${ev.description.substring(0, 150)}...\n\n`;
      });
    }

    contextStr += "Please answer the user's query based ONLY on this information when it comes to events. If the user asks general questions, be polite and helpful. Do not mention that you were provided this context.\n\n";
    
    // 3. Combine context with user message
    const prompt = `${contextStr}\nUser query: ${message}`;

    // 4. Generate response
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    sendResponse(res, 200, 'AI response generated', { reply: text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI response. Please check API Key.' });
  }
});

module.exports = { handleAiChat };
