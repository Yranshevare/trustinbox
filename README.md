## Monorepo Template

A modern, production-ready monorepo setup for building full-stack applications with shared tooling and configurations.


## 📦 Apps

* **`web`** – Next.js 16 frontend
* **`api`** – Hono.js backend


## 📚 Packages

* **`@repo/ui`** – Shared shadcn/ui components
* **`@repo/agent`** – Shared agent framework (in dev)
* **`@repo/eslint-config`** – Shared ESLint configuration
* **`@repo/ts-config`** – Shared TypeScript configuration
* **`@repo/vitest-config`** – Shared Vitest configuration
* **`@repo/prettier-config`** – Shared Prettier configuration


## 🛠️ Tooling & Configuration

* **TypeScript** – Static type checking across all packages
* **ESLint** – Code linting with shared rules
* **Prettier** – Consistent code formatting
* **Husky** – Git hooks for code quality enforcement
* **Commitlint** – Conventional commit message validation
* **Tailwind CSS** – Utility-first styling
* **Prisma** – Type-safe database ORM
* **Docker** – Containerization support


## 🚀 Quick Start

### Prerequisites

* **Node.js** 22+
* **pnpm** (recommended)
* **Git**


### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Set up the database** (API only)

   ```bash
   pnpm db:generate
   pnpm db:push
   ```


## 💻 Development

### Start all apps

```bash
pnpm dev
```

### Start a specific app

```bash
pnpm dev --filter=web
pnpm dev --filter=api
```

### Local URLs

* 🔧 **API**: [http://localhost:3000](http://localhost:3000)
* 🌐 **Web App**: [http://localhost:3001](http://localhost:3001)


## 🏗️ Build

### Build everything

```bash
pnpm build
```

### Build a specific app/package

```bash
pnpm build --filter=web
pnpm build --filter=api
pnpm build --filter=docs
```


## 🧪 Development Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Start web app only
pnpm dev:api          # Start API only

# Build
pnpm build            # Build all packages
pnpm build:web        # Build web app only
pnpm build:api        # Build API only

# Code Quality
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix lint issues
pnpm format           # Format code with Prettier
pnpm type-check       # Run TypeScript checks

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
```


## 🚢 Deployment

### Vercel (One-Click)

1. Connect the repository to **Vercel**
2. Configure build settings:

   * **Build Command:** `pnpm build --filter=web`
   * **Output Directory:** `apps/web/.next`
3. Set required environment variables in the Vercel dashboard
4. Deploy 🚀
