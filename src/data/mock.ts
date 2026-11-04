export const org = { name: 'Kappa Theta Pi', type: 'Student organization', initials: 'KΘΠ' }
export const user = { name: 'Andrew John', role: 'Pledge', initials: 'AJ' }

export const semester = 'Spring 2026'

export const stats = {
  received: 11250,
  receivedChange: 18.4,
  committed: 15750,
  awaiting: 4500,
  activeRequests: 10,
  movedThisWeek: 4,
  allTime: 48650,
  sponsorCount: 32,
  goal: 20000,
}

export type FollowUp = {
  id: string
  company: string
  initials: string
  task: string
  due: string
  tone: 'today' | 'tomorrow' | 'later'
}

export const followUps: FollowUp[] = [
  { id: 'f1', company: 'Texas Instruments', initials: 'TI', task: 'Send revised Gold tier proposal', due: 'Due today', tone: 'today' },
  { id: 'f2', company: "Raising Cane's", initials: 'RC', task: 'Follow up with Jamie about catering', due: 'Due tomorrow', tone: 'tomorrow' },
  { id: 'f3', company: 'Capital Factory', initials: 'CF', task: 'Schedule intro call with Rachel', due: 'Fri, Apr 18', tone: 'later' },
]

export const pipeline = [
  { stage: 'Prospect', count: 2, amount: 7500, color: '#64748b' },
  { stage: 'Contacted', count: 2, amount: 1750, color: '#2563eb' },
  { stage: 'In talks', count: 2, amount: 5500, color: '#d97706' },
  { stage: 'Committed', count: 2, amount: 4500, color: '#7c3aed' },
  { stage: 'Received', count: 2, amount: 11250, color: '#16a34a' },
]

export const renewals = [
  { company: 'PepsiCo', initials: 'PE', gave: 2500, when: 'Fall 2025' },
  { company: 'State Farm', initials: 'SF', gave: 1000, when: 'Spring 2025' },
  { company: 'JPMorgan Chase', initials: 'JC', gave: 750, when: 'Fall 2025' },
]
export const renewalTotal = 6

export const navCounts = { pipeline: 10, partnerships: 2, followUps: 4 }