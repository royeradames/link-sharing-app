import { useContext } from "react"
import { ProfileAndLinksStoreContext } from "@/app/ProfileAndLinksStoreProvider"

export function PreviewElements() {
  const userData = useContext(ProfileAndLinksStoreContext)
  return (
    <>
      <div className="flex flex-col items-center gap-[25px] ">
        <div
          className={`w-[97px] h-[96px] rounded-full`}
          style={{
            backgroundImage: userData.state.profilePicture
              ? `url(${userData.state.profilePicture})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!userData.state.profilePicture && (
            <svg
              id="profile-image"
              width="97"
              height="96"
              viewBox="0 0 97 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle id="Ellipse 3" cx="48.5" cy="48" r="48" fill="#EEEEEE" />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-[13px] items-center ">
          {!(userData.state.firstName || userData.state.lastName) && (
            <svg
              id="name"
              width="161"
              height="16"
              viewBox="0 0 161 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0.5" width="160" height="16" rx="8" fill="#EEEEEE" />
            </svg>
          )}

          {(userData.state.firstName || userData.state.lastName) && (
            <p className="text-dark-grey text-lg font-semibold leading-[150%]">{`${userData.state.firstName} ${userData.state.lastName}`}</p>
          )}

          {!userData.state.email && (
            <svg
              id="email"
              width="73"
              height="8"
              viewBox="0 0 73 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0.5" width="72" height="8" rx="4" fill="#EEEEEE" />
            </svg>
          )}

          {userData.state.email && (
            <p className="text-grey text-sm font-normal leading-[150%]">
              {userData.state.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-5 ">
        <svg
          id="link-1"
          width="237"
          height="44"
          viewBox="0 0 237 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="237" height="44" rx="8" fill="#EEEEEE" />
        </svg>

        <svg
          id="link-2"
          width="237"
          height="44"
          viewBox="0 0 237 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="237" height="44" rx="8" fill="#EEEEEE" />
        </svg>

        <svg
          id="link-3"
          width="237"
          height="44"
          viewBox="0 0 237 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="237" height="44" rx="8" fill="#EEEEEE" />
        </svg>

        <svg
          id="link-4"
          width="237"
          height="44"
          viewBox="0 0 237 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="237" height="44" rx="8" fill="#EEEEEE" />
        </svg>

        <svg
          id="link-5"
          width="237"
          height="44"
          viewBox="0 0 237 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="237" height="44" rx="8" fill="#EEEEEE" />
        </svg>
      </div>
    </>
  )
}
