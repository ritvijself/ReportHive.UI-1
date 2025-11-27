import { useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="tw:bg-white/70 tw:backdrop-blur-lg tw:shadow-sm tw:w-full tw:px-12 tw:py-3 tw:flex tw:items-center tw:justify-between tw:border-b tw:border-gray-200">
      <div className="tw:flex tw:items-center tw:gap-4">
        <div
          className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="tw:bg-blue-600 tw:p-2 tw:rounded-md ">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="7" height="12" rx="1.5" fill="white" />
              <rect
                x="13"
                y="4"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                fillOpacity="0.7"
              />
            </svg>
          </div>
          <h1 className="tw:text-xl tw:font-bold tw:text-gray-800 tw:tracking-tighter">
            workflo
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
