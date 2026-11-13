import Image from "next/image"
import { platforms } from "@/lib/draft"
import type { PublicProfile } from "@/lib/publishing"

/** A published profile: only the fields its owner chose to show. */
export function PublicProfileCard({ profile }: { profile: PublicProfile }) {
  return (
    <section className="profile-card" aria-label="Public profile">
      {profile.image && (
        <Image
          unoptimized
          src={profile.image}
          width={96}
          height={96}
          className="avatar"
          alt={profile.name ? `${profile.name}’s profile picture` : "Profile picture"}
        />
      )}
      <h1>{profile.name ?? "Devlinks profile"}</h1>
      {profile.email && (
        <p className="profile-email">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
      )}
      {profile.links.length > 0 && (
        <ul className="saved-links">
          {profile.links.map(link => {
            const platform = platforms.find(item => item.id === link.platform)
            return (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: platform?.color }}
                >
                  <span>{platform?.name}</span>
                  <span aria-hidden="true">→</span>
                  <span className="sr-only"> opens in a new tab</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
