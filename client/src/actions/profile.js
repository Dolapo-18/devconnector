import axios from "axios";
import {setAlert} from './alert'
import {GET_PROFILE, PROFILE_ERROR} from "./types"


//Get profile
export const getCurrentProfile = () => async dispatch => {
    const res = await axios('/api/profile/me')

    try {
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
   
} 

//Create or Update profile

export const createProfile = (formData, history, edit=false) => async dispatch => {
    try {
        const res = await axios.post('/api/profile', formData)
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'))

        //to redirect if user creates a new profile
        if (!edit) {
            history.push('/dashboard')
        }
    } catch (err) {
        const errors = err.response.data.errors;
        if (errors) {
          errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}