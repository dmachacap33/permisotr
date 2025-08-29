# Work Permits Management System

## Overview

This is a comprehensive work permits management system designed for industrial safety compliance. The application enables organizations to create, validate, and approve work permits for different types of industrial work including excavation, hot work, and cold work. Each permit type includes specific safety checklists, PPE requirements, and risk analysis protocols to ensure workplace safety compliance.

The system features a role-based access control system with different permission levels (admin, supervisor, user, operator) and includes comprehensive workflow management for permit approval processes. It supports real-time collaboration, photo documentation, and detailed audit trails for all permit activities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Pattern**: RESTful API with structured error handling
- **Middleware**: Custom logging, authentication, and error handling middleware

### Database Design
- **Database**: PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - Users table with role-based access control
  - Permits table with comprehensive workflow states
  - Permit history for audit trails
  - Session storage for authentication
- **Relationships**: Foreign key relationships between users, permits, and history records

### Authentication System
- **Provider**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express session with PostgreSQL store
- **Security Features**: HTTP-only cookies, CSRF protection, secure session handling
- **Authorization**: Role-based permissions with middleware protection

### File Upload & Storage
- **Implementation**: Multi-modal approach supporting both camera capture and file upload
- **Frontend**: Custom photo capture component with camera API integration
- **Backend**: Prepared for integration with cloud storage services
- **Format Support**: Image files with client-side validation

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Error Handling**: Runtime error modal integration for development
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Path Resolution**: Absolute imports with custom path aliases

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connector optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **express**: Web application framework for the backend API
- **@tanstack/react-query**: Server state management and caching

### Authentication Services
- **openid-client**: OpenID Connect client for Replit Auth integration
- **passport**: Authentication middleware with strategy pattern
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Component Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **lucide-react**: Icon library with consistent design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements

### Form Handling & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **nanoid**: URL-safe unique ID generator
- **memoizee**: Function memoization for performance optimization