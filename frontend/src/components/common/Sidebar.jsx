import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Icons
import { 
  MdHomeFilled, 
  MdHome,
  MdMessage,
  MdOutlineMessage,
  MdPerson,
  MdPersonOutline,
  MdLogout,
  MdSmartToy,
  MdOutlineSmartToy
} from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: MdHome,
      activeIcon: MdHomeFilled
    },
    {
      path: "/messages",
      label: "Messages",
      icon: MdOutlineMessage,
      activeIcon: MdMessage
    },
    {
      path: "/ai-chat",
      label: "AI Chat",
      icon: MdOutlineSmartToy,
      activeIcon: MdSmartToy
    },
    {
      path: `/profile/${authUser?.username}`,
      label: "Profile",
      icon: MdPersonOutline,
      activeIcon: MdPerson
    }
  ];

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52 sticky top-0 h-screen">
      <div className="flex flex-col h-full border-r border-base-300 bg-base-100">
        {/* Logo */}
        <div className="p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-content font-bold text-lg">F</span>
            </div>
            <span className="hidden md:block text-xl font-bold text-primary">
              FriendsOrbit
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path.includes('/profile/') && location.pathname.includes('/profile/'));
              const Icon = isActive ? item.activeIcon : item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-base-200 ${
                      isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="hidden md:block">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {authUser && (
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img 
                    src={authUser.profileImage || "/avatar-placeholder.png"} 
                    alt={authUser.username}
                  />
                </div>
              </div>
              <div className="hidden md:block flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {authUser.fullName}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  @{authUser.username}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="btn btn-ghost btn-sm btn-circle"
                title="Logout"
              >
                <MdLogout className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;