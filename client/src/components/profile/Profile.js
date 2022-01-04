import React, {Fragment, useEffect} from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import Spinner from '../layouts/Spinner'
import { getProfileById } from '../../actions/profile'

const Profile = ({getProfileById, profile: { profile, loading }, auth}) => {
    const {id} = useParams()

    useEffect(() => {
        getProfileById(id)

    }, [getProfileById, id])


    return (
        <div>
            Profile
        </div>
    )
}

Profile.propTypes = {
    getProfileById: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})

export default connect(mapStateToProps, {getProfileById})(Profile)
