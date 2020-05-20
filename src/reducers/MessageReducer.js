import { MessageAction } from '../actions/MessageActions'

const defaultState = {
    isMessageShown: false,
    messageText: ''
}

const message = (state: any = defaultState, action: any) => {
    let newState = null

    switch (action.type) {
        case MessageAction.MESSAGE_SHOW:
            newState = {
                ...state,
                isMessageShown: true,
                messageText:action.text
            }
            break
        case MessageAction.MESSAGE_HIDE:
            newState = {
                ...state,
                isMessageShown: false,
                messageText:''
            }
            break
       
    }

    return newState || state
}

export default message