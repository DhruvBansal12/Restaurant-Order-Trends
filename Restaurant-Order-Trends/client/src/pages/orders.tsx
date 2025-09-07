import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, DollarSign, ShoppingCart, Clock, Store } from "lucide-react";
import { AddOrderModal } from "@/components/modals/add-order-modal";
import { api } from "@/lib/api";
import type { FilterOptions } from "@/types";
import type { OrderWithRestaurant } from "@shared/schema";

export default function Orders() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewOrder, setViewOrder] = useState<OrderWithRestaurant | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    limit: 10,
    offset: 0,
  });

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["/api/orders", filters],
    queryFn: () => api.getOrders(filters),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants"],
    queryFn: () => api.getRestaurants(),
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(order => 
    new Date(order.timestamp).toISOString().split('T')[0] === today
  );
  const todaysRevenue = todaysOrders.reduce((sum, order) => 
    sum + parseFloat(order.amount), 0
  );
  const avgOrderTime = todaysOrders.length > 0 
    ? new Date(todaysOrders.reduce((sum, order) => 
        sum + new Date(order.timestamp).getTime(), 0
      ) / todaysOrders.length).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : "N/A";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load orders</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="orders-view">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">Track and manage restaurant orders</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0"
          data-testid="button-add-order"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Input 
                type="date" 
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                data-testid="input-date-filter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant</label>
              <Select onValueChange={(value) => handleFilterChange("restaurantId", value)} value={filters.restaurantId || "all"}>
                <SelectTrigger data-testid="select-restaurant-filter">
                  <SelectValue placeholder="All Restaurants" />
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
            <div>
              <label className="block text-sm font-medium mb-2">Amount Range</label>
              <Select onValueChange={(value) => {
                if (value === "all") {
                  setFilters(prev => ({ ...prev, minAmount: undefined, maxAmount: undefined, offset: 0 }));
                } else {
                  const [min, max] = value.split('-').map(v => v === 'max' ? undefined : parseFloat(v));
                  setFilters(prev => ({ ...prev, minAmount: min, maxAmount: max, offset: 0 }));
                }
              }}>
                <SelectTrigger data-testid="select-amount-filter">
                  <SelectValue placeholder="All Amounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-25">$0 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-max">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <Select onValueChange={(value) => {
                if (value === "all") {
                  setFilters(prev => ({ ...prev, startHour: undefined, endHour: undefined, offset: 0 }));
                } else {
                  const [start, end] = value.split('-').map(v => parseInt(v));
                  setFilters(prev => ({ ...prev, startHour: start, endHour: end, offset: 0 }));
                }
              }}>
                <SelectTrigger data-testid="select-time-filter">
                  <SelectValue placeholder="All Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Day</SelectItem>
                  <SelectItem value="6-12">Morning (6-12)</SelectItem>
                  <SelectItem value="12-18">Afternoon (12-18)</SelectItem>
                  <SelectItem value="18-24">Evening (18-24)</SelectItem>
                  <SelectItem value="0-6">Night (0-6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setFilters({ limit: 10, offset: 0 })}
                data-testid="button-apply-filters"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Orders</p>
                <p className="text-2xl font-bold" data-testid="text-todays-orders">{todaysOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Revenue</p>
                <p className="text-2xl font-bold" data-testid="text-todays-revenue">
                  ${todaysRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Order Time</p>
                <p className="text-2xl font-bold" data-testid="text-avg-order-time">{avgOrderTime}</p>
              </div>
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-6 h-6 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v) 
                  ? "Try adjusting your filters"
                  : "No orders have been placed yet"}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                            <Store className="h-3 w-3 text-primary-foreground" />
                          </div>
                          <span data-testid={`text-restaurant-${order.id}`}>
                            {order.restaurant.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`text-amount-${order.id}`}>
                        ${parseFloat(order.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewOrder(order)}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(filters.offset || 0) + 1} to {Math.min((filters.offset || 0) + (filters.limit || 10), orders.length)} of {orders.length} orders
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!filters.offset}
                  onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, (prev.offset || 0) - (prev.limit || 10)) }))}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                  {Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 10) }))}
                  data-testid="button-next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddOrderModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* View Order Modal */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Order #{viewOrder.id.slice(0, 8)}</h3>
                  <p className="text-muted-foreground">
                    {new Date(viewOrder.timestamp).toLocaleDateString()} at{' '}
                    {new Date(viewOrder.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <Badge className="text-lg px-3 py-1 bg-green-100 text-green-800">
                  ${parseFloat(viewOrder.amount).toFixed(2)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Restaurant Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{viewOrder.restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">{viewOrder.restaurant.location}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-primary/10 text-primary">
                        {viewOrder.restaurant.cuisine}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Order Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm">{viewOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(viewOrder.amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Order completed</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(viewOrder.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
