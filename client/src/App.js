import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import TrendPage from "./pages/TrendPage";
import TeamPage from "./pages/TeamPage";
import PlayerPage from "./pages/PlayerPage";
import ChampionshipPage from "./pages/ChampionshipPage";
import GamesPage from "./pages/GamesPage";
import Appendix from "./pages/Appendix";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trend" element={<TrendPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/players" element={<PlayerPage />} />
          <Route path="/champion" element={<ChampionshipPage />} />
          <Route path="/game" element={<GamesPage />} />
          <Route path="/appendix" element={<Appendix />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}