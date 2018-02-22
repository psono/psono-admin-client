import App from '../containers/App/App.jsx';
import LoginPage from "../containers/Login/Login";

const indexRoutes = [
    { path: "/login", component: LoginPage },
    { path: "/", component: App },
];

export default indexRoutes;
