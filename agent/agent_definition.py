from pydantic import BaseModel, Field
from pathlib import Path
import anthropic
from dotenv import load_dotenv
import json
from typing import Optional

load_dotenv()


class PersonalAgent(BaseModel):
    name: str
    system_prompt: str
    memory_path: str
    memory: list = Field(default_factory=list)
    history: list = Field(default_factory=list)

    model_config = {"arbitrary_types_allowed": True}

    def model_post_init(self, __context):
        path = Path(self.memory_path)
        if path.exists():
            content = path.read_text().strip()
            if content:
                self.memory = json.loads(content)
            else:
                # file exists but is empty, initialize it
                self.memory = {}
                path.write_text(json.dumps({}))
        else:
            path.write_text(json.dumps({}))

    def _save_memory(self):
        Path(self.memory_path).write_text(json.dumps(self.memory, indent=2))


    def chat(self, user_input: str) -> str:
        client = anthropic.Anthropic()
        self.history.append({"role": "user", "content": user_input})

        memory_str = json.dumps(self.memory, indent=2)

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=self.system_prompt + "\n\nYour knowledge base:\n" + memory_str,
            messages=self.history
        )

        reply = response.content[0].text
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def information_update(self, entry: str) -> str:
        """
        Update a single entry in the knowledge base.
        key   = the label for the data (e.g. "favorite_language")
        value = the data itself (e.g. "Python")
        """
        # all the chunking/embedding happens in here
        return "✓ Entry added."

    def gather_relevant_info(self, topic: str) -> dict:
        """
        Returns only the requested keys from the knowledge base.
        Pass a list of keys you want pulled, e.g. ["name", "projects"]
        """
        # do the searching here
        return 

    def generate_knowledge_base_file(self, output_path: str) -> str:
        """
        Dumps the current knowledge base to a new JSON file at output_path.
        Use this to snapshot or export the agent's knowledge base.
        """
        try:
            Path(output_path).write_text(json.dumps(self.memory, indent=2))
            return f"✓ Knowledge base exported to '{output_path}'."
        except Exception as e:
            return f"✗ Export failed: {e}"

    def fill_knowledge_base(self, source_path: str) -> str:
        """
        Overwrites this agent's knowledge base with the contents of source_path.
        Use this to clone an existing agent's knowledge into a new one.
        """
        try:
            source = json.loads(Path(source_path).read_text())
            self.memory = source
            self._save_memory()
            return f"✓ Knowledge base filled from '{source_path}' successfully."
        except Exception as e:
            return f"✗ Fill failed: {e}"