import { defineCollection, z } from "@nuxt/content"

const createEnum = (options: [string, ...string[]]) => z.enum(options)

const createBaseSchema = () =>
  z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
  })

const createLinkSchema = () =>
  z.object({
    label: z.string().nonempty(),
    to: z.string().nonempty(),
    icon: z.string().optional().editor({ input: "icon" }),
    size: createEnum(["xs", "sm", "md", "lg", "xl"]),
    trailing: z.boolean().optional(),
    target: createEnum(["_blank", "_self"]),
    color: createEnum([
      "primary",
      "secondary",
      "neutral",
      "error",
      "warning",
      "success",
      "info",
    ]),
    variant: createEnum([
      "solid",
      "outline",
      "subtle",
      "soft",
      "ghost",
      "link",
    ]),
  })

const createFeatureSchema = () =>
  createBaseSchema().extend({
    icon: z.string().editor({ input: "icon" }),
    ui: z
      .object({
        leading: z.string().optional(),
      })
      .editor({ hidden: true }),
  })

export const collections = {
  content: defineCollection({
    source: "index.yml",
    type: "page",
    schema: z.object({
      hero: z.object({
        links: z.array(createLinkSchema()),
      }),
      section: createBaseSchema().extend({
        headline: z.string().optional(),
        images: z.object({
          mobile: z.string().optional(),
          desktop: z.string().optional(),
        }),
        features: z.array(
          createBaseSchema().extend({
            icon: z.string().editor({ input: "icon" }),
          }),
        ),
      }),
      features: createBaseSchema().extend({
        features: z.array(createFeatureSchema()),
      }),
      steps: createBaseSchema().extend({
        items: z.array(
          createFeatureSchema().extend({
            image: z
              .object({
                light: z.string().editor({ input: "media" }),
                dark: z.string().editor({ input: "media" }),
              })
              .optional(),
          }),
        ),
      }),
      cta: createBaseSchema().extend({
        links: z.array(createLinkSchema()),
      }),
    }),
  }),
}
