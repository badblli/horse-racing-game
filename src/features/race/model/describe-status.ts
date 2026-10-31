import { ROUND_DISTANCES } from '@/features/schedule/model/round'
import { formatRaceTime } from '@/shared/lib/format'

import type { RaceStatus } from './lifecycle'

export interface RaceStatusInput {
  readonly status: RaceStatus
  /** The round on the track, 1 to 6; null before a schedule exists. */
  readonly roundNumber: number | null
  /** The horse in front right now, while the round is running or paused. */
  readonly leaderName: string | null
  /** Set once the round on the track has a result. */
  readonly winner: { readonly name: string; readonly finishTime: number } | null
}

/** A sentence split into parts so horse names can be emphasised without markup in strings. */
export type StatusMessage = readonly { readonly text: string; readonly strong?: boolean }[]

const totalRounds = ROUND_DISTANCES.length

/** The visible status line. It follows the leader, so it may change many times a round. */
export function describeRaceStatus({
  status,
  roundNumber,
  leaderName,
  winner,
}: RaceStatusInput): StatusMessage {
  if (status === 'idle' || roundNumber === null) {
    return [{ text: 'Generate a schedule to draw ten horses for each of the six rounds.' }]
  }
  if (status === 'ready') return [{ text: 'Ready. Ten horses are at the start.' }]

  if (winner) {
    const name = { text: winner.name, strong: true }
    if (status === 'finished') {
      return [
        name,
        {
          text: ' wins the final round. All six rounds are complete; generate a new schedule to race again.',
        },
      ]
    }
    const time = formatRaceTime(winner.finishTime)
    return roundNumber < totalRounds
      ? [
          name,
          {
            text: ` wins round ${roundNumber} in ${time}. Round ${roundNumber + 1} lines up next.`,
          },
        ]
      : [name, { text: ` wins the final round in ${time}.` }]
  }

  const state = status === 'paused' ? 'Paused' : 'Racing'
  return leaderName
    ? [{ text: `${state} · ` }, { text: leaderName, strong: true }, { text: ' leads' }]
    : [{ text: state }]
}

/**
 * What screen readers hear. It changes only at milestones (schedule ready, round running,
 * paused, winner, all complete), never on a lead change.
 */
export function describeRaceAnnouncement({ status, roundNumber, winner }: RaceStatusInput): string {
  if (status === 'idle' || roundNumber === null) return ''
  if (status === 'finished') return 'All six rounds are complete.'
  if (status === 'ready') return `Schedule generated. Round ${roundNumber} is ready to start.`
  if (winner) {
    return `${winner.name} wins round ${roundNumber} in ${formatRaceTime(winner.finishTime)}.`
  }
  return status === 'paused' ? `Round ${roundNumber} paused.` : `Round ${roundNumber} is running.`
}
