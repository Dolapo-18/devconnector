import axios from "axios";
import {GET_PROFILE, PROFILE_ERROR} from "./types"

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