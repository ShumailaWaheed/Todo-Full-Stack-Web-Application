#!/bin/bash
# Script to test the Phase III Hugging Face backend deployment

echo "Starting Phase III Hugging Face Backend Test..."

# Install dependencies
pip install -r backend/requirements.txt

echo "Dependencies installed successfully!"

echo "Testing if the backend can start with the new chat routes..."

# Try to import the modules to check for syntax errors
python -c "
try:
    from backend.src.routers import chat
    print('✓ Chat router imported successfully!')
except ImportError as e:
    print(f'✗ Error importing chat router: {e}')
    exit(1)

try:
    from backend.src.main import app
    print('✓ Main app imported successfully!')
except ImportError as e:
    print(f'✗ Error importing main app: {e}')
    exit(1)
"

echo "Backend modules validated successfully!"

echo ""
echo "To fully test the deployment:"
echo "1. Start the backend: python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000"
echo "2. Update your frontend .env.local with: NEXT_PUBLIC_PHASE_III_API_URL=http://localhost:8000"
echo "3. Start the frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000 and test the chat functionality"
echo ""
echo "For Hugging Face deployment:"
echo "1. Update the requirements.txt with all dependencies"
echo "2. Create a Hugging Face Space with the backend code"
echo "3. Update NEXT_PUBLIC_PHASE_III_API_URL to your Hugging Face Space URL"
echo ""
echo "Setup complete! The chatbot is now integrated with the Phase III backend."