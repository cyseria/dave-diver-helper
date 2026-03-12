import { BrowserRouter, Route, Routes } from "react-router-dom";
import styles from "./App.module.css";
import { Topbar } from "./components/Topbar";
import { Fish } from "./pages/Fish";
import { Home } from "./pages/Home";
import { MapPage } from "./pages/Map";
import { Quests } from "./pages/Quests";
import { Recipes } from "./pages/Recipes";
import { Staff } from "./pages/Staff";
import { Weapons } from "./pages/Weapons";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
      <div className={styles.appShell}>
        <Topbar />
        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fish" element={<Fish />} />
            <Route path="/fish/:id" element={<Fish />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<Recipes />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/:id" element={<Staff />} />
            <Route path="/weapons" element={<Weapons />} />
            <Route path="/weapons/:id" element={<Weapons />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/quests/:id" element={<Quests />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
