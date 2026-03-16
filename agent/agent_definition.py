from pydantic import BaseModel, Field
from pathlib import Path
import anthropic
from dotenv import load_dotenv


load_dotenv()


class PersonalAgent(BaseModel):
    name: str
    system_prompt: str
    memory_path: str
    memory: str = Field(default="")
    history: list = Field(default_factory=list)
    
    model_config = {"arbitrary_types_allowed": True}

    def model_post_init(self, __context):
        self.memory = Path(self.memory_path).read_text()

    def chat(self, user_input: str) -> str:
        client = anthropic.Anthropic()
        self.history.append({"role": "user", "content": user_input})

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=self.system_prompt + "\n\nYour knowledge base:\n" + self.memory,
            messages=self.history
        )

        reply = response.content[0].text
        self.history.append({"role": "assistant", "content": reply})
        return reply
    
    def information_update(self, user_input: str) -> str:
        """ This should be the simplest thing necessary to allow the agent to update its knowledge base with user inputted data. 
            No reply should be required here, just a quick acknowledgement whether the data was uploaded successfully or not.
        """
        
        
    def gather_relevant_info(self: str) -> str:
        """ This should be a function where the relevant info is gathered from the knowledge base instead of gathering ALL the knowledge base.
            This should be built with a user submission where the user specifies which data it wants the LLM to pull from.
        """
        
        
    def generate_knowledge_base_file(self: str) -> str:
        """ This should have the LLM return some kind of file to then give it to the matching function and update its knowledge base."""
        
    
    
    def fill_knowledge_base(self: str) -> str:
        """ This needs to return just an acknowledgement. The information handed to it is just going to be copied into its blank knowledge base.
            This essentially just clones an agent that already exists.
        """
        