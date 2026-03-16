import anthropic
from dotenv import load_dotenv

from agent_definition import PersonalAgent
load_dotenv()

agent_luis = PersonalAgent(
    name="Luis Assistant",
    system_prompt="You are a helpful coding assistant who knows Luis's projects.",
    memory_path="luis_notes.txt"
)

agent_research = PersonalAgent(
    name="Research Bot",
    system_prompt="You are a research assistant focused on CS topics.",
    memory_path="cs_notes.txt"
)

print(agent_luis.chat("What am I working on?"))
print(agent_research.chat("Explain recursion"))

