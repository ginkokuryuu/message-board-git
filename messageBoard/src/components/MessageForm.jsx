// src/components/MessageForm.tsx
import { useState } from "preact/hooks";

export default function MessageForm({ onPost }) {
  
  const API_URL = import.meta.env.PUBLIC_API_URL;
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setText("");
      onPost?.();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onInput={(e) => setText(e.target.value)} placeholder="Your message" />
      <button type="submit">Send</button>
    </form>
  );
}