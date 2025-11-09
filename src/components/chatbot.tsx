'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Bot, User, X, Send, Loader2 } from 'lucide-react';
import { chat } from '@/ai/flows/chat';
import { allItems } from '@/lib/data';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const itemContext = JSON.stringify(allItems, null, 2);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: "Hello! I'm your Learn & Shop assistant. How can I help you find the perfect product or course today?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A slight delay to allow the new message to render
        setTimeout(() => {
            if (scrollAreaRef.current) {
               scrollAreaRef.current.scrollTo({
                    top: scrollAreaRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100)
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat({
        history: [...messages, userMessage],
        itemContext: itemContext,
      });
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "I'm sorry, but I'm having trouble connecting right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", isOpen ? "scale-0" : "scale-100")}>
        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg" onClick={() => setIsOpen(true)}>
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out", !isOpen && "opacity-0 translate-y-10 pointer-events-none")}>
        <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                <Bot className="h-7 w-7 text-primary" />
                <CardTitle>AI Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef as any}>
                <div className="space-y-4 pr-4">
                {messages.map((msg, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex gap-2 items-start',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {msg.role === 'model' && <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />}
                    <div
                        className={cn(
                        'p-3 rounded-lg max-w-[80%]',
                        msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                )}
                </div>
            </ScrollArea>
          <CardFooter className="pt-6">
            <form
              className="flex w-full items-center space-x-2"
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about products or courses..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
