import anthropic
from dotenv import load_dotenv
from agent.agent_definition import PersonalAgent
from dataExtractor.pipeline import *
load_dotenv()

#ingest("some.pdf")


agent_luis = PersonalAgent(
    name="Luis Assistant",
    system_prompt="You are a personal assistant for Luis. Use his knowledge base to answer questions about him.",
    memory_path="luis_memory.json"
)

agent_luis.information_update("vectors.json")


print(agent_luis.chat_with_context("Can you make me a 10 question quiz for the given PDF?"))
