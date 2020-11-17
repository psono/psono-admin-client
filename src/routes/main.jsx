import Index from '../containers/Index/Index';
import LoginPage from '../containers/Login/Login';

const indexRoutes = [
    { path: '/saml/token/:saml_token_id', component: LoginPage },
    { path: '/oidc/token/:oidc_token_id', component: LoginPage },
    { path: '/login', component: LoginPage },
    { path: '/', component: Index }
];

export default indexRoutes;
