"use client"
// ProfileAndLinksStoreContext.js
import { createContext, ReactNode, useState } from "react"

const defaultValue = {
  state: {
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  },
  setState: (newValue: any) => {}, // Provide a default no-op function
}
// Create the context
const ProfileAndLinksStoreContext = createContext(defaultValue)

// Create a provider component
const ProfileAndLinksStoreProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  })

  return (
    <ProfileAndLinksStoreContext.Provider value={{ state, setState }}>
      {children}
    </ProfileAndLinksStoreContext.Provider>
  )
}

export { ProfileAndLinksStoreContext, ProfileAndLinksStoreProvider }
