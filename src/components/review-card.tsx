'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewCard({ review }: { review: Review }) {

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{review.userName}</CardTitle>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
              />
            ))}
             <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      </CardContent>
    </Card>
  );
}

    