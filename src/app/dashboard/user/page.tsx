import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Recommendations from "@/components/dashboard/user/recommendations";

const orders = [
  { id: 'ORD-001', date: '2023-10-15', total: 249.99, status: 'Delivered' },
  { id: 'ORD-002', date: '2023-10-20', total: 129.99, status: 'Shipped' },
];

const courses = [
  { name: 'Full-Stack Web Development', progress: 75 },
  { name: 'Advanced Graphic Design', progress: 30 },
];

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">User Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your account.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {courses.map((course) => (
                <li key={course.name}>
                  <p className="font-medium">{course.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: `${course.progress}%`}}></div>
                     </div>
                     <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Recommendations />

    </div>
  );
}
