import { 
  restaurants, 
  orders, 
  type Restaurant, 
  type InsertRestaurant, 
  type Order, 
  type InsertOrder, 
  type RestaurantWithStats,
  type OrderWithRestaurant 
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, lte, between } from "drizzle-orm";

export interface IStorage {
  // Restaurant methods
  getRestaurants(options?: {
    search?: string;
    cuisine?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<RestaurantWithStats[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;
  
  // Order methods
  getOrders(options?: {
    restaurantId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    startHour?: number;
    endHour?: number;
    limit?: number;
    offset?: number;
  }): Promise<OrderWithRestaurant[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Analytics methods
  getRestaurantAnalytics(restaurantId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    startHour?: number;
    endHour?: number;
  }): Promise<{
    dailyOrders: Array<{ date: string; count: number }>;
    dailyRevenue: Array<{ date: string; revenue: string }>;
    avgOrderValue: string;
    peakHours: Array<{ hour: number; count: number }>;
  }>;
  
  getTopRestaurants(options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<RestaurantWithStats[]>;
  
  getDashboardStats(): Promise<{
    totalRevenue: string;
    totalOrders: number;
    avgOrderValue: string;
    activeRestaurants: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurants(options: {
    search?: string;
    cuisine?: string;
    location?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<RestaurantWithStats[]> {
    const { search, cuisine, location, limit = 50, offset = 0 } = options;
    
    let query = db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        cuisine: restaurants.cuisine,
        location: restaurants.location,
        createdAt: restaurants.createdAt,
        totalRevenue: sql<string>`COALESCE(SUM(${orders.amount}), 0)::text`,
        totalOrders: sql<number>`COUNT(${orders.id})::int`,
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.amount}), 0)::text`,
      })
      .from(restaurants)
      .leftJoin(orders, eq(restaurants.id, orders.restaurantId))
      .groupBy(restaurants.id)
      .orderBy(desc(sql`COALESCE(SUM(${orders.amount}), 0)`))
      .limit(limit)
      .offset(offset);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(sql`${restaurants.name} ILIKE ${`%${search}%`}`);
    }
    if (cuisine) {
      conditions.push(eq(restaurants.cuisine, cuisine));
    }
    if (location) {
      conditions.push(eq(restaurants.location, location));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant || undefined;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return newRestaurant;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  async getOrders(options: {
    restaurantId?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    startHour?: number;
    endHour?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<OrderWithRestaurant[]> {
    const { 
      restaurantId, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      startHour, 
      endHour,
      limit = 50, 
      offset = 0 
    } = options;

    const conditions = [];
    
    if (restaurantId) {
      conditions.push(eq(orders.restaurantId, restaurantId));
    }
    if (startDate) {
      conditions.push(gte(orders.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.timestamp, endDate));
    }
    if (minAmount !== undefined) {
      conditions.push(gte(orders.amount, minAmount.toString()));
    }
    if (maxAmount !== undefined) {
      conditions.push(lte(orders.amount, maxAmount.toString()));
    }
    if (startHour !== undefined && endHour !== undefined) {
      conditions.push(
        gte(sql`EXTRACT(HOUR FROM ${orders.timestamp})`, startHour)
      );
      conditions.push(
        lte(sql`EXTRACT(HOUR FROM ${orders.timestamp})`, endHour)
      );
    }

    let query = db
      .select({
        id: orders.id,
        restaurantId: orders.restaurantId,
        amount: orders.amount,
        timestamp: orders.timestamp,
        createdAt: orders.createdAt,
        restaurant: restaurants,
      })
      .from(orders)
      .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
      .orderBy(desc(orders.timestamp))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getRestaurantAnalytics(restaurantId: string, options: {
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    startHour?: number;
    endHour?: number;
  } = {}) {
    const { startDate, endDate, minAmount, maxAmount, startHour, endHour } = options;
    
    const conditions = [eq(orders.restaurantId, restaurantId)];
    
    if (startDate) conditions.push(gte(orders.timestamp, startDate));
    if (endDate) conditions.push(lte(orders.timestamp, endDate));
    if (minAmount !== undefined) conditions.push(gte(orders.amount, minAmount.toString()));
    if (maxAmount !== undefined) conditions.push(lte(orders.amount, maxAmount.toString()));
    if (startHour !== undefined && endHour !== undefined) {
      conditions.push(
        gte(sql`EXTRACT(HOUR FROM ${orders.timestamp})`, startHour)
      );
      conditions.push(
        lte(sql`EXTRACT(HOUR FROM ${orders.timestamp})`, endHour)
      );
    }

    // Daily orders
    const dailyOrders = await db
      .select({
        date: sql<string>`DATE(${orders.timestamp})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(and(...conditions))
      .groupBy(sql`DATE(${orders.timestamp})`)
      .orderBy(sql`DATE(${orders.timestamp})`);

    // Daily revenue
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${orders.timestamp})`,
        revenue: sql<string>`SUM(${orders.amount})::text`,
      })
      .from(orders)
      .where(and(...conditions))
      .groupBy(sql`DATE(${orders.timestamp})`)
      .orderBy(sql`DATE(${orders.timestamp})`);

    // Average order value
    const [avgResult] = await db
      .select({
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.amount}), 0)::text`,
      })
      .from(orders)
      .where(and(...conditions));

    // Peak hours
    const peakHours = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${orders.timestamp})::int`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(and(...conditions))
      .groupBy(sql`EXTRACT(HOUR FROM ${orders.timestamp})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${orders.timestamp})`);

    return {
      dailyOrders,
      dailyRevenue,
      avgOrderValue: avgResult?.avgOrderValue || "0",
      peakHours,
    };
  }

  async getTopRestaurants(options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<RestaurantWithStats[]> {
    const { startDate, endDate, limit = 3 } = options;
    
    const conditions = [];
    if (startDate) conditions.push(gte(orders.timestamp, startDate));
    if (endDate) conditions.push(lte(orders.timestamp, endDate));

    let query = db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        cuisine: restaurants.cuisine,
        location: restaurants.location,
        createdAt: restaurants.createdAt,
        totalRevenue: sql<string>`COALESCE(SUM(${orders.amount}), 0)::text`,
        totalOrders: sql<number>`COUNT(${orders.id})::int`,
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.amount}), 0)::text`,
      })
      .from(restaurants)
      .leftJoin(orders, eq(restaurants.id, orders.restaurantId))
      .groupBy(restaurants.id)
      .orderBy(desc(sql`COALESCE(SUM(${orders.amount}), 0)`))
      .limit(limit);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async getDashboardStats() {
    const [stats] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.amount}), 0)::text`,
        totalOrders: sql<number>`COUNT(${orders.id})::int`,
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.amount}), 0)::text`,
        activeRestaurants: sql<number>`COUNT(DISTINCT ${restaurants.id})::int`,
      })
      .from(restaurants)
      .leftJoin(orders, eq(restaurants.id, orders.restaurantId));

    return stats || { totalRevenue: "0", totalOrders: 0, avgOrderValue: "0", activeRestaurants: 0 };
  }
}

export const storage = new DatabaseStorage();
