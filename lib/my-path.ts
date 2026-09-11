export const stages = ['grade_10', 'plus_two', 'bachelor', 'graduate', 'parent'] as const
export type PathStage = (typeof stages)[number]

export type PathTaskTemplate = {
  key: string
  title: string
  href: string
  action: string
}

export const pathStages: Record<PathStage, { label: string; description: string; levels: string[] }> = {
  grade_10: { label: 'Grade 10 / SEE', description: 'Choose your +2, diploma or technical route.', levels: ['+2', 'plus_two', 'diploma', 'certificate'] },
  plus_two: { label: '+2 student', description: 'Plan a Bachelor, entrance or scholarship.', levels: ['bachelor', 'diploma'] },
  bachelor: { label: 'Bachelor student', description: 'Build skills, experience and your next step.', levels: ['master', 'postgraduate'] },
  graduate: { label: 'Graduate', description: 'Explore work, skills and further study.', levels: ['master', 'postgraduate', 'mphil', 'phd'] },
  parent: { label: 'Parent / guardian', description: 'Plan choices and costs with your student.', levels: [] },
}

export const pathTasks: Record<PathStage, PathTaskTemplate[]> = {
  grade_10: [
    { key: 'compare-plus-two', title: 'Shortlist +2, diploma or technical options', href: '/colleges?level=%2B2', action: 'Explore options' },
    { key: 'check-see-results', title: 'Keep SEE result and certificate details ready', href: '/tools/admission-checklist', action: 'Open checklist' },
    { key: 'review-cost', title: 'Discuss fees, travel and scholarship options at home', href: '/tools/college-cost-calculator', action: 'Plan costs' },
  ],
  plus_two: [
    { key: 'choose-program', title: 'Compare programs that match your interests', href: '/tools/program-finder', action: 'Find a program' },
    { key: 'check-entrance', title: 'Check entrance requirements and deadlines', href: '/entrance-exams', action: 'Check entrances' },
    { key: 'save-scholarships', title: 'Save scholarships before their closing dates', href: '/scholarships', action: 'View scholarships' },
  ],
  bachelor: [
    { key: 'build-portfolio', title: 'Start one project, portfolio or practical skill', href: '/study-resources', action: 'Build a skill' },
    { key: 'find-experience', title: 'Look for an internship, volunteer role or competition', href: '/opportunities', action: 'Find experience' },
    { key: 'review-next-step', title: 'Review career or further-study options', href: '/careers', action: 'Explore careers' },
  ],
  graduate: [
    { key: 'clarify-goal', title: 'Choose your next focus: work, skills or further study', href: '/careers', action: 'Compare routes' },
    { key: 'prepare-profile', title: 'Prepare a simple CV and a work sample', href: '/study-resources', action: 'Find guidance' },
    { key: 'find-opportunity', title: 'Find a verified opportunity or skills programme', href: '/opportunities', action: 'View opportunities' },
  ],
  parent: [
    { key: 'talk-goals', title: 'Have a goals and interests conversation with your student', href: '/careers', action: 'Explore together' },
    { key: 'compare-options', title: 'Compare at least two realistic institutions or routes', href: '/compare', action: 'Compare colleges' },
    { key: 'plan-budget', title: 'Use the cost planner before making a decision', href: '/tools/college-cost-calculator', action: 'Plan the budget' },
  ],
}

export function isPathStage(value: unknown): value is PathStage {
  return typeof value === 'string' && (stages as readonly string[]).includes(value)
}

export function levelFitsStage(stage: PathStage | null, level: string | null | undefined) {
  if (!stage || stage === 'parent') return true
  const normalised = (level || '').toLowerCase().replaceAll(' ', '_')
  return pathStages[stage].levels.some(value => normalised.includes(value.toLowerCase()))
}

export function taskForStage(stage: PathStage, key: string) {
  return pathTasks[stage].find(task => task.key === key)
}
