import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Eye, Edit, Trash2, Store } from "lucide-react";
import { AddRestaurantModal } from "@/components/modals/add-restaurant-modal";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { FilterOptions } from "@/types";
import type { RestaurantWithStats } from "@shared/schema";

export default function Restaurants() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewRestaurant, setViewRestaurant] = useState<RestaurantWithStats | null>(null);
  const [deleteRestaurant, setDeleteRestaurant] = useState<RestaurantWithStats | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    cuisine: "",
    location: "",
    limit: 10,
    offset: 0,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ["/api/restaurants", filters],
    queryFn: () => api.getRestaurants(filters),
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => api.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
      setDeleteRestaurant(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete restaurant",
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const getCuisineColor = (cuisine: string) => {
    const colors: { [key: string]: string } = {
      italian: "bg-primary/10 text-primary",
      japanese: "bg-chart-2/10 text-chart-2",
      mexican: "bg-chart-1/10 text-chart-1",
      american: "bg-chart-3/10 text-chart-3",
      chinese: "bg-chart-4/10 text-chart-4",
      indian: "bg-chart-5/10 text-chart-5",
    };
    return colors[cuisine.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load restaurants</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="restaurants-view">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Restaurants</h2>
          <p className="text-muted-foreground">Manage your restaurant network</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0"
          data-testid="button-add-restaurant"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                  data-testid="input-search-restaurants"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <Select 
                value={filters.cuisine || ""} 
                onValueChange={(value) => handleFilterChange("cuisine", value)}
              >
                <SelectTrigger data-testid="select-cuisine-filter">
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Select 
                value={filters.location || ""} 
                onValueChange={(value) => handleFilterChange("location", value)}
              >
                <SelectTrigger data-testid="select-location-filter">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Downtown">Downtown</SelectItem>
                  <SelectItem value="Midtown">Midtown</SelectItem>
                  <SelectItem value="Uptown">Uptown</SelectItem>
                  <SelectItem value="South Side">South Side</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.cuisine || filters.location
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first restaurant"}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id} data-testid={`row-restaurant-${restaurant.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-restaurant-name-${restaurant.id}`}>
                              {restaurant.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: #{restaurant.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCuisineColor(restaurant.cuisine)}>
                          {restaurant.cuisine}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {restaurant.location}
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`text-revenue-${restaurant.id}`}>
                        ${parseFloat(restaurant.totalRevenue).toLocaleString()}
                      </TableCell>
                      <TableCell data-testid={`text-orders-${restaurant.id}`}>
                        {restaurant.totalOrders}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewRestaurant(restaurant)}
                            data-testid={`button-view-${restaurant.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast({
                                title: "Edit Restaurant",
                                description: "Edit functionality coming soon!",
                              });
                            }}
                            data-testid={`button-edit-${restaurant.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteRestaurant(restaurant)}
                            data-testid={`button-delete-${restaurant.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {restaurants.length > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(filters.offset || 0) + 1} to {Math.min((filters.offset || 0) + (filters.limit || 10), restaurants.length)} of {restaurants.length} restaurants
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!filters.offset}
                  onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, (prev.offset || 0) - (prev.limit || 10)) }))}
                  data-testid="button-previous-page"
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
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddRestaurantModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* View Restaurant Modal */}
      <Dialog open={!!viewRestaurant} onOpenChange={() => setViewRestaurant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>
          {viewRestaurant && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <Store className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewRestaurant.name}</h3>
                  <p className="text-muted-foreground">ID: #{viewRestaurant.id.slice(0, 8)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Cuisine Type</h4>
                  <Badge className={getCuisineColor(viewRestaurant.cuisine)}>
                    {viewRestaurant.cuisine}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-muted-foreground">{viewRestaurant.location}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(viewRestaurant.totalRevenue).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Orders</h4>
                  <p className="text-2xl font-bold">{viewRestaurant.totalOrders}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Average Order Value</h4>
                  <p className="text-lg font-semibold">
                    ${parseFloat(viewRestaurant.avgOrderValue).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRestaurant} onOpenChange={() => setDeleteRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the restaurant 
              "{deleteRestaurant?.name}" and all of its order data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteRestaurant) {
                  deleteRestaurantMutation.mutate(deleteRestaurant.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Restaurant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
