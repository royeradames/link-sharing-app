# Issues

## How can we change the select current option without using css variables in tailwind? #2042

https://github.com/shoelace-style/shoelace/discussions/2042

## SL issues with importing

digest: "2262742997"
⚠ Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
GET / 500 in 1500ms

Next js hard reloads on every update


## Icon component not working

Nothing displays
```tsx
"use client"
import {
  SlIcon
} from "@/node_modules/@shoelace-style/shoelace/cdn/react"
export default function IconText(){
  return <SlIcon name="github"></SlIcon>
}

```

# Interesting

## Interesting way to style for ::part
`<sl-option class="&[aria-selected=“true”]:[&::part(base)]:bg-blue-500"></sl-option>`

[link to discussion](https://github.com/shoelace-style/shoelace/discussions/1969#discussioncomment-9584276)
# Lesson learns

## previous demo page

```tsx
 <FormDemo />
<Heading as="h1">Royer Adames</Heading>
<Heading as="h1" size="small">
  Royer Adames
</Heading>
<Text>Body Medium Royer Adames</Text>
<Text size="small">Body small Royer Adames</Text>
<Button>Primary Button</Button>
<Button disabled>Primary disable Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="secondary" disabled>
  Secondary disable Button
</Button>
<Nav></Nav>
<Nav></Nav>
```

## First translate to css then tailwind 

Due to it being more support for css and having to use arbitrary values

## Dropdown

### tailwind using ::part

Using arbitrary 

```
[&::part(base)]
```

With plugin (for tailwind config)
```
plugins: [
    plugin(function ({ matchVariant, e }) {
    matchVariant("part", value => `&::part(${value})`)
    }),
],
```


### Styling

We can style things through tailwind with after content but we cannot connect the after with :part.

Fail try: Trying to add text base when the item aria-label-selected true adds the text in the item and the select group box. 
Learn: We can style other elements base on other elements props. [Tailwind additional details](https://tailwindcss.com/docs/hover-focus-and-other-states#before-and-after)
```tsx
// aria-selected:after:content-['(selected)']
// aria-selected:after:content-['(selected2)']:part-[base]
// flex
// items-center
// aria-selected:after:text-purple
<SlOption
  key={i}
  value={option.value}
  className="
            part-[checked-icon]:hidden
            part-[base]:[--sl-color-primary-600:none]
            part-[base]:[--sl-color-neutral-0:var(--dark-grey)]
            aria-selected:part-[base]:[--sl-color-neutral-0:var(--purple)]
            group
            "
>
  {option.label}
  <span className="hidden group-aria-selected:inline">
              (Selected)
            </span>
</SlOption>
```

Others notes about it:
// incorrect css doesn't load with part-[]
// you are not notify in any way
// you can overwrite with tailwind classes and attribute and state on and off the elements
// for some reason I cannot reach the svg part
// normally select the shadow dom child element through the parent (use attribute and state to style it different) and style it with tailwind first. If it fails then overwrite the css variables

---- Default docs

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
