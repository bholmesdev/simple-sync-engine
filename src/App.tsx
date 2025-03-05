import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./routes/Home";
import { useMigrations } from "./lib/db.client";

export function App() {
  const isMigrationsLoaded = useMigrations();
  if (!isMigrationsLoaded) return <div>Initializing DB...</div>;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
