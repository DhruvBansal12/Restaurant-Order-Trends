import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Store, Database } from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { PeakHoursChart } from "@/components/charts/peak-hours-chart";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("7");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const seedDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seed", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Database seeded with sample data!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      });
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: topRestaurants = [], isLoading: topLoading } = useQuery({
    queryKey: ["/api/analytics/top-restaurants", dateRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      return api.getTopRestaurants({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 3,
      });
    },
  });

  // Mock data for charts since we need restaurant analytics
  const mockDailyRevenue = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: (Math.random() * 1000 + 500).toFixed(2),
  }));

  const mockDailyOrders = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 50 + 20),
  }));

  const mockPeakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 20),
  }));

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-view">
      {/* Sample Data Button */}
      {(stats?.totalOrders === 0 || !stats) && (
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Add some sample data to see the dashboard in action
            </p>
            <Button 
              onClick={() => seedDatabaseMutation.mutate()}
              disabled={seedDatabaseMutation.isPending}
              data-testid="button-seed-database"
            >
              {seedDatabaseMutation.isPending ? "Adding Sample Data..." : "Add Sample Data"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold" data-testid="text-total-revenue">
                  ${parseFloat(stats?.totalRevenue || "0").toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold" data-testid="text-total-orders">
                  {stats?.totalOrders?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold" data-testid="text-avg-order-value">
                  ${parseFloat(stats?.avgOrderValue || "0").toFixed(2)}
                </p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Restaurants</p>
                <p className="text-2xl font-bold" data-testid="text-active-restaurants">
                  {stats?.activeRestaurants || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 new this month
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Daily Revenue Trend</CardTitle>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <RevenueChart data={mockDailyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Daily Orders</CardTitle>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <OrdersChart data={mockDailyOrders} />
          </CardContent>
        </Card>
      </div>

      {/* Top Restaurants and Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Performing Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      index === 0 ? "bg-primary" : "bg-secondary border-2 border-primary"
                    }`}>
                      <span className={`font-bold ${
                        index === 0 ? "text-primary-foreground" : "text-foreground"
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium" data-testid={`text-restaurant-name-${index}`}>
                        {restaurant.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.cuisine} • {restaurant.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" data-testid={`text-restaurant-revenue-${index}`}>
                      ${parseFloat(restaurant.totalRevenue).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.totalOrders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Peak Order Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <PeakHoursChart data={mockPeakHours} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
