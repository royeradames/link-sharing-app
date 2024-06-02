# Issues

## 404 on .svg. Next js tries to get them from the public file

cannot fix it with 

```tsx
// @ts-ignore
// import { setBasePath } from "@shoelace-style/shoelace/cdn/utilities/base-path.js"
import {
  getBasePath,
  setBasePath,
} from "@shoelace-style/shoelace/dist/utilities/base-path.js"
// import { setBasePath } from "@shoelace-style/shoelace/dist/assets/icons"

setBasePath("/@shoelace-style/shoelace/dist")
console.log(getBasePath())
// setBasePath("@/node_modules/@shoelace-style/shoelace/dist")
// setBasePath("@shoelace-style/shoelace/dist")
// setBasePath("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/")
```

https://shoelace.style/getting-started/installation/#setting-the-base-path

## Imports of sl elements are causing issues

If I'm able to copy and paste the elements into my project then I would have full access to them. That and the working solution for svg assets will be good enough for me to work. I can manually add them to my project. They would still be more than good enough and I can add the fixes I need. So they can work like a template more than anything else.

This means that every time I can the latest one I could be getting a improve one with bug fixes included or I can continue to use my old implementations. The main advantage is that I don't have to created from scratch for every new project, and things are standardized. 

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

## package json settings 
```json
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shoelace-style/shoelace/*": [
        "dist/react/*"
      ]
    },
    "typeRoots": [
      "./node_modules/@types",
      "./dist/react"
    ]
  },
  "include": [
    "src",
    "dist/react"
  ],
```

## Interesting way to style for ::part
`<sl-option class="&[aria-selected=“true”]:[&::part(base)]:bg-blue-500"></sl-option>`

[link to discussion](https://github.com/shoelace-style/shoelace/discussions/1969#discussioncomment-9584276)
# Lesson learns

## for now I'm getting 404 on images and I cannot set the base path to the correct path

I have to manually add the svg to next.js

I can get the images from the npm package assets icons
```tsx
import "@shoelace-style/shoelace/dist/assets/icons"
```
## setting font family

next.js way doesn't work due to the shadow dom but it can get all other normal tags.

Components need font family need to overwritten by :part or css variable

`[&::part(base)]:font-instrument-sans`

```tsx

/*
.button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
}

.button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition: var(--sl-transition-x-fast) styles-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
}

[--sl-input-font-family:'__Instrument_Sans_8f8cb2','__Instrument_Sans_Fallback_8f8cb2']
[&::part(base)]:[${instrumentSans.style}]
[&::part(base)]:font-instrument-sans
 */
```
```css
:root body {
    --sl-font-sans: 'Instrument Sans', "sans-serif";
}
```
https://shoelace.style/tokens/typography/
## best way to style sl-elements?

With tailwind and [] to run css

When the css variables become state and style name bound then they would be the best. Right now there name doesn't match what they do. Make it hard to look back at it again and know what its changing. Also not all properties have css variables.

```tsx

// css variables are not well enough implemented to only use them
// they are not state and style specific
// some styles don't even have css variables
// the css variables don't let you know what they do so it's hard to maintain
// tailwind is not enough. I need to have the :not so that active classes don't activate when the button is disabled. I don't seem to be able to do that with default tailwind but I can do it with css
// this none helpful css variables names makes styling to hard. I'm keeping tailwind easier name, and I'm just going to overwrite everything. I have to find a solution for :not
// solution: [&:not(:disabled)]:
// its extremely difficult to chain state like :active:enable
// it appears that the buttons are not enable they are using classes instead

/*
     styles-color: var(--sl-color-primary-600);
   border-color: var(--sl-color-primary-600);
   color: var(--sl-color-neutral-0);
   border-radius: var(--sl-input-border-radius-large);

       height: auto;
   min-height: var(--sl-input-height-large);
   font-size: var(--sl-button-font-size-large);
   line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);


.button--standard.button--primary {
   styles-color: var(--sl-color-primary-600);
   border-color: var(--sl-color-primary-600);
   color: var(--sl-color-neutral-0);
}

   .button--standard.button--primary:active:not(.button--disabled) {
   styles-color: #43386c;
   border-color: var(--sl-color-primary-600);
   color: var(--sl-color-neutral-0);

   .button--standard.button--primary:hover:not(.button--disabled) {
   styles-color: var(--sl-color-primary-500);
   border-color: var(--sl-color-primary-500);
   color: var(--sl-color-neutral-0);
}

[&::part(base):active:not(.button--disabled)]:bg-purple-hover
[&::part(base):active:enabled]:bg-purple-hover
}
  */
// export function Button({
//   children,
//   disabled,
//   className = "",
//   type = "button",
//   variant = "primary",
//   size = "large",
// }: TButton) {
//
//   return (
//     <SlButton
//       variant="primary"
//       disabled={disabled}
//       outline={variant === "secondary"}
//       size={size}
//       type={type}
//       className={clsx(
//         "[--sl-input-border-radius-large:0.5rem] [--sl-color-primary-600:var(--purple)] [----sl-color-neutral-0:var(--white)] [--sl-color-primary-500:var(--purple)] group [&::part(base):active]:bg-purple-hover [&::part(base):disabled]:bg-purple",
//         {
//           "  ": variant === "primary",
//           [styles.radixSecondary]: variant === "secondary",
//           [className]: className,
//         }
//       )}
//     >
//       {children}
//     </SlButton>
//   )
// }

// note that using tailwind classes over overwritting css variables is causing the functionality to break. so the dynamic classes are completely overwritting and its making me having to remake more styles that I normally want. When it comes to handling the states like hover active and disabled
```

## For some reason the sl-button are not activating the :enable

run the disabled style base on the sl-button disabled attribute

`[&[disabled]::part(base)]:bg-purple/25`

https://github.com/shoelace-style/shoelace/discussions/2049

## The correct way to import shoelace component is next.js

> SlTab can be replace with the React name of the sl element
```tsx
const SlTab = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlTab),
  {
    ssr: false,
  }
)
```

> Avoid build issues.
https://github.com/shoelace-style/shoelace/discussions/2047
https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr
## Fix sl npm package imports

Just make sure you are importing from dist instead of cdn

```tsx
//do
import { SlButton, SlSelect } from "@shoelace-style/shoelace/dist/react"
//don't
import { SlButton, SlSelect } from "@shoelace-style/shoelace/cdn/react"

```

Also solves the issues with the SlIcon.

## Loading icon svg

https://github.com/shoelace-style/shoelace/discussions/2043

## previous demo page

```tsx
 <FormDemo />
<Heading as="h1">Royer Adames</Heading>
<Heading as="h1" size="small">
  Royer Adames
</Heading>
<Text>Body Medium Royer Adames</Text>
<Text size="small">Body small Royer Adames</Text>
<ButtonRadix>Primary ButtonRadix</ButtonRadix>
<ButtonRadix disabled>Primary disable ButtonRadix</ButtonRadix>
<ButtonRadix variant="secondary">Secondary ButtonRadix</ButtonRadix>
<ButtonRadix variant="secondary" disabled>
  Secondary disable ButtonRadix
</ButtonRadix>
<Nav></Nav>
<Nav></Nav>
```

## First translate to css then tailwind 

Due to it being more support for css and having to use arbitrary values

## DropdownOld

### tailwind using ::part

Using arbitrary 

```
[&::part(base)]
```

With plugin (for tailwind config)
```
plugins: [
    plugin(function ({ matchVariant, e }) {
    matchVariant("part", placeholder => `&::part(${placeholder})`)
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
  placeholder={option.placeholder}
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
