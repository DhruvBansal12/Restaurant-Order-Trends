import { Restaurant, Order, RestaurantWithStats, OrderWithRestaurant } from "@shared/schema";

export type { Restaurant, Order, RestaurantWithStats, OrderWithRestaurant };

export interface AnalyticsData {
  dailyOrders: Array<{ date: string; count: number }>;
  dailyRevenue: Array<{ date: string; revenue: string }>;
  avgOrderValue: string;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface DashboardStats {
  totalRevenue: string;
  totalOrders: number;
  avgOrderValue: string;
  activeRestaurants: number;
}

export interface FilterOptions {
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  startHour?: number;
  endHour?: number;
  search?: string;
  cuisine?: string;
  location?: string;
  limit?: number;
  offset?: number;
}
