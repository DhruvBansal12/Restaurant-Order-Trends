import { db } from "./db";
import { restaurants, orders } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.delete(orders);
    await db.delete(restaurants);

    // Sample restaurants
    const sampleRestaurants = [
      {
        name: "Mario's Pizza Palace",
        cuisine: "italian",
        location: "Downtown",
      },
      {
        name: "Sakura Sushi",
        cuisine: "japanese", 
        location: "Midtown",
      },
      {
        name: "El Taco Loco",
        cuisine: "mexican",
        location: "South Side",
      },
      {
        name: "Burger Haven",
        cuisine: "american",
        location: "Uptown",
      },
      {
        name: "Golden Dragon",
        cuisine: "chinese",
        location: "Downtown",
      },
      {
        name: "Spice Garden",
        cuisine: "indian",
        location: "Midtown",
      },
    ];

    // Insert restaurants
    const insertedRestaurants = await db
      .insert(restaurants)
      .values(sampleRestaurants)
      .returning();

    console.log(`✅ Inserted ${insertedRestaurants.length} restaurants`);

    // Generate sample orders over the past 30 days
    const sampleOrders = [];
    const now = new Date();
    
    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // Generate 5-15 orders per day
      const ordersPerDay = Math.floor(Math.random() * 11) + 5;
      
      for (let order = 0; order < ordersPerDay; order++) {
        const randomRestaurant = insertedRestaurants[Math.floor(Math.random() * insertedRestaurants.length)];
        
        // Random hour between 8 AM and 11 PM
        const hour = Math.floor(Math.random() * 16) + 8;
        const minute = Math.floor(Math.random() * 60);
        
        const orderTime = new Date(date);
        orderTime.setHours(hour, minute, 0, 0);
        
        // Random order amount between $10 and $150
        const amount = (Math.random() * 140 + 10).toFixed(2);
        
        sampleOrders.push({
          restaurantId: randomRestaurant.id,
          amount,
          timestamp: orderTime,
        });
      }
    }

    // Insert orders in batches
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < sampleOrders.length; i += batchSize) {
      const batch = sampleOrders.slice(i, i + batchSize);
      await db.insert(orders).values(batch);
      insertedCount += batch.length;
    }

    console.log(`✅ Inserted ${insertedCount} orders`);
    console.log("🎉 Database seeding completed successfully!");
    
    return { restaurants: insertedRestaurants.length, orders: insertedCount };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}