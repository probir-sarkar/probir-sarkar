import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'
import { contactData, mernStackSkills } from '#/data'
import { projects } from '#/data/project.data'

const getSkillsDef = toolDefinition({
  name: 'get_skills',
  description:
    "Get Probir Sarkar's skills grouped by category (Frontend, Backend, Database, AI / LLM, Other). Use this to answer any question about his skills, tech stack, or expertise.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .meta({
        description:
          'Optional category filter, e.g. "Frontend", "Backend", "Database", "AI / LLM", "Other"',
      }),
  }),
  outputSchema: z.object({
    categories: z.array(
      z.object({
        category: z.string(),
        skills: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
          }),
        ),
      }),
    ),
  }),
})

const getSkills = getSkillsDef.server(async ({ category }) => {
  const categories = mernStackSkills
    .filter(
      (c) =>
        !category ||
        c.category.toLowerCase().includes(category.toLowerCase()),
    )
    .map((c) => ({
      category: c.category,
      skills: c.skills.map(({ name, description }) => ({
        name,
        description,
      })),
    }))

  return { categories }
})

const getProjectsDef = toolDefinition({
  name: 'get_projects',
  description:
    "Get Probir Sarkar's projects with name, description, live URL, GitHub URL, and tech stack. Use this to answer any question about his projects or work. Optionally filter by technology.",
  inputSchema: z.object({
    stack: z.string().optional().meta({
      description: 'Optional technology filter, e.g. "Next.js", "AI SDK"',
    }),
  }),
  outputSchema: z.object({
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        github: z.string(),
        live: z.string(),
        stack: z.array(z.string()),
      }),
    ),
  }),
})

const getProjects = getProjectsDef.server(async ({ stack }) => {
  const filtered = projects.filter(
    (p) =>
      !stack ||
      p.stack.some((s) => s.toLowerCase().includes(stack.toLowerCase())),
  )

  return { projects: filtered }
})

const getContactDef = toolDefinition({
  name: 'get_contact',
  description:
    "Get Probir Sarkar's contact details: location, phone, email, and social links. Use this to answer any question about how to contact or reach him.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    location: z.string(),
    phone: z.string(),
    email: z.string(),
    socials: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
      }),
    ),
  }),
})

const getContact = getContactDef.server(async () => ({
  location: contactData.location,
  phone: contactData.phone,
  email: contactData.email,
  socials: contactData.socials.map(({ name, url }) => ({ name, url })),
}))

export const aiTools = [getSkills, getProjects, getContact]
