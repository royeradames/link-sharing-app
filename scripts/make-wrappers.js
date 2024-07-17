import { generateReactWrappers } from "custom-element-react-wrappers"
import manifest from "@shoelace-style/shoelace/dist/custom-elements.json" assert { type: "json" }

generateReactWrappers(manifest, {
  outdir: "shoelace-wrappers",
  modulePath: (className, tagName) =>
    `@shoelace-style/shoelace/dist/components/${tagName.replace("sl-", "")}/${tagName.replace("sl-", "")}.js`,
  defaultExport: true,
  /**
   * Required for build to work
   * Causes lag on reload
   * An important note is that in order to make this work, the wrapper generation configuration must have the `ssrSafe` property set to `true`. This will allow the components to register and execute when the client is ready.
   */
  ssrSafe: true,
  // todo: fix SlTreeItem auto build issue. For now skip it.
  exclude: ["SlTreeItem"],
})
