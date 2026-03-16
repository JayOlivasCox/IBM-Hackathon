import anthropic
from dotenv import load_dotenv


load_dotenv()

message = anthropic.Anthropic().messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
print(message)