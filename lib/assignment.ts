import { prisma } from './prisma'
import { AssignmentType, PartnerStatus } from '@prisma/client'

/**
 * Round Robin Assignment Logic
 * Finds the best available Strategic Partner for a new request
 */
export async function assignRequestToPartner(
  teamId: string,
  referralCode?: string
): Promise<{ partnerId: string; assignmentType: AssignmentType } | null> {
  
  // Scenario 1: Referral code provided - direct assignment
  if (referralCode) {
    const partner = await prisma.strategicPartner.findUnique({
      where: { referralCode }
    })

    if (partner && partner.teamId === teamId && partner.status === PartnerStatus.Active) {
      // Even if they're full, allow referral assignments
      return {
        partnerId: partner.id,
        assignmentType: AssignmentType.Referral
      }
    }
    
    // Invalid referral code - fall through to Round Robin
    console.warn(`Invalid referral code: ${referralCode}`)
  }

  // Scenario 2: Round Robin assignment
  const availablePartners = await prisma.strategicPartner.findMany({
    where: {
      teamId,
      status: PartnerStatus.Active,
      slotsUsed: { lt: 3 } // Not full
    },
    orderBy: [
      { slotsUsed: 'asc' },        // Priority 1: Fewest slots used
      { lastAssigned: 'asc' }      // Priority 2: Longest time since last assignment
    ]
  })

  if (availablePartners.length === 0) {
    console.error('No available Strategic Partners for Round Robin assignment')
    return null
  }

  return {
    partnerId: availablePartners[0].id,
    assignmentType: AssignmentType.Auto
  }
}

/**
 * Update Strategic Partner after assignment
 */
export async function updatePartnerAfterAssignment(partnerId: string) {
  const partner = await prisma.strategicPartner.findUnique({
    where: { id: partnerId }
  })

  if (!partner) return

  const newSlotsUsed = partner.slotsUsed + 1
  const newStatus = newSlotsUsed >= 3 ? PartnerStatus.Full : partner.status

  await prisma.strategicPartner.update({
    where: { id: partnerId },
    data: {
      slotsUsed: newSlotsUsed,
      status: newStatus,
      lastAssigned: new Date(),
      totalAssigned: partner.totalAssigned + 1
    }
  })
}

/**
 * Free up a slot when request is completed/cancelled
 */
export async function freePartnerSlot(partnerId: string) {
  const partner = await prisma.strategicPartner.findUnique({
    where: { id: partnerId }
  })

  if (!partner || partner.slotsUsed === 0) return

  const newSlotsUsed = partner.slotsUsed - 1
  const newStatus = newSlotsUsed < 3 ? PartnerStatus.Active : partner.status

  await prisma.strategicPartner.update({
    where: { id: partnerId },
    data: {
      slotsUsed: newSlotsUsed,
      status: newStatus
    }
  })
}
