"use client"
// ProfileAndLinksStoreContext.js
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react"
import { LinksSchemaType } from "@/app/links/LinksFormProvider"

/**
 * the type of the React state that will be set as a root service
 */
export type ProfileAndLinksStoreType = {
  state: {
    firstName: string
    lastName: string
    email: string
    profilePicture: string
    links: { platform: string; link: string }[]
  }
  setState: Dispatch<
    SetStateAction<{
      firstName: string
      lastName: string
      email: string
      profilePicture: string
      links: { platform: string; link: string }[]
    }>
  >
}

/**
 * Initilizing the context
 * Create the function that can wrap around all other so that it sets the level of the service like state
 */
const ProfileAndLinksStoreContext = createContext<
  ProfileAndLinksStoreType | undefined
>(undefined)

/**
 * Way to take away the undefined type away when using the context
 * All globalize in this function like custom useContext wrapper
 */
export const useProfileAndLinksStoreContext = () => {
  const context = useContext(ProfileAndLinksStoreContext)
  if (!context) {
    throw new Error(
      "ProfileAndLinksStoreContext must be used within the Provider"
    )
  }
  return context
}

/**
 * Moving the initialization of the state initial data and setup
 * Later all we had to do is wrap it at the level we want to use it
 * Like a service at a specific level or at the root level
 * @param children
 * @constructor
 */
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
    links: [] as LinksSchemaType["links"],
  })

  return (
    <ProfileAndLinksStoreContext.Provider value={{ state, setState }}>
      {children}
    </ProfileAndLinksStoreContext.Provider>
  )
}

export { ProfileAndLinksStoreContext, ProfileAndLinksStoreProvider }
