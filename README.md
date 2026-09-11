# Balance — personal finance demo

React, TypeScript, Vite, Tailwind CSS, and react-google-charts.

```sh
npm install
npm run dev
```

Sign in with `demo@example.com` / `Demo@123`, or use **Fill demo credentials**.
The dashboard shows monthly salary, expenses, remaining balance, a Google column chart,
and a Google donut chart. Select a different month to update all figures.

Edit demo credentials and monthly amounts in `src/data/demo.ts`. Amounts use INR.
Authentication is an in-memory frontend demo, persists for this browser tab via sessionStorage, and is not production authentication.
`react-google-charts` manages loading the underlying Google Charts library and requires an internet connection. All chart rendering goes through `src/components/FinanceChart.tsx`; there is no standalone loader.
The existing signup component is retained separately.

```sh
npm run build
npm run lint
npm run preview
```

React Google Charts documentation: https://www.react-google-charts.com/

## Routes

- `/login`: demo login
- `/signup`: signup form (demo only)
- `/dashboard`: financial summary and charts
- `/finances`: edit monthly salary and expense categories
- `/`: redirects to login or dashboard

Dashboard and finances require demo login. Unknown URLs show a not-found page.
For production hosting, configure the server to serve `index.html` for these client routes.
