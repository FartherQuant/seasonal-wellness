import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Home from "@/pages/Home"
import SolarTerms from "@/pages/SolarTerms"
import Constitution from "@/pages/Constitution"
import Wellness from "@/pages/Wellness"
import Recipe from "@/pages/Recipe"
import Tea from "@/pages/Tea"
import Assess from "@/pages/Assess"
import CityPicker from "@/components/CityPicker"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="solar-term" element={<SolarTerms />} />
          <Route path="constitution" element={<Constitution />} />
          <Route path="wellness" element={<Wellness />} />
          <Route path="recipe" element={<Recipe />} />
          <Route path="tea" element={<Tea />} />
          <Route path="assess" element={<Assess />} />
          <Route path="city-picker" element={<CityPicker />} />
        </Route>
      </Routes>
    </Router>
  )
}
