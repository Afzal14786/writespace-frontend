import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UsersAPI } from "../../api/users.api";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginState } = useAuth();
  
  const isProcessed = useRef(false); 

  useEffect(() => {
    if (isProcessed.current) return;

    const initializeOAuth = async () => {
      isProcessed.current = true;
      const urlToken = searchParams.get("token");

      if (!urlToken) {
        navigate("/login?error=oauth_failed", { replace: true });
        return;
      }

      try {
        localStorage.setItem("accessToken", urlToken);
        const userProfile = await UsersAPI.getMe();
        
        loginState(userProfile, urlToken);
        
        navigate("/", { replace: true });
      } catch (error) {
        console.error("OAuth handshake failed:", error);
        localStorage.removeItem("accessToken");
        navigate("/login?error=oauth_profile_fetch_failed", { replace: true });
      }
    };

    initializeOAuth();
  }, [searchParams, navigate, loginState]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
        Securing your session...
      </div>
    </div>
  );
}