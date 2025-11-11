'use client';

import { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  text: string;
  senderId: string;
  timestamp: string;
};

export default function SocketDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
    const p = new Pusher(key, { cluster });

    const channel = p.subscribe('chat');
    channel.bind('pusher:subscription_succeeded', () => setIsConnected(true));
    channel.bind('message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    pusherRef.current = p;
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      p.disconnect();
      pusherRef.current = null;
    };
  }, []);

  async function sendMessage() {
    const text = inputMessage.trim();
    if (!text) return;

    await fetch('/api/message', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text,
        senderId: 'web-' + Math.random().toString(36).slice(2, 8),
      }),
    });

    setInputMessage('');
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Realtime Chat (Pusher Channels)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea style={{ maxHeight: 320 }} className="border rounded p-2 mb-3">
            {messages.map((m, i) => (
              <div key={i} className="text-sm mb-1">
                <span className="font-mono opacity-70">{m.timestamp} </span>
                <span className="font-semibold">{m.senderId}: </span>
                <span>{m.text}</span>
              </div>
            ))}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}