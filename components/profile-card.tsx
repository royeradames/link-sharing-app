import Image from "next/image"
import { platforms, type Draft } from "@/lib/draft"
export function ProfileCard({ draft }: { draft: Draft }) {
  const { profile, links } = draft
  return (
    <section className="profile-card" aria-label="Saved profile">
      {profile.image ? (
        <Image
          unoptimized
          src={profile.image}
          width={96}
          height={96}
          className="avatar"
          alt="Saved profile picture"
        />
      ) : (
        <div className="avatar placeholder" aria-hidden="true" />
      )}
      <h2>
        {[profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          "Your saved profile"}
      </h2>
      {profile.email && <p className="profile-email">{profile.email}</p>}
      <ul className="saved-links">
        {links.map(link => {
          const platform = platforms.find(item => item.id === link.platform)
          return (
            <li key={link.id}>
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
      {!links.length && <p className="muted">No saved links yet.</p>}
    </section>
  )
}
