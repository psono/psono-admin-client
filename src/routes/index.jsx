import Index from '../containers/Index/Index';
import LoginPage from "../containers/Login/Login";

const indexRoutes = [
    { path: "/login", component: LoginPage },
    { path: "/", component: Index },
];

export default indexRoutes;
