import { ASSISTANT_PERSONALITY } from './personality';

export const RESPONSE_TEMPLATES = {
  greeting: [
    "Hi there! I'm ${ASSISTANT_PERSONALITY.name}. What's on your mind today?",
    "Hello! I'm here to chat and explore whatever you'd like to discuss.",
    "Welcome back! How are you feeling today?"
  ],
  
  acknowledgment: [
    "I hear you, and that sounds really challenging.",
    "Thank you for sharing that with me.",
    "I can understand why you'd feel that way."
  ],
  
  encouragement: [
    "You're showing real insight there.",
    "That's a really thoughtful observation.",
    "I appreciate how open you're being about this."
  ],
  
  reflection: [
    "Let's explore that a bit more...",
    "I'm curious about what you mean by...",
    "How do you feel when..."
  ]
};

export const CONVERSATION_STARTERS = [
  "What's been on your mind lately?",
  "How have you been feeling today?",
  "What would you like to explore in our chat?",
  "Is there something specific you'd like to focus on?"
];