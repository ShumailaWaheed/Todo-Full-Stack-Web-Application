from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging
import os

router = APIRouter(prefix="/chat", tags=["chat"])

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[int] = None
    tool_calls: Optional[list] = None

# Mock Hugging Face integration
class HuggingFaceChatService:
    def __init__(self):
        self.conversations = {}
        self.next_conversation_id = 1

    def process_message(self, user_message: str, user_id: str, conversation_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Process user message and return AI response
        This would normally call a Hugging Face model endpoint
        """
        try:
            # Simulate calling Hugging Face API
            # In a real implementation, this would be:
            # import requests
            # hf_endpoint = os.getenv("HUGGING_FACE_ENDPOINT_URL")
            # response = requests.post(hf_endpoint, json={"inputs": user_message})

            # For now, simulate intelligent responses based on user message
            response_text = self.generate_response(user_message.lower())

            # Handle conversation state
            if conversation_id is None:
                conversation_id = self.next_conversation_id
                self.next_conversation_id += 1
                self.conversations[conversation_id] = []

            # Store conversation history
            self.conversations[conversation_id].append({
                "user": user_message,
                "ai": response_text
            })

            # Detect if user wants to create a task
            tool_calls = []
            if any(keyword in user_message.lower() for keyword in ["create task", "add task", "new task", "make task"]):
                tool_calls.append({
                    "name": "create_task",
                    "args": {"prompt": user_message}
                })

            return {
                "response": response_text,
                "conversation_id": conversation_id,
                "tool_calls": tool_calls if tool_calls else None
            }

        except Exception as e:
            logging.error(f"Error processing chat message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

    def generate_response(self, message: str) -> str:
        """Generate AI response based on user message"""
        if any(greeting in message for greeting in ["hello", "hi", "hey", "greetings"]):
            return "Hello! I'm your AI assistant. How can I help you manage your tasks today? You can ask me to create, update, or view your tasks."
        elif any(keyword in message for keyword in ["create", "add", "new"]):
            return "Sure! I can help you create a new task. What would you like to name your task? You can also specify priority, due date, or description."
        elif any(keyword in message for keyword in ["show", "view", "list", "see"]):
            return "I can show you your tasks. You can ask me to list all tasks, pending tasks, or completed tasks."
        elif any(keyword in message for keyword in ["complete", "done", "finish"]):
            return "I can help you mark a task as complete. Please provide the task ID or name."
        elif any(keyword in message for keyword in ["help", "assist", "support"]):
            return "I'm here to help you manage your tasks! You can ask me to: create tasks, list your tasks, mark tasks as complete, or delete tasks. For example: 'Add a task to buy groceries' or 'Show me my tasks'."
        else:
            return f"I understand you said: '{message}'. I'm an AI assistant designed to help you manage your tasks. You can ask me to create, update, or view your tasks. For example, try saying 'Add a task to call mom'."

# Initialize chat service
chat_service = HuggingFaceChatService()

@router.post("/{user_id}/chat")
async def chat_endpoint(user_id: str, request: ChatRequest):
    """
    Main chat endpoint that connects to Hugging Face model
    """
    try:
        # Process the message using the chat service
        result = chat_service.process_message(
            user_message=request.message,
            user_id=user_id,
            conversation_id=request.conversation_id
        )

        return ChatResponse(**result)

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a generic error response
        logging.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing your message")

@router.get("/{user_id}/conversations")
async def get_conversations(user_id: str):
    """
    Get conversation history for a user
    """
    # In a real implementation, this would fetch from a database
    # For now, return mock data
    return {
        "user_id": user_id,
        "conversations": list(chat_service.conversations.keys()),
        "total": len(chat_service.conversations)
    }

@router.delete("/{user_id}/conversation/{conversation_id}")
async def delete_conversation(user_id: str, conversation_id: int):
    """
    Delete a specific conversation
    """
    if conversation_id in chat_service.conversations:
        del chat_service.conversations[conversation_id]
        return {"message": f"Conversation {conversation_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")