//import history from '../utils/history'
import {
    LOGIN,
    LOGOUT
} from './actionTypes'

export function setIsLoggedIn(username) {
    return {
        type: LOGIN,
        username,
    }
}

export function login(username, password) {
    return (dispatch) => {
        dispatch(setIsLoggedIn(username));
        //history.push('/dashboard');
    };
}
export function logout() {
    return {
        type: LOGOUT
    }
}


// /**
//  * Logs an user in
//  * @param  {string} username The username of the user to be logged in
//  * @param  {string} password The password of the user to be logged in
//  */
// export function login(username, password) {
//     return (dispatch) => {
//         // Show the loading indicator, hide the last error
//         dispatch(sendingRequest(true));
//         // If no username or password was specified, throw a field-missing error
//         if (anyElementsEmpty({ username, password })) {
//             dispatch(setErrorMessage(errorMessages.FIELD_MISSING));
//             dispatch(sendingRequest(false));
//             return;
//         }
//         // Generate salt for password encryption
//         const salt = genSalt(username);
//         // Encrypt password
//         bcrypt.hash(password, salt, (err, hash) => {
//             // Something wrong while hashing
//             if (err) {
//                 dispatch(setErrorMessage(errorMessages.GENERAL_ERROR));
//                 return;
//             }
//             // Use user.js to fake a request
//             user.login(username, hash, (success, err) => {
//                 // When the request is finished, hide the loading indicator
//                 dispatch(sendingRequest(false));
//                 dispatch(setAuthState(success));
//                 if (success === true) {
//                     // If the login worked, forward the user to the dashboard and clear the form
//                     browserHistory.push('/dashboard');
//                     dispatch(changeForm({
//                         username: "",
//                         password: ""
//                     }));
//                 } else {
//                     switch (err.type) {
//                         case 'user-doesnt-exist':
//                             dispatch(setErrorMessage(errorMessages.USER_NOT_FOUND));
//                             return;
//                         case 'password-wrong':
//                             dispatch(setErrorMessage(errorMessages.WRONG_PASSWORD));
//                             return;
//                         default:
//                             dispatch(setErrorMessage(errorMessages.GENERAL_ERROR));
//                             return;
//                     }
//                 }
//             });
//         });
//     }
// }
//
// /**
//  * Logs the current user out
//  */
// export function logout() {
//     return (dispatch) => {
//         dispatch(sendingRequest(true));
//         user.logout((success, err) => {
//             if (success === true) {
//                 dispatch(sendingRequest(false));
//                 dispatch(setAuthState(false));
//                 browserHistory.replace(null, '/');
//             } else {
//                 dispatch(setErrorMessage(errorMessages.GENERAL_ERROR));
//             }
//         });
//     }
// }