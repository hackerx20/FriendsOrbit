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
    <div className="md:flex-[2_2_0] w-18 max-w-64 sticky top-0 h-screen">
      <div className="flex flex-col h-full border-r border-base-300 bg-base-100/80 backdrop-blur-md">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-content font-bold text-xl">F</span>
            </div>
            <span className="hidden md:block text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FriendsOrbit
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path.includes('/profile/') && location.pathname.includes('/profile/'));
              const Icon = isActive ? item.activeIcon : item.icon;
              
              return (
                <li key={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold shadow-lg border border-primary/20' 
                          : 'text-base-content hover:bg-base-200/70 hover:text-primary'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavItem"
                          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl"
                          initial={false}
                        />
                      )}
                      <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-primary' : ''}`} />
                      <span className={`hidden md:block relative z-10 font-medium ${isActive ? 'text-primary' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {authUser && (
          <div className="p-4 border-t border-base-300/50">
            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200/50 transition-colors">
              <div className="avatar">
                <div className="w-12 rounded-full ring-2 ring-primary/20">
                  <img 
                    src={authUser.profileImage || "/avatar-placeholder.png"} 
                    alt={authUser.username}
                  />
                </div>
              </div>
              <div className="hidden md:block flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-base-content">
                  {authUser.fullName}
                </p>
                <p className="text-xs text-base-content/50 truncate">
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
                className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error transition-colors"
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