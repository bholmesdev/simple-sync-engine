import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./routes/Home";
import { pull, useMigrations } from "./lib/db.client";
import { useEffect } from "react";

export function App() {
  const isMigrationsLoaded = useMigrations();
  if (!isMigrationsLoaded) return <div>Initializing DB...</div>;

  return <Router />;
}

function Router() {
  useEffect(() => {
    const interval = setInterval(() => {
      pull();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
