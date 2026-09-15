import {
  getContactDefinition,
  getProjectsDefinition,
  getSkillsDefinition,
} from './chat-tools'
import { contactData, mernStackSkills } from '#/data'
import { projects } from '#/data/project.data'

const getSkills = getSkillsDefinition.server(async ({ category }) => {
  const categories = mernStackSkills
    .filter(
      (c) =>
        !category || c.category.toLowerCase().includes(category.toLowerCase()),
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

const getProjects = getProjectsDefinition.server(async ({ stack }) => {
  const filtered = projects.filter(
    (p) =>
      !stack ||
      p.stack.some((s) => s.toLowerCase().includes(stack.toLowerCase())),
  )

  return { projects: filtered }
})

const getContact = getContactDefinition.server(async () => ({
  location: contactData.location,
  phone: contactData.phone,
  email: contactData.email,
  socials: contactData.socials.map(({ name, url }) => ({ name, url })),
}))

export const aiTools = [getSkills, getProjects, getContact]
