export interface UserProgress {
  recipesLearned: number
  minutesPracticed: number
  techniquesMastered: number
}

const defaultProgress: UserProgress = {
  recipesLearned: 0,
  minutesPracticed: 0,
  techniquesMastered: 0
}

export const getProgress = (): UserProgress => {
  if (typeof window === 'undefined') {
    return defaultProgress
  }

  const saved = localStorage.getItem('dishcovery-progress')

  return saved
    ? JSON.parse(saved)
    : defaultProgress
}

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem(
    'dishcovery-progress',
    JSON.stringify(progress)
  )
}

export const addRecipeLearned = () => {
  const progress = getProgress()

  progress.recipesLearned += 1

  saveProgress(progress)
}

export const addTechniqueMastered = () => {
  const progress = getProgress()

  progress.techniquesMastered += 1

  saveProgress(progress)
}

export const addPracticeMinutes = (minutes: number) => {
  const progress = getProgress()

  progress.minutesPracticed += Math.round(minutes)

  saveProgress(progress)
}