from pydantic import BaseModel, Field
from pathlib import Path
import anthropic
from dotenv import load_dotenv
import json
from typing import Optional, Any
import numpy as np

from dataExtractor.pipeline import *
from sentence_transformers import SentenceTransformer

load_dotenv()

def _cosine_similarity(vec_a: list, vec_b: list) -> float:
    """Private helper — computes similarity between two vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


class PersonalAgent(BaseModel):
    name: str
    system_prompt: str
    memory_path: str
    memory: dict = Field(default_factory=dict)
    history: list = Field(default_factory=list)
    embedding_model: Any = Field(default=None)  # add this field

    model_config = {"arbitrary_types_allowed": True}

    def model_post_init(self, __context):
        path = Path(self.memory_path)
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
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
    
    def chat_with_context(self, user_input: str, top_n: int = 3) -> str:
        """
        Retrieves relevant chunks first, then uses them as context for the chat.
        """
        client = anthropic.Anthropic()
        
        # step 1 - grab relevant chunks
        results = self.gather_relevant_info(user_input, top_n=top_n)
        
        # step 2 - format them into readable context
        context_str = "\n\n".join(
            f"[Source: {r['source']}]\n{r['text']}" for r in results
        )
        
        # step 3 - build the augmented prompt
        augmented_input = (
            f"Use the following retrieved context to answer the question.\n\n"
            f"Context:\n{context_str}\n\n"
            f"Question: {user_input}"
        )
        
        self.history.append({"role": "user", "content": augmented_input})

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=self.system_prompt,
            messages=self.history
        )

        reply = response.content[0].text
        self.history.append({"role": "assistant", "content": reply})
        return reply
    
    def _embed_query(self, query: str) -> list:
        return self.embedding_model.encode(query).tolist()

    def information_update(self, vector_path: str) -> str:
        """
        Reads a vectors.json file and appends its chunks into memory.json.
        Skips any chunks whose ID already exists to avoid duplicates.
        """
        try:
            incoming = json.loads(Path(vector_path).read_text())

            # ensure memory has the documents list
            if "documents" not in self.memory:
                self.memory["documents"] = []

            # build a set of existing chunk IDs to avoid duplicates
            existing_ids = {
                chunk["id"]
                for doc in self.memory["documents"]
                for chunk in doc.get("chunks", [])
            }

            new_chunks_count = 0
            for incoming_doc in incoming["documents"]:
                # check if this source already exists in memory
                existing_doc = next(
                    (d for d in self.memory["documents"] if d["source"] == incoming_doc["source"]),
                    None
                )

                if existing_doc is None:
                    # brand new source — append the whole doc
                    self.memory["documents"].append(incoming_doc)
                    new_chunks_count += len(incoming_doc["chunks"])
                else:
                    # source exists — only append chunks we haven't seen
                    for chunk in incoming_doc["chunks"]:
                        if chunk["id"] not in existing_ids:
                            existing_doc["chunks"].append(chunk)
                            existing_ids.add(chunk["id"])
                            new_chunks_count += 1

            self._save_memory()
            return f"✓ Upserted {new_chunks_count} new chunks into memory."

        except (IOError, OSError) as e:
            return f"✗ Failed to read/write file: {e}"
        except (KeyError, json.JSONDecodeError) as e:
            return f"✗ Invalid vector file format: {e}"

    def gather_relevant_info(self, query: str, top_n: int = 3) -> list:
        """
        Embeds the query and returns the top_n most semantically similar chunks.
        """
        query_embedding = self._embed_query(query)

        scored_chunks = []
        for doc in self.memory.get("documents", []):
            for chunk in doc.get("chunks", []):
                score = _cosine_similarity(query_embedding, chunk["embedding"])
                scored_chunks.append({
                    "score": score,
                    "text": chunk["text"],
                    "source": doc["source"],
                    "chunk_index": chunk["chunk_index"]
                })

        # sort by score descending, return top N
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_n]

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