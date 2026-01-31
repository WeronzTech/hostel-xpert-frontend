import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="mt-[60px] sm:mt-[60px] xl:mt-[120px] lg:mt-[120px] md:mt-[60px]">  {/* Adjust based on your navbar height */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;