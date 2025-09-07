import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRestaurantSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seed-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { search, cuisine, location, limit, offset } = req.query;
      const restaurants = await storage.getRestaurants({
        search: search as string,
        cuisine: cuisine as string,
        location: location as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating restaurant:", error);
      res.status(500).json({ error: "Failed to create restaurant" });
    }
  });

  app.delete("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRestaurant(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      res.status(500).json({ error: "Failed to delete restaurant" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { 
        restaurantId, 
        startDate, 
        endDate, 
        minAmount, 
        maxAmount, 
        startHour, 
        endHour,
        limit, 
        offset 
      } = req.query;

      const orders = await storage.getOrders({
        restaurantId: restaurantId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        startHour: startHour ? parseInt(startHour as string) : undefined,
        endHour: endHour ? parseInt(endHour as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // Convert timestamp string to Date object for validation
      const orderData = {
        ...req.body,
        timestamp: new Date(req.body.timestamp)
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Analytics routes
  app.get("/api/restaurants/:id/analytics", async (req, res) => {
    try {
      const { startDate, endDate, minAmount, maxAmount, startHour, endHour } = req.query;
      
      const analytics = await storage.getRestaurantAnalytics(req.params.id, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        startHour: startHour ? parseInt(startHour as string) : undefined,
        endHour: endHour ? parseInt(endHour as string) : undefined,
      });
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching restaurant analytics:", error);
      res.status(500).json({ error: "Failed to fetch restaurant analytics" });
    }
  });

  app.get("/api/analytics/top-restaurants", async (req, res) => {
    try {
      const { startDate, endDate, limit } = req.query;
      
      const topRestaurants = await storage.getTopRestaurants({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(topRestaurants);
    } catch (error) {
      console.error("Error fetching top restaurants:", error);
      res.status(500).json({ error: "Failed to fetch top restaurants" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Seed database endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const result = await seedDatabase();
      res.json({ 
        message: "Database seeded successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
