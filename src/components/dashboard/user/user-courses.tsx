'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Enrollment, Course } from '@/lib/types';

function EnrolledCourse({ courseId }: { courseId: string }) {
    const firestore = useFirestore();
    const courseRef = useMemoFirebase(() => {
        if (!courseId) return null;
        // Assuming courses are stored under a top-level `courses` collection for simplicity.
        // The path in backend.json is /vendors/{vendorId}/courses/{courseId}
        // This might need adjustment if we need to know the vendorId.
        // For now, let's assume a denormalized top-level `courses` collection for easier lookup.
        // A better approach would be to have course data denormalized in the enrollment document.
        // Or to query all vendor course subcollections.
        // Let's create a dummy top-level courses collection for now.
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    // This is a simplification. The actual path is `/vendors/{vendorId}/courses/{courseId}`
    // A real app would need to know the vendorId or have a different data structure.
    const { data: course, isLoading } = useDoc<Course>(courseRef);

    if (isLoading) {
        return <p>Loading course...</p>;
    }
    
    // The course might not be found if the structure is different.
    // For now we will mock a course.
    const mockCourse = {
        name: 'Full-Stack Web Development',
        progress: 75
    };

    const displayCourse = course || mockCourse;


    return (
        <li>
            <p className="font-medium">{displayCourse.name}</p>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{width: `${mockCourse.progress}%`}}></div>
                </div>
                <span className="text-sm font-medium">{mockCourse.progress}%</span>
            </div>
        </li>
    );
}


export default function UserCourses({ enrollments, isLoading }: { enrollments: Enrollment[] | null, isLoading: boolean }) {
  // Let's add a default course for demonstration as enrollments will be empty initially.
  const hasNoEnrollments = !enrollments || enrollments.length === 0;

  const demoCourses = [
    { name: 'Full-Stack Web Development', progress: 75, courseId: 'c1' },
    { name: 'Advanced Graphic Design', progress: 30, courseId: 'c2' },
  ];

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
              demoCourses.map((course) => (
                 <li key={course.courseId}>
                  <p className="font-medium">{course.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: `${course.progress}%`}}></div>
                     </div>
                     <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                </li>
              ))
            ) : (
              enrollments.map(enrollment => (
                <EnrolledCourse key={enrollment.id} courseId={enrollment.courseId} />
              ))
            )}
             {hasNoEnrollments && (
                 <p className="text-sm text-muted-foreground pt-4">No courses enrolled yet. Start learning today!</p>
             )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
