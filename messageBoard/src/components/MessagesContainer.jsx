// src/components/MessageList.tsx
import { useEffect, useState } from "preact/hooks";
import MessageForm from "./MessageForm";

const API_URL = import.meta.env.PUBLIC_API_URL;

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export default function MessageList() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const res = await fetch(`${API_URL}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(async() => {
    const eventSource = new EventSource(`${API_URL}/stream`);

    await fetchMessages();
    eventSource.onmessage = async (event) => {
      console.log(event);
      console.log(event.data);
      if (!isJson(event.data)) {
        return;
      }
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        await fetchMessages(); // re-fetch updated list
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div>
      <MessageForm onPost={fetchMessages} />
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.text}
            <br />
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}