# Cooling Dashboard

A comprehensive dashboard application for monitoring and analyzing cooling systems, emissions data, and refrigerant transitions. Built with SvelteKit and Supabase for scalable, secure data management.

## Features

- **Authentication**: Secure user authentication with Supabase SSR
- **Protected Dashboard**: Role-based access to dashboard pages
- **Real-time Data**: Monitor cooling metrics and emissions
- **Data Visualization**: Charts and analytics for cooling access and refrigerant tracking
- **Responsive Design**: Tailwind CSS for modern, mobile-friendly UI

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, RPC)
- **Build Tools**: Vite, PostCSS

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Supabase account and project

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cooling-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Project Structure

```
cooling-dashboard/
├── src/
│   ├── lib/
│   │   ├── components/      # Reusable Svelte components
│   │   ├── data/           # Data models and metrics
│   │   ├── services/       # API services and data fetching
│   │   ├── styles/         # Global styles and CSS
│   │   ├── supabase/       # Supabase client configuration
│   │   └── types/          # TypeScript type definitions
│   └── routes/
│       ├── (protected)/    # Authenticated routes
│       │   └── dashboard/  # Main dashboard page
│       ├── auth/           # Auth callback handlers
│       ├── login/          # Login page
│       └── register/       # Registration page
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript and Svelte checks

## Database Setup

1. **Generate Types**
   
   Update your TypeScript types from your Supabase schema:
   ```bash
   supabase gen types typescript --project-id <your-project-id> > src/lib/types/supabase.ts
   ```

2. **Setup Tables/Views**
   
   Create necessary tables, views, and RPC functions in your Supabase project for:
   - Cooling metrics
   - Emissions data
   - Refrigerant transitions
   - NDC tracker data

3. **Performance (Optional)**

   Run the SQL in `supabase/dashboard_materialized_views.sql` to create materialized views used by the dashboard for faster reads. Refresh those views as part of your data update pipeline.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
