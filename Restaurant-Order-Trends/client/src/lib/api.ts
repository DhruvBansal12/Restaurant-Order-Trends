import { apiRequest } from "./queryClient";
import type { 
  Restaurant, 
  Order, 
  RestaurantWithStats, 
  OrderWithRestaurant,
  AnalyticsData,
  DashboardStats,
  FilterOptions 
} from "../types";

export const api = {
  // Restaurant API
  getRestaurants: async (filters?: FilterOptions): Promise<RestaurantWithStats[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.cuisine) params.append("cuisine", filters.cuisine);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());
    
    const response = await apiRequest("GET", `/api/restaurants?${params}`);
    return response.json();
  },

  getRestaurant: async (id: string): Promise<Restaurant> => {
    const response = await apiRequest("GET", `/api/restaurants/${id}`);
    return response.json();
  },

  createRestaurant: async (data: { name: string; cuisine: string; location: string }): Promise<Restaurant> => {
    const response = await apiRequest("POST", "/api/restaurants", data);
    return response.json();
  },

  deleteRestaurant: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/restaurants/${id}`);
  },

  // Order API
  getOrders: async (filters?: FilterOptions): Promise<OrderWithRestaurant[]> => {
    const params = new URLSearchParams();
    if (filters?.restaurantId) params.append("restaurantId", filters.restaurantId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.minAmount) params.append("minAmount", filters.minAmount.toString());
    if (filters?.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
    if (filters?.startHour) params.append("startHour", filters.startHour.toString());
    if (filters?.endHour) params.append("endHour", filters.endHour.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());
    
    const response = await apiRequest("GET", `/api/orders?${params}`);
    return response.json();
  },

  createOrder: async (data: { restaurantId: string; amount: string; timestamp: string }): Promise<Order> => {
    const response = await apiRequest("POST", "/api/orders", data);
    return response.json();
  },

  // Analytics API
  getRestaurantAnalytics: async (restaurantId: string, filters?: FilterOptions): Promise<AnalyticsData> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.minAmount) params.append("minAmount", filters.minAmount.toString());
    if (filters?.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
    if (filters?.startHour) params.append("startHour", filters.startHour.toString());
    if (filters?.endHour) params.append("endHour", filters.endHour.toString());
    
    const response = await apiRequest("GET", `/api/restaurants/${restaurantId}/analytics?${params}`);
    return response.json();
  },

  getTopRestaurants: async (filters?: FilterOptions): Promise<RestaurantWithStats[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    
    const response = await apiRequest("GET", `/api/analytics/top-restaurants?${params}`);
    return response.json();
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest("GET", "/api/dashboard/stats");
    return response.json();
  },
};
