import { ReactElement, ReactNode } from "react";
import { useAuth } from "../context/useAuthContext";
import { Navigate } from "react-router-dom";

export const MypageRoute = ({children} : {children: ReactElement}) => {
    const {isAuthenticated,loading} = useAuth();

    if(loading || isAuthenticated === null) return<p>Loading...</p>;

    if(!isAuthenticated) return <Navigate to="/" replace/>

    return children;
}