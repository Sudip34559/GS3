import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Data } from "../models/data.model.js";
import { Type } from "../models/type.model.js";
import { client } from "../index.js";

// In-memory conversation storage (consider using Redis for production)
const conversationMemory = new Map();

// Helper function to clean up old conversations (run periodically)
function cleanupOldConversations() {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 30 * 60 * 1000; // 30 minutes

  for (const [sessionId, session] of conversationMemory.entries()) {
    if (now - session.lastActivity > CLEANUP_THRESHOLD) {
      conversationMemory.delete(sessionId);
    }
  }
}

async function getTypeIdFromQuery(userQuery) {
  const types = await Type.find();
  const typeNames = types.map((t) => `${t.name}: ${t.description}\n`).join("");

  const prompt = `
        You are a smart assistant for GS3. The user submitted this query: 
        "${userQuery}"
        
        Available types are: (name:description)->${typeNames}.
        
        Please select the **best matching type name** based on the intent of the query. Just reply with one of these type names (no extra explanation).
        `;

  const completion = await client.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  const response = completion.choices[0]?.message?.content
    ?.trim()
    .toLowerCase();

  console.log("AI response for type:", response);

  const matchedType = types.find((t) => t.name.toLowerCase() === response);
  return matchedType?._id ?? null;
}

async function getData(typeId) {
  const data = await Data.find({ type: typeId });
  if (!data || data.length === 0) {
    return "";
  }
  const context = data.map((d) => d.data).join(", ");
  return context;
}

async function predictQueryRelation(currentQuery, lastQuery, lastContext) {
  if (!lastQuery) return { isNewTopic: true, confidence: 1.0 };

  const prompt = `
    You are an intelligent query analyzer. Analyze if the current user query is related to the previous query or if it's a completely new topic.

    Previous Query: "${lastQuery}"
    Current Query: "${currentQuery}"
    Previous Context: "${
      lastContext ? lastContext.substring(0, 200) : "No context"
    }"

    Determine:
    1. Is the current query a follow-up/continuation of the previous query? (asking for more details, clarification, or related information)
    2. Or is it a completely new topic/question?

    Respond with ONLY ONE of these options:
    - "FOLLOW_UP" if it's related to the previous query
    - "NEW_TOPIC" if it's a completely different topic

    Consider:
    - Pronouns like "this", "that", "it" usually indicate follow-up
    - Asking for more details, explanation, or clarification = follow-up
    - Completely different subject matter = new topic
    - Questions about different services/products = new topic
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content
      ?.trim()
      .toUpperCase();
    console.log("Query relation prediction:", response);

    return {
      isNewTopic: response === "NEW_TOPIC",
      isFollowUp: response === "FOLLOW_UP",
      confidence: 0.9,
    };
  } catch (error) {
    console.error("Error predicting query relation:", error);
    // Fallback to simple heuristics
    return simpleQueryRelationCheck(currentQuery, lastQuery);
  }
}

function simpleQueryRelationCheck(currentQuery, lastQuery) {
  const current = currentQuery.toLowerCase();
  const last = lastQuery.toLowerCase();

  // Strong follow-up indicators
  const strongFollowUpIndicators = [
    "this",
    "that",
    "it",
    "they",
    "them",
    "these",
    "those",
    "more",
    "explain",
    "how",
    "why",
    "what about",
    "tell me more",
    "elaborate",
    "details",
    "further",
    "continue",
    "also",
  ];

  // Strong new topic indicators
  const strongNewTopicIndicators = [
    "now",
    "next",
    "different",
    "another",
    "instead",
    "other",
    "new",
    "change",
    "switch",
    "about",
    "regarding",
    "concerning",
  ];

  const hasStrongFollowUp = strongFollowUpIndicators.some((indicator) =>
    current.includes(indicator)
  );

  const hasStrongNewTopic = strongNewTopicIndicators.some((indicator) =>
    current.includes(indicator)
  );

  // Check for overlapping words (simple similarity)
  const currentWords = current.split(" ").filter((word) => word.length > 3);
  const lastWords = last.split(" ").filter((word) => word.length > 3);
  const commonWords = currentWords.filter((word) => lastWords.includes(word));
  const similarity =
    commonWords.length / Math.max(currentWords.length, lastWords.length);

  if (hasStrongFollowUp && !hasStrongNewTopic) {
    return { isNewTopic: false, isFollowUp: true, confidence: 0.8 };
  }

  if (hasStrongNewTopic && !hasStrongFollowUp) {
    return { isNewTopic: true, isFollowUp: false, confidence: 0.8 };
  }

  if (similarity > 0.3) {
    return { isNewTopic: false, isFollowUp: true, confidence: 0.6 };
  }

  // Default to new topic if uncertain
  return { isNewTopic: true, isFollowUp: false, confidence: 0.5 };
}

const chat = asyncHandler(async (req, res) => {
  const { userQuery, sessionId = "default" } = req.body;

  if (!userQuery) {
    throw new ApiError(400, "User query is required");
  }

  // Clean up old conversations periodically
  if (Math.random() < 0.1) {
    // 10% chance to run cleanup
    cleanupOldConversations();
  }

  // Get or create conversation session
  let session = conversationMemory.get(sessionId) || {
    messages: [],
    lastQuery: "",
    lastType: null,
    currentContext: "",
    lastActivity: Date.now(),
  };

  // Update last activity
  session.lastActivity = Date.now();

  let typeId = null;
  let context = "";
  let queryRelation = { isNewTopic: true, isFollowUp: false };

  // Intelligently determine query relation using AI
  if (session.lastQuery) {
    queryRelation = await predictQueryRelation(
      userQuery,
      session.lastQuery,
      session.currentContext
    );
    console.log("Query relation analysis:", queryRelation);
  }

  // Handle follow-up queries
  if (queryRelation.isFollowUp && session.lastType && session.currentContext) {
    // This is a follow-up query, use previous context and type
    typeId = session.lastType;
    context = session.currentContext;
    console.log("Follow-up query detected, reusing previous context");
  } else {
    // New topic - get fresh type and data
    typeId = await getTypeIdFromQuery(userQuery);
    console.log("New topic detected, AI predicted type ID:", typeId);

    if (typeId) {
      context = await getData(typeId);
      // Update session with new context
      session.lastType = typeId;
      session.currentContext = context;
    } else {
      // Clear previous context if no matching type found
      session.currentContext = "";
    }
  }

  // Prepare conversation history for context
  const conversationHistory = session.messages.slice(-4); // Keep last 4 messages for context

  const SYSTEM_PROMPT = `
    You are GS3 Assistant — a smart, friendly, and professional virtual agent for GS3, a company that specializes in building websites, mobile apps, and providing digital marketing solutions. GS3's mission is to deliver reliable, creative, and cost-effective tech and marketing services to businesses and individuals.

    Context about the current topic: ${
      context || "No specific context available"
    }
    
    Previous conversation context: ${
      conversationHistory.length > 0
        ? conversationHistory
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n")
        : "This is the start of the conversation"
    }
    
    Query Type: ${queryRelation.isFollowUp ? "Follow-up question" : "New topic"}
    Context Availability: ${
      context ? "Relevant context provided" : "No specific context"
    }

    Your responsibilities include:
    - Understanding user needs or problems related to websites, apps, SEO, social media marketing, or other services GS3 offers
    - Responding helpfully to complaints, queries, or issues with any GS3-delivered service
    - Collecting important information from users (like name, email, project ID, type of issue, etc.)
    - Helping prospects understand which GS3 services can help them grow their business
    - Offering follow-up options like booking a call, sending an email, or assigning a support ticket
    - Always being clear, polite, honest, and solution-focused
    - If the user asks for more details or explanations about the previous topic, provide comprehensive information
    - If no context is available for the query, politely say you don't have specific information about that topic

    Rules:
    - Keep responses concise but informative
    - If user asks for more details, provide broader information
    - Maintain conversation flow and remember what was discussed
    - Start new conversations with: "Hi! 👋 Welcome to GS3"
    - try to shoetly explain the topic if user need more then then send more data
    
    ${
      !context
        ? "Note: No specific context found for this query. Provide general GS3 service information if relevant."
        : ""
    }
  `;

  // Create messages array for the API call
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userQuery },
  ];

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages: messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    const aiResponse = chatCompletion.choices[0].message.content;

    // Update conversation history
    session.messages.push(
      { role: "user", content: userQuery },
      { role: "assistant", content: aiResponse }
    );

    // Keep only last 10 messages to manage memory
    if (session.messages.length > 10) {
      session.messages = session.messages.slice(-10);
    }

    // Update session
    session.lastQuery = userQuery;
    conversationMemory.set(sessionId, session);

    return res.status(200).json(
      new ApiResponse(200, {
        response: aiResponse,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sessionId: sessionId,
        hasContext: !!context,
        queryType: queryRelation.isFollowUp ? "follow-up" : "new-topic",
        confidence: queryRelation.confidence,
        typeId: typeId,
      })
    );
  } catch (error) {
    console.error("Error in chat completion:", error);
    throw new ApiError(500, "Failed to generate response");
  }
});

// Optional: Endpoint to clear conversation history
const clearChatHistory = asyncHandler(async (req, res) => {
  const { sessionId = "default" } = req.body;

  conversationMemory.delete(sessionId);

  return res.status(200).json(
    new ApiResponse(200, {
      message: "Chat history cleared successfully",
    })
  );
});

// Optional: Endpoint to get conversation history
const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId = "default" } = req.query;

  const session = conversationMemory.get(sessionId);

  return res.status(200).json(
    new ApiResponse(200, {
      history: session?.messages || [],
      hasActiveSession: !!session,
    })
  );
});

export { chat, clearChatHistory, getChatHistory };
