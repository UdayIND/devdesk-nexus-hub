import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Add Mac gesture support globally
  useEffect(() => {
    const handleGestureNavigation = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const startX = e.touches[0].clientX;
        
        const handleGestureMove = (moveEvent: TouchEvent) => {
          if (moveEvent.touches.length === 2) {
            const currentX = moveEvent.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Right swipe (back)
            if (deltaX > 100) {
              window.history.back();
              document.removeEventListener('touchmove', handleGestureMove);
              document.removeEventListener('touchend', handleGestureEnd);
            }
            // Left swipe (forward)
            else if (deltaX < -100) {
              window.history.forward();
              document.removeEventListener('touchmove', handleGestureMove);
              document.removeEventListener('touchend', handleGestureEnd);
            }
          }
        };
        
        const handleGestureEnd = () => {
          document.removeEventListener('touchmove', handleGestureMove);
          document.removeEventListener('touchend', handleGestureEnd);
        };
        
        document.addEventListener('touchmove', handleGestureMove, { passive: false });
        document.addEventListener('touchend', handleGestureEnd);
      }
    };

    // Keyboard shortcuts for navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '[':
            e.preventDefault();
            window.history.back();
            break;
          case ']':
            e.preventDefault();
            window.history.forward();
            break;
        }
      }
    };

    document.addEventListener('touchstart', handleGestureNavigation, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('touchstart', handleGestureNavigation);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/help" element={<Help />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
