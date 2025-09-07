# Restaurant-Order-Trends
A full-stack application for tracking and analyzing restaurant orders, revenue, and peak business hours.

## Features

- **Dashboard Analytics**: Visualize key metrics and trends
- **Order Management**: Track and manage restaurant orders
- **Restaurant Management**: Add and manage restaurant information
- **Peak Hours Analysis**: Identify busy periods and optimize staffing
- **Revenue Tracking**: Monitor financial performance
- **Interactive Charts**: Data visualization using modern charting libraries

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching
- Interactive charts for data visualization

### Backend
- Node.js server
- RESTful API endpoints
- Drizzle ORM for database operations
- TypeScript for type safety

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
├── server/                # Backend Node.js server
│   ├── routes.ts         # API route definitions
│   ├── db.ts             # Database configuration
│   └── storage.ts        # Data storage logic
└── shared/               # Shared types and utilities
    └── schema.ts         # Database schema definitions
```

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd Restaurant-Order-Trends
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. **Start the development servers**
```bash
# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd client
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

