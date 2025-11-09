'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import type { Enrollment, Course, Item } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function EnrolledCourse({ enrollment }: { enrollment: Enrollment }) {
    const firestore = useFirestore();
    const [course, setCourse] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!firestore || !enrollment.courseId) return;

            setLoading(true);
            try {
                // Since courses are in subcollections, we need to query across all vendors
                const coursesRef = collectionGroup(firestore, 'courses');
                const q = query(coursesRef, where('id', '==', enrollment.courseId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const courseDoc = querySnapshot.docs[0];
                    setCourse(courseDoc.data() as Item);
                } else {
                     // Fallback for courses that might be in the top-level 'data'
                    const courseFromAllItems = (await import('@/lib/data')).allItems.find(c => c.id === enrollment.courseId);
                    if(courseFromAllItems) setCourse(courseFromAllItems)
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [firestore, enrollment.courseId]);


    if (loading) {
        return <li className="text-sm text-muted-foreground">Loading course details...</li>;
    }
    
    if (!course) {
        return <li className="text-sm text-muted-foreground">Could not load course: {enrollment.courseId}</li>;
    }


    return (
        <li>
            <Link href={`/courses/${course.id}`}>
                <p className="font-medium hover:underline">{course.name}</p>
            </Link>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{width: `${enrollment.progress || 0}%`}}></div>
                </div>
                <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
            </div>
        </li>
    );
}


export default function UserCourses({ enrollments, isLoading }: { enrollments: Enrollment[] | null, isLoading: boolean }) {

  const hasNoEnrollments = !enrollments || enrollments.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading courses...</p>
        ) : (
          <ul className="space-y-4">
            {hasNoEnrollments ? (
               <p className="text-sm text-muted-foreground pt-4">No courses enrolled yet. Start learning today!</p>
            ) : (
              enrollments.map(enrollment => (
                <EnrolledCourse key={enrollment.id} enrollment={enrollment} />
              ))
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
