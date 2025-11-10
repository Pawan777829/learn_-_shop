'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Enrollment, Item } from '@/lib/types';
import Link from 'next/link';
import { allItems } from '@/lib/data';

function EnrolledCourse({ enrollment }: { enrollment: Enrollment }) {
    const course = allItems.find(item => item.id === enrollment.courseId && item.type === 'course');

    if (!course) {
        return <li className="text-sm text-muted-foreground">Could not load course: {enrollment.courseId.substring(0,5)}...</li>;
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
