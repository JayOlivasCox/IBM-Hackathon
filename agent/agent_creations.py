import anthropic
from dotenv import load_dotenv
from agent_definition import PersonalAgent
load_dotenv()



agent_luis = PersonalAgent(
    name="Luis Assistant",
    system_prompt="You are a personal assistant for Luis. Use his knowledge base to answer questions about him.",
    memory_path="luis_memory.json"
)


