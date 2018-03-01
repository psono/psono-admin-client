/**
 * Gitlab service, that implements the Gitlab API
 */

import axios from 'axios';

const GITLAB_API = 'https://gitlab.com/api/v4';
const PROJECT_ID_PSONO_PSONO_SERVER = 1732408;
const PROJECT_ID_PSONO_PSONO_CLIENT = 1732421;
const PROJECT_ID_PSONO_PSONO_ADMIN_CLIENT = 5525964;

const psono_server = {
    get_tags() {
        return axios.get(
            GITLAB_API +
                '/projects/' +
                PROJECT_ID_PSONO_PSONO_SERVER +
                '/repository/tags'
        );
    }
};

const psono_client = {
    get_tags() {
        return axios.get(
            GITLAB_API +
                '/projects/' +
                PROJECT_ID_PSONO_PSONO_CLIENT +
                '/repository/tags'
        );
    }
};

const psono_admin_client = {
    get_tags() {
        return axios.get(
            GITLAB_API +
                '/projects/' +
                PROJECT_ID_PSONO_PSONO_ADMIN_CLIENT +
                '/repository/tags'
        );
    }
};

const service = {
    psono_server,
    psono_client,
    psono_admin_client
};

export default service;
