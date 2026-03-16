import anthropic
from dotenv import load_dotenv


load_dotenv()
class PersonalAgent:
    def __init__(self, name, system_prompt, memory_path):
        self.name = name
        self.system_prompt = system_prompt
        self.memory = self.load_memory(memory_path)
        self.client = anthropic.Anthropic()
        self.history = []

    def load_memory(self, path):
        # load your text/data files here
        with open(path, "r") as f:
            return f.read()

    def chat(self, user_input):
        self.history.append({"role": "user", "content": user_input})
        
        response = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=self.system_prompt + "\n\nYour knowledge base:\n" + self.memory,
            messages=self.history
        )
        
        reply = response.content[0].text
        self.history.append({"role": "assistant", "content": reply})
        return reply