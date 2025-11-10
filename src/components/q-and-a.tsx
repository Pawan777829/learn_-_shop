'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Question, Answer } from '@/lib/types';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

const questionSchema = z.object({
  question: z.string().min(15, 'Question must be at least 15 characters long.'),
});

const answerSchema = z.object({
    answer: z.string().min(10, 'Answer must be at least 10 characters long.')
})

function AnswerForm({ questionId, onAnswerAdded }: { questionId: string, onAnswerAdded: () => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof answerSchema>>({
        resolver: zodResolver(answerSchema),
        defaultValues: { answer: '' },
    });

    function onSubmit(values: z.infer<typeof answerSchema>) {
        if (!user || !firestore) return;
        
        const answersRef = collection(firestore, 'questions', questionId, 'answers');
        const answerData: Omit<Answer, 'id'> = {
            questionId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            answer: values.answer,
            createdAt: new Date().toISOString(),
        }
        addDocumentNonBlocking(answersRef, answerData);
        toast({ title: 'Answer Posted!', description: "Thanks for helping the community." });
        form.reset();
        onAnswerAdded();
    }

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 mt-4">
                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                    <FormItem className="flex-grow">
                        <FormControl>
                        <Textarea rows={1} placeholder="Write an answer..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>Answer</Button>
            </form>
        </Form>
    )
}

function QuestionCard({ question, itemVendorId }: { question: Question, itemVendorId: string }) {
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const answersQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'questions', question.id, 'answers'), orderBy('createdAt', 'desc'));
    }, [firestore, question.id]);
    
    const { data: answers, isLoading: isLoadingAnswers } = useCollection<Answer>(answersQuery);
    
    const isItemVendor = user?.uid === itemVendorId;

    return (
        <Card className="bg-muted/50">
            <CardHeader className='pb-4'>
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback>{question.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{question.userName}</p>
                        <p className="text-xs text-muted-foreground">
                            Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <p className="font-medium pt-2">{question.question}</p>
            </CardHeader>
            <CardContent>
                {isLoadingAnswers ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    answers && answers.length > 0 ? (
                        <div className="space-y-4 pl-4 border-l-2 ml-4">
                            {answers.map(answer => (
                                <div key={answer.id}>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback>{answer.userName.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{answer.userName} {answer.userId === itemVendorId && &lt;Badge variant="secondary" className='ml-1'&gt;Vendor&lt;/Badge&gt;}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/80 mt-2 ml-11">{answer.answer}</p>
                                </div>
                            ))}
                        </div>
                    ) : &lt;p className="text-sm text-muted-foreground"&gt;No answers yet. Be the first to help!&lt;/p&gt;
                )}

                {user && (
                    &lt;div className='mt-4'&gt;
                        {!showAnswerForm ? (
                            &lt;Button variant="link" className="p-0 h-auto" onClick={() =&gt; setShowAnswerForm(true)}&gt;
                                &lt;Plus className="h-4 w-4 mr-1" /&gt;
                                Write an answer
                            &lt;/Button&gt;
                        ) : (
                            &lt;AnswerForm questionId={question.id} onAnswerAdded={() =&gt; setShowAnswerForm(false)} /&gt;
                        )}
                    &lt;/div&gt;
                )}
            &lt;/CardContent&gt;
        &lt;/Card&gt;
    )

}

type QAndAProps = {
  itemId: string;
  itemType: 'product' | 'course';
  itemVendorId: string;
};

export default function QAndA({ itemId, itemType, itemVendorId }: QAndAProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Query for questions related to this item
  const questionsQuery = useMemoFirebase(() =&gt; {
    if (!firestore) return null;
    return query(collection(firestore, 'questions'), where('itemId', '==', itemId), orderBy('createdAt', 'desc'));
  }, [firestore, itemId]);

  const { data: questions, isLoading: isLoadingQuestions } = useCollection&lt;Question&gt;(questionsQuery);

  const form = useForm&lt;z.infer&lt;typeof questionSchema&gt;&gt;({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
    },
  });

  function onSubmit(values: z.infer&lt;typeof questionSchema&gt;) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to ask a question.' });
      return;
    }

    const questionsRef = collection(firestore, 'questions');
    const questionData: Omit&lt;Question, 'id'&gt; = {
        ...values,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        itemId,
        itemType,
        createdAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(questionsRef, questionData);
    toast({ title: 'Question Posted!', description: 'Your question has been submitted.' });
    form.reset();
  }

  return (
    &lt;div className="mt-12 space-y-8"&gt;
        &lt;Separator /&gt;
        &lt;h2 className="text-2xl font-bold font-headline"&gt;Questions &amp; Answers&lt;/h2&gt;
      
        {user &amp;&amp; (
            &lt;div className="border rounded-lg p-6"&gt;
            &lt;h3 className="text-lg font-semibold mb-4"&gt;Ask a Question&lt;/h3&gt;
            &lt;Form {...form}&gt;
                &lt;form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"&gt;
                &lt;FormField
                    control={form.control}
                    name="question"
                    render={({ field }) =&gt; (
                    &lt;FormItem&gt;
                        &lt;FormLabel&gt;Your Question&lt;/FormLabel&gt;
                        &lt;FormControl&gt;
                        &lt;Textarea placeholder="What would you like to know about this item?" {...field} /&gt;
                        &lt;/FormControl&gt;
                        &lt;FormMessage /&gt;
                    &lt;/FormItem&gt;
                    )}
                /&gt;
                &lt;Button type="submit" disabled={form.formState.isSubmitting}&gt;
                    {form.formState.isSubmitting ? 'Posting...' : 'Post Question'}
                &lt;/Button&gt;
                &lt;/form&gt;
            &lt;/Form&gt;
            &lt;/div&gt;
        )}
      
        {isLoadingQuestions ? (
            &lt;div className="flex justify-center items-center py-10"&gt;
                &lt;Loader2 className="h-8 w-8 animate-spin text-primary" /&gt;
                &lt;p className="ml-2"&gt;Loading questions...&lt;/p&gt;
            &lt;/div&gt;
        ) : questions &amp;&amp; questions.length &gt; 0 ? (
            &lt;div className="space-y-6"&gt;
                {questions.map(q =&gt; (
                    &lt;QuestionCard key={q.id} question={q} itemVendorId={itemVendorId} /&gt;
                ))}
            &lt;/div&gt;
        ) : (
            &lt;p className="text-muted-foreground"&gt;No questions have been asked yet. Be the first!&lt;/p&gt;
        )}
    &lt;/div&gt;
  );
}
