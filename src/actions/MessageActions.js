const MessageAction = {
  MESSAGE_SHOW: 'MESSAGE_SHOW',
  MESSAGE_HIDE: 'MESSAGE_HIDE',
}

const showMessage = (text: string) => {
  return (dispatch: Function) => {
    dispatch(show(text))
  }
}

const hideMessage = () => {
    return (dispatch: Function) => {
      dispatch(hide())
    }
  }

const show = (text: string) => {
  return {
    type: MessageAction.MESSAGE_SHOW,
    text
  }
}

const hide = () => {
  return {
    type: MessageAction.MESSAGE_HIDE
  }
}

export {
  MessageAction,
  showMessage,
  hideMessage
}