# MetaScope - SEO Meta Tag Analyzer

## Overview

MetaScope is a full-stack web application for analyzing and optimizing website SEO metadata. The app allows users to input URLs, analyze their SEO performance, view social media previews, and receive AI-generated suggestions for improvement. It features a modern React frontend with a dark theme, Express.js backend, and includes user authentication and data persistence capabilities.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React with Vite as the build tool, using TypeScript for type safety
- **Backend**: Express.js server with TypeScript, handling API routes and HTML parsing
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Authentication**: Firebase Auth integration for user management
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for lightweight client-side routing
- **Component Structure**: Modular component design with shadcn/ui as the base
- **Theme System**: Dark/light mode support with CSS variables
- **TypeScript**: Full type safety across the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging and error handling
- **HTML Parsing**: Cheerio library for server-side HTML analysis
- **Database Layer**: Drizzle ORM with PostgreSQL for structured data storage
- **Storage Abstraction**: Interface-based storage system supporting both memory and database implementations

### Database Schema
- **Firebase Firestore**: Real-time NoSQL database for production data storage
- **Users Collection**: Stores user authentication data (Firebase UID, email, display name)
- **SEO Analyses Collection**: Stores complete SEO analysis results with nested objects
- **Fallback Storage**: In-memory storage when Firestore is unavailable
- **Type Safety**: Drizzle-generated types and Zod schemas for validation

### Key Features
- **SEO Analysis**: Comprehensive metadata extraction and scoring using Cheerio
- **Social Previews**: Google, Twitter, and Facebook link preview generation
- **AI Suggestions**: Hugging Face Flan-T5 integration for content generation
- **PDF Export**: Built-in capability for report generation
- **User Authentication**: Firebase Auth with Google sign-in support
- **Data Persistence**: Firebase Firestore for saving user analyses

## Data Flow

1. **User Input**: URL submission through the frontend form
2. **API Request**: Frontend sends POST request to `/api/analyze` with URL
3. **HTML Fetching**: Backend fetches the target URL's HTML content
4. **Content Parsing**: Cheerio extracts metadata, social tags, and technical SEO elements
5. **Analysis Processing**: Server calculates SEO score and identifies issues
6. **Response**: Structured analysis data returned to frontend
7. **UI Rendering**: Frontend displays results in interactive components
8. **AI Enhancement**: Optional AI-generated suggestions via `/api/generate` endpoint
9. **Data Persistence**: Analysis can be saved to database for authenticated users

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web framework for Node.js
- **Firebase Firestore**: NoSQL database for real-time data storage
- **Firebase Auth**: User authentication and management
- **Hugging Face API**: Flan-T5 model for AI content generation
- **Cheerio**: Server-side HTML parsing library

### UI/UX Libraries
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **TanStack Query**: Data fetching and caching

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Build Process**: Vite builds the frontend, ESBuild bundles the backend
- **Production Server**: Node.js server serving both API and static files
- **Database**: PostgreSQL 16 module configured in Replit
- **Environment**: Node.js 20 runtime environment
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Auto-scaling**: Configured for Replit's autoscale deployment target

### Development Workflow
- **Dev Command**: `npm run dev` starts both frontend and backend in development
- **Build Command**: `npm run build` creates production bundles
- **Start Command**: `npm run start` runs the production server
- **Database**: `npm run db:push` deploys schema changes

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```