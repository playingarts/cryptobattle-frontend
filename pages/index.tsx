import { NextPage } from "next";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import NFTInventory from "../components/NFTInventory";
import { useAuth } from "../components/AuthProvider";
import NavProfile from "../components/NavProfile";
import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
import DashboardHeader from "../components/DashboardHeader";
import Loader from "../components/Loader";
import { logError } from "../utils/errorHandler";

const Dashboard: NextPage = () => {
  const { user, loggedIn, setToken } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-authenticate as guest if no token exists
  useEffect(() => {
    const hasToken = localStorage.getItem("accessToken") !== null;

    if (!hasToken && !loggedIn && !isAuthenticating) {
      setIsAuthenticating(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptobattle-backend-production.up.railway.app';
      axios.get(`${apiUrl}/auth/guest`, {
        headers: { "content-type": "application/json" },
      })
        .then((response) => {
          setToken(response.data.accesstoken);
        })
        .catch((err) => {
          logError(err, 'Dashboard auto-guest-auth');
          setIsAuthenticating(false);
        });
    }
  }, [loggedIn, isAuthenticating, setToken]);

  // Show loader while authenticating
  if (!loggedIn || isAuthenticating) {
    return (
      <div
        css={{
          height: "100vh",
          background: "#181818",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) scale(2)",
            lineHeight: 1,
            color: "#fff",
          }}
        />
      </div>
    );
  }

  const headerRight = null;
  const headerMiddle = <NavProfile user={user} />;

  return (
    <ComposedGlobalLayout
      headerTitle="DASHBOARD"
      headerMiddle={headerMiddle}
      headerRight={headerRight}
    >
      <Layout
        css={(theme) => ({
          background: "theme.colors.dark_gray",
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(10),
          paddingBottom: theme.spacing(6.5),
          backgroundSize: "cover",
        })}
      >
        <div>
          <div
            css={{
              padding: "0",
              marginTop: 40,
            }}
          >
            <DashboardHeader />
          </div>
          {/* NFT section hidden - functionality preserved */}
          <div css={{ display: 'none' }}>
            {!user.isGuest ? (
              <NFTInventory></NFTInventory>
            ) : (
              <div
                css={{
                  backgroundColor: "#181818",
                  color: "rgba(255, 255, 255, 0.5)",
                  maxWidth: 1040,
                  margin: "30px auto 0",
                  padding: "40px 70px",
                  fontSize: "16px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <p css={{ margin: 0, marginBottom: 10 }}>
                  You are playing as a guest. Stats and NFT cards are not available.
                </p>
                <p css={{ margin: 0, color: "rgba(255, 255, 255, 0.3)" }}>
                  Connect with Metamask to track your progress and use NFT cards.
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Dashboard;
