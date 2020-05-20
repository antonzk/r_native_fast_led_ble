import { combineReducers } from 'redux'
import message from './MessageReducer'

const appReducer = combineReducers({
  message
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer