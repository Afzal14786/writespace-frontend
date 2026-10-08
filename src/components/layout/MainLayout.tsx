import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      {/* The main content area grows to fill the screen, pushing the footer to the bottom.
        PaddingTop ensures the content isn't hidden behind the fixed glass header. 
      */}
      <main style={{ flex: 1, paddingTop: "80px", paddingBottom: "2rem" }}>
        <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;