'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ArrowRight, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    title: 'Find Anything Instantly',
    description: 'Use the search bar at the top to quickly find any product or course you have in mind.',
    targetElementId: 'header-search-bar',
  },
  {
    title: 'Manage Your Account',
    description: 'Click here to log in, sign up, or access your dashboard, orders, and wishlist.',
    targetElementId: 'header-user-menu',
  },
  {
    title: 'Check Your Cart',
    description: 'Your selected items will appear here. Click to review your cart and proceed to checkout.',
    targetElementId: 'header-cart-button',
  },
];

const WelcomeSheet = ({ onStartTour }: { onStartTour: () => void }) => (
  <SheetContent side="bottom" className="w-full max-w-2xl mx-auto rounded-t-lg">
    <SheetHeader>
      <SheetTitle className="text-2xl">Welcome to Learn & Shop!</SheetTitle>
      <SheetDescription>
        Looks like it's your first time here. Would you like a quick tour of our key features?
      </SheetDescription>
    </SheetHeader>
    <div className="py-6 flex justify-end gap-4">
      <Button variant="ghost" onClick={() => (document.querySelector('[data-state="open"] [data-radix-dialog-close]') as HTMLElement)?.click()}>Maybe Later</Button>
      <Button onClick={onStartTour}>
        Start Tour <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </SheetContent>
);

const TourPopover = ({
  stepIndex,
  onNext,
  onEnd,
}: {
  stepIndex: number;
  onNext: () => void;
  onEnd: () => void;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const step = TOUR_STEPS[stepIndex];

  useEffect(() => {
    const targetElement = document.getElementById(step.targetElementId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        left: rect.left,
        width: rect.width < 250 ? 250 : rect.width,
        height: rect.height
      });
      targetElement.style.zIndex = '101';
      targetElement.style.position = 'relative';

      return () => {
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
      };
    }
  }, [step.targetElementId]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[100]" onClick={onEnd} />
      <div
        className="fixed z-[101] bg-popover text-popover-foreground rounded-lg shadow-xl p-4 transition-all duration-300"
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        <div className="flex items-start gap-3">
          {step.targetElementId.includes('search') && <Search className="h-5 w-5 text-primary mt-1" />}
          {step.targetElementId.includes('user') && <User className="h-5 w-5 text-primary mt-1" />}
          {step.targetElementId.includes('cart') && <ShoppingCart className="h-5 w-5 text-primary mt-1" />}
          <div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">{stepIndex + 1} / {TOUR_STEPS.length}</span>
          {stepIndex < TOUR_STEPS.length - 1 ? (
            <Button size="sm" onClick={onNext}>Next</Button>
          ) : (
            <Button size="sm" onClick={onEnd}>Finish</Button>
          )}
        </div>
        <div 
          className="absolute border-solid border-transparent border-b-popover"
          style={{
            bottom: '100%',
            left: '20px',
            borderWidth: '8px',
            marginLeft: '-8px',
          }}
        />
      </div>
    </>
  );
};


export default function WelcomeTour() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has visited before
    const hasVisited = localStorage.getItem('hasVisitedLearnAndShop');
    if (!hasVisited) {
      // Use a timeout to avoid overwhelming the user immediately
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem('hasVisitedLearnAndShop', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setShowWelcome(false);
    setIsTourActive(true);
    setCurrentStep(0);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleEndTour = () => {
    setIsTourActive(false);
  };

  return (
    <>
      <Sheet open={showWelcome} onOpenChange={setShowWelcome}>
        <WelcomeSheet onStartTour={startTour} />
      </Sheet>

      {isTourActive && (
        <TourPopover
          stepIndex={currentStep}
          onNext={handleNext}
          onEnd={handleEndTour}
        />
      )}
    </>
  );
}
