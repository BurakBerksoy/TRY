# TaskMaster - Full-Stack Todo Application

This is a professional full-stack Todo List application built with Next.js, PostgreSQL, and Prisma.

## Features

- **Task Management**: Create, Read, Update, and Delete tasks.
- **AI-Powered Task Planning**: Use AI to generate task titles, descriptions, and statuses from a simple prompt.
- **Clean, Modern UI**: Aesthetically pleasing interface built with shadcn/ui and Tailwind CSS.
- **Server-Side Logic**: Leverages Next.js Server Components and Server Actions for a fast and robust experience.

## Getting Started

Follow these steps to get the application up and running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/download/) installed and running.

### 2. Installation

First, clone the repository and install the dependencies:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

The `DATABASE_URL` in `.env.example` is pre-configured for a local PostgreSQL instance with the following credentials:
- **User**: `postgresql`
- **Password**: `1`
- **Database**: `taskmaster`

Make sure you have a PostgreSQL user and database that match these credentials, or update the `DATABASE_URL` in your `.env` file accordingly.

### 4. Database Migration

Run the Prisma migration to create the necessary tables in your database:

```bash
npx prisma migrate dev --name init
```

Prisma will create the `Task` table based on the schema in `prisma/schema.prisma`.

### 5. Run the Development Server

Now, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start adding tasks!
