import { Users, Target, BookOpenCheck } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About Learn & Shop</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We are dedicated to bridging the gap between learning and application by providing high-quality educational content and the tools you need to succeed.
          </p>
        </div>

        {/* Mission and Vision Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              To empower individuals by making knowledge accessible and providing the right products to turn that knowledge into action. We believe that the best way to learn is by doing, and our platform is designed to facilitate that journey from start to finish.
            </p>
            <h2 className="text-3xl font-bold font-headline mb-4">Our Vision</h2>
            <p className="text-muted-foreground">
              To create a global community of learners, creators, and innovators who are equipped with the skills and tools to shape the future. We envision a world where education is seamlessly integrated with practical application.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Our Team"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="team collaboration"
            />
          </div>
        </div>

        {/* Core Values Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="p-4 bg-primary rounded-full mb-4">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-muted-foreground">
                Fostering a supportive network of learners and experts to share ideas and grow together.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="p-4 bg-primary rounded-full mb-4">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p className="text-muted-foreground">
                Curating only the best courses and products to ensure a valuable and effective experience.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="p-4 bg-primary rounded-full mb-4">
                <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
              <p className="text-muted-foreground">
                Making education and high-quality tools affordable and available to everyone, everywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}