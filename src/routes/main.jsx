import Index from '../containers/Index/Index';
import Login from '../containers/Login/Login';

const indexRoutes = [
    { path: '/saml/token/:saml_token_id', component: Login },
    { path: '/oidc/token/:oidc_token_id', component: Login },
    { path: '/login', component: Login },
    { path: '/', component: Index }
];

export default indexRoutes;
