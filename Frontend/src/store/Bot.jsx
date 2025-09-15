import { createContext, useState } from 'react'

export const BotContext = createContext({
  state: '',
})

export const BotProvider = ({ children }) => {
  const [state, setState] = useState('')

  return (
    <BotContext.Provider value={{ state, setState }}>
      {children}
    </BotContext.Provider>
  )
}
