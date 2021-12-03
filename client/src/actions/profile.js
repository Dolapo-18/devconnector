import axios from "axios";
import {setAlert} from './alert'
import {ACCOUNT_DELETED, CLEAR_PROFILE, GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE} from "./types"


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

//Add Experience
export const addExperience = (formData, history) => async dispatch => {
    try {
        const res = await axios.put('/api/profile/experience', formData)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert("Experience Added", 'success'))

        //to redirect if user adds Experience
        
        history.push('/dashboard')
        
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


//add Education
export const addEducation = (formData, history) => async dispatch => {
    try {
        const res = await axios.put('/api/profile/education', formData)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert("Education Added", 'success'))

        //to redirect if user adds Education
        history.push('/dashboard')
        
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

//Delete Experience
export const deleteExperience = (id) => async dispatch => {
    if (window.confirm('Are you sure you want to delete???')) {
        try {
            const res = await axios.delete(`/api/profile/experience/${id}`)
            dispatch({
                type: UPDATE_PROFILE,
                payload: res.data
            })
            dispatch(setAlert("Experience Deleted!!!", 'success'))
    
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: {msg: err.response.statusText, status: err.response.status}
            })
        }
    }
   
}

//Delete Education
export const deleteEducation = (id) => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert("Education Deleted!!!", 'success'))

    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText, status: err.response.status}
        })
    }
}

//Delete Account & Profile
export const deleteAccount = () => async dispatch => {
    if (window.confirm('Are you sure you want to delete this account???')) {
        try {
            const res = await axios.delete('/api/profile/')
            dispatch({type: CLEAR_PROFILE, })
            dispatch({type: ACCOUNT_DELETED, })

            dispatch(setAlert("Your Account Has Been Permanently Deleted!!!", 'success'))
    
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: {msg: err.response.statusText, status: err.response.status}
            })
        }
    }

    
}