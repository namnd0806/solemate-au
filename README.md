# SoleMate Australia

E-commerce platform for footwear sales in the Australian market. This is a learning project simulating a real-world BNPL (Buy Now, Pay Later) e-commerce system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Validation**: Zod
- **Forms**: React Hook Form
- **Deployment**: Vercel

## Project Structure

```
solemate-au/
├── docs/                  # Requirements and specifications
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Business logic, services, utilities
│   └── types/            # TypeScript type definitions
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions (if needed)
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm
- Supabase account (for database setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solemate-au
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-only)
- `NEXT_PUBLIC_APP_URL`: Application URL (http://localhost:3000 for local dev)

**Important**: Never commit `.env.local` to Git. Secrets are only stored in `.env.local` (development) and Vercel environment settings (production).

### Running Locally

Development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Walkthrough (Local)

After running `npm run dev`, test the complete user flow:

1. **Browse Products**: Navigate to `/products` to view the product catalog
2. **Add to Cart**: Click on a product and add items to cart
3. **Checkout**: Go to `/checkout`, enter shipping address, apply promotion code (if available)
4. **Payment**: Select payment method (Card/PayPal/Afterpay/COD) and complete checkout
5. **Order Confirmation**: View order details and order history at `/account/orders`
6. **Admin Panel**: Access `/admin` with admin credentials to:
   - Manage products and inventory
   - View and process orders
   - Manage shipments and COD collection
   - Create and manage promotions

**Demo Credentials** (after seed):
- Customer: customer@demo.com / password123
- Admin: admin@demo.com / password123

### Deployment to Vercel

1. Push code to GitHub repository
2. Connect repository to Vercel project
3. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)
4. Deploy: `git push` will automatically trigger deployment
5. Update Supabase Auth redirect URLs to include your Vercel domain

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Project Phases

This project is built incrementally following a phased approach:

- **Phase 0**: Project initialization ✅
- **Phase 1**: UI shell and design system
- **Phase 2**: Database, migrations, RLS, seed data
- **Phase 3**: Authentication, profile, address management
- **Phase 4**: Product catalog and storefront
- **Phase 5**: Wishlist and shopping cart
- **Phase 6**: Checkout and shipping
- **Phase 7**: Payment simulator and order placement
- **Phase 8**: Customer order management
- **Phase 9**: Admin panel (products, inventory, orders, promotions)
- **Phase 10**: Deployment and polish

## Documentation

- See `/docs` folder for detailed specifications:
  - Business & Technical Analysis
  - API Specification
  - Database Design
  - Architecture Documentation
  - Development Roadmap

## Key Features (40 Functions)

### Customer Features
- Product browsing, search, and filtering
- User registration and authentication
- Profile and address management
- Wishlist
- Shopping cart with promotion codes
- Multi-step checkout
- Payment methods: Card, PayPal, Afterpay, Cash on Delivery (COD)
- Order history and management
- Order cancellation and reordering

### Admin Features
- Product and variant management
- Inventory adjustments
- Order fulfillment and shipment tracking
- COD payment collection
- Promotion management

## Business Rules

- **Server Authoritative**: Price, stock, promotions, and totals calculated server-side
- **Transaction Safety**: Order placement uses atomic transactions with idempotency
- **No Real Payments**: Payment simulators for learning purposes
- **RLS Enabled**: Row-level security for data ownership
- **Audit Trail**: Admin operations logged for compliance

## Security

- Passwords managed by Supabase Auth (never stored in public schema)
- No CVV or full card numbers stored
- Row-level security (RLS) policies enabled
- Server-side role checks for admin operations
- Secrets never committed to Git

## License

This is a learning project. Not for commercial use.

## Support

For questions or issues, refer to project documentation in `/docs`.
