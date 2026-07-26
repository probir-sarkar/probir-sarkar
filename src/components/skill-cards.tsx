"use client";
import React from "react";
import { IconContext } from "react-icons";
import { mernStackSkills, Skill } from "@/data/index";

import { Tabs } from "@heroui/react";

import { motion } from "motion/react";

const SkillCards = () => {
  const allSkills = mernStackSkills.flatMap((skillCategory) => skillCategory.skills);
  const finalSkills = [{ category: "All", skills: allSkills }, ...mernStackSkills];
  return (
    <IconContext.Provider value={{ size: "1.2em", className: "flex-none" }}>
      <div className="2xl:w-10/12 w-11/12 mx-auto dark">
        <Tabs className="flex justify-center" variant="secondary" defaultSelectedKey="0">
          <Tabs.ListContainer className="xl:w-6/12 w-full mx-auto">
            <Tabs.List aria-label="Skills">
              {finalSkills.map((skillCategory, index) => (
                <Tabs.Tab key={index} id={String(index)}>
                  {skillCategory.category}
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {finalSkills.map((skillCategory, index) => (
            <Tabs.Panel key={index} id={String(index)}>
              <SkillCardList skills={skillCategory.skills} />
            </Tabs.Panel>
          ))}
        </Tabs>
      </div>
    </IconContext.Provider>
  );
};

export default SkillCards;

const SkillCardList = ({ skills }: { skills: Skill[] }) => {
  return (
    <div className="w-full grid gap-4 xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mt-8">
      {skills.map((skill, index) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: "linear", delay: index * 0.05 }}
          key={skill.name}
        >
          <div className="w-full h-full p-4 rounded-2xl bg-slate-900 hover:bg-secondary/75 border border-gray-800 hover:border-primary transition-all ease-in-out duration-200 cursor-pointer ">
            <div className="flex items-center gap-2 ">
              <div className="rounded-full p-2 bg-primary/25 text-primary">{<skill.icon />}</div>
              <p className="text-xl font-semibold">{skill.name}</p>
            </div>
            <div className="mt-5">
              <p className="text-gray-300">{skill.description || "No description available"}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
