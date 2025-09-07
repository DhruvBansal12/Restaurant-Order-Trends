import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { PeakHoursChart } from "@/components/charts/peak-hours-chart";
import { BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import type { FilterOptions } from "@/types";

export default function Analytics() {
  const [filters, setFilters] = useState<FilterOptions>({
    restaurantId: "",
    startDate: "",
    endDate: "",
    minAmount: undefined,
    maxAmount: undefined,
    startHour: undefined,
    endHour: undefined,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants"],
    queryFn: () => api.getRestaurants(),
  });

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["/api/restaurants", filters.restaurantId, "analytics", filters],
    queryFn: () => {
      if (!filters.restaurantId) return null;
      return api.getRestaurantAnalytics(filters.restaurantId, filters);
    },
    enabled: !!filters.restaurantId,
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  const applyFilters = () => {
    // Trigger a refetch by updating the query key
    setFilters(prev => ({ ...prev }));
  };

  const resetFilters = () => {
    setFilters({
      restaurantId: "",
      startDate: "",
      endDate: "",
      minAmount: undefined,
      maxAmount: undefined,
      startHour: undefined,
      endHour: undefined,
    });
  };

  return (
    <div className="space-y-6" data-testid="analytics-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <p className="text-muted-foreground">Deep dive into restaurant performance metrics</p>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filters & Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Restaurant Selection</label>
              <Select 
                value={filters.restaurantId || "all"} 
                onValueChange={(value) => handleFilterChange("restaurantId", value)}
              >
                <SelectTrigger className="h-10" data-testid="select-analytics-restaurant">
                  <SelectValue placeholder="Select Restaurant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Restaurants</SelectItem>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="h-10"
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="h-10"
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Order Amount Range ($)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Minimum</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.minAmount || ""}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-10"
                    data-testid="input-min-amount"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Maximum</label>
                  <Input
                    type="number"
                    placeholder="999.99"
                    value={filters.maxAmount || ""}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-10"
                    data-testid="input-max-amount"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operating Hours</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From Hour</label>
                  <Select 
                    value={filters.startHour?.toString() || ""} 
                    onValueChange={(value) => handleFilterChange("startHour", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="00:00" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To Hour</label>
                  <Select 
                    value={filters.endHour?.toString() || ""} 
                    onValueChange={(value) => handleFilterChange("endHour", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="23:00" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Configure filters to analyze restaurant performance data
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={resetFilters} data-testid="button-reset-filters">
                Reset All
              </Button>
              <Button onClick={applyFilters} data-testid="button-apply-analytics-filters">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      {!filters.restaurantId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a restaurant</h3>
            <p className="text-muted-foreground">
              Choose a restaurant from the filter above to view detailed analytics
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Orders Count</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersChart data={analytics?.dailyOrders || []} />
            </CardContent>
          </Card>

          {/* Daily Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={analytics?.dailyRevenue || []} />
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card>
            <CardHeader>
              <CardTitle>Average Order Value</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-avg-order-value-analytics">
                ${parseFloat(analytics?.avgOrderValue || "0").toFixed(2)}
              </div>
              <p className="text-muted-foreground">
                Average value per order for the selected period
              </p>
            </CardContent>
          </Card>

          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Order Hours Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PeakHoursChart data={analytics?.peakHours || []} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data State Example */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Cuisine Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">No data available</h4>
          <p className="text-muted-foreground mb-4">
            No orders found for the selected filters. Try adjusting your date range or restaurant selection.
          </p>
          <Button variant="secondary" onClick={resetFilters} data-testid="button-reset-no-data">
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
