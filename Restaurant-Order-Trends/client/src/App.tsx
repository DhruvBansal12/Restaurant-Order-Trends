import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import Dashboard from "./pages/dashboard";
import Restaurants from "./pages/restaurants";
import Orders from "./pages/orders";
import Analytics from "./pages/analytics";
import NotFound from "@/pages/not-found";

const pageConfig = {
  "/": { title: "Dashboard", description: "Restaurant order trends and analytics" },
  "/restaurants": { title: "Restaurants", description: "Manage your restaurant network" },
  "/orders": { title: "Orders", description: "Track and manage restaurant orders" },
  "/analytics": { title: "Advanced Analytics", description: "Deep dive into restaurant performance metrics" },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/orders" component={Orders} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get current page info based on location
  const getCurrentPageInfo = () => {
    const path = window.location.pathname;
    return pageConfig[path as keyof typeof pageConfig] || pageConfig["/"];
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={pageInfo.title}
              description={pageInfo.description}
              onMenuClick={() => setSidebarOpen(true)}
            />
            
            <main className="flex-1 overflow-auto p-6 bg-muted/30">
              <Router />
            </main>
          </div>
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
